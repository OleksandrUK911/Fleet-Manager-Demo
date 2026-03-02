# main.py — FastAPI application entry point

import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import inspect, text

from .database import engine, SessionLocal
from .models import Base, Vehicle, Position, GeofenceZone
from .rate_limit import limiter
from .schemas import VehicleOut
from .routers import vehicles
from .routers import auth as auth_router
from .routers import geofence as geofence_router

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("fleet_manager")

# ─── Create all database tables on startup ───────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── Idempotent schema migration: add current_speed if missing ───────────────
try:
    _inspector = inspect(engine)
    _cols = [c["name"] for c in _inspector.get_columns("vehicles")]
    if "current_speed" not in _cols:
        with engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE vehicles ADD COLUMN current_speed FLOAT DEFAULT 0.0"))
            _conn.commit()
        logger.info("Migration: added 'current_speed' column to vehicles table")
    if "notes" not in _cols:
        with engine.connect() as _conn:
            _conn.execute(text("ALTER TABLE vehicles ADD COLUMN notes VARCHAR(500)"))
            _conn.commit()
        logger.info("Migration: added 'notes' column to vehicles table")
except Exception as _err:
    logger.warning("Migration check skipped: %s", _err)


# ─── App lifespan: startup / shutdown tasks ───────────────────────────────────
@asynccontextmanager
async def lifespan(application: FastAPI):  # noqa: ARG001
    """Run startup jobs, yield to serve requests, then run shutdown jobs."""
    # ── startup ──────────────────────────────────────────────────────────────
    asyncio.create_task(_cleanup_old_positions())
    logger.info(
        "Background cleanup task started (retention: %s days)",
        os.getenv("POSITION_RETENTION_DAYS", "30"),
    )
    _seed_demo_geofences()
    # ─────────────────────────────────────────────────────────────────────────
    yield
    # ── shutdown (nothing needed — asyncio tasks are cancelled automatically) ─


# ─── Initialize FastAPI app ───────────────────────────────────────────────────
app = FastAPI(
    title="Fleet Manager API",
    description="REST API for real-time and historical vehicle tracking",
    version="1.0.0",
    docs_url="/api/docs",       # Swagger UI at /api/docs
    redoc_url="/api/redoc",     # ReDoc UI at /api/redoc
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)
# Attach limiter to app state; register 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# ─── CORS Middleware ──────────────────────────────────────────────────────────
# CORS_ORIGINS env var (comma-separated) takes precedence over the default list.
# Set it in Railway/VPS .env to allow only your actual frontend origins.
_cors_env = os.getenv("CORS_ORIGINS", "")
_cors_origins = (
    [o.strip() for o in _cors_env.split(",") if o.strip()]
    if _cors_env
    else [
        "http://localhost:3000",                              # CRA dev server
        "http://localhost:5173",                              # Vite dev server
        "http://localhost:7767",                              # Backend itself
        "https://oleksandruk911.github.io",                  # GitHub Pages (landing)
        "http://fleet-manager-demo.skakun-ml.com",           # VPS (HTTP)
        "https://fleet-manager-demo.skakun-ml.com",          # VPS (HTTPS)
    ]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routers ─────────────────────────────────────────────────────────
# Mount all vehicle routes under /api/vehicles
app.include_router(vehicles.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")
app.include_router(geofence_router.router, prefix="/api")


# ─── Security Headers Middleware ──────────────────────────────────────────────

_CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline'; "                              # Swagger UI requires inline scripts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.tile.openstreetmap.fr; "
    "connect-src 'self' ws://localhost:7767 ws://fleet-manager-demo.skakun-ml.com wss://fleet-manager-demo.skakun-ml.com wss:; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach security-related HTTP headers to every response."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("Content-Security-Policy", _CSP)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ─── Request logging middleware ───────────────────────────────────────────────
class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        ms = (time.perf_counter() - start) * 1000
        logger.info("%s  %s  %d  %.1fms", request.method, request.url.path,
                    response.status_code, ms)
        return response


app.add_middleware(RequestLogMiddleware)


# ─── Startup: background position-cleanup task ────────────────────────────
async def _cleanup_old_positions():
    """
    Runs every hour and deletes GPS positions older than CLEANUP_DAYS days.
    Keeps the positions table from growing unboundedly in long-running instances.
    CLEANUP_DAYS is read from the POSITION_RETENTION_DAYS env var (default 30).
    """
    import os
    retention_days = int(os.getenv("POSITION_RETENTION_DAYS", "30"))
    while True:
        await asyncio.sleep(3600)   # wait 1 hour between runs
        cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
        try:
            db = SessionLocal()
            deleted = db.query(Position).filter(Position.timestamp < cutoff).delete()
            db.commit()
            db.close()
            if deleted:
                logger.info("Cleanup: removed %d positions older than %d days", deleted, retention_days)
        except Exception as exc:
            logger.warning("Cleanup task error: %s", exc)


def _seed_demo_geofences() -> None:
    """Insert 3 London demo geofence zones if none exist yet."""
    _DEMO_ZONES = [
        {
            "name": "Depot — Canary Wharf", "latitude": 51.5055, "longitude": -0.0235,
            "radius_m": 600, "color": "#1565c0", "description": "Main vehicle depot",
        },
        {
            "name": "Service Centre", "latitude": 51.524, "longitude": -0.088,
            "radius_m": 400, "color": "#e65100", "description": "Maintenance & repair hub",
        },
        {
            "name": "City Drop-off Zone", "latitude": 51.516, "longitude": -0.119,
            "radius_m": 350, "color": "#2e7d32", "description": "Central London delivery zone",
        },
    ]
    db = SessionLocal()
    try:
        if db.query(GeofenceZone).count() == 0:
            for z in _DEMO_ZONES:
                db.add(GeofenceZone(**z))
            db.commit()
            logger.info("Seeded %d demo geofence zones", len(_DEMO_ZONES))
    except Exception as exc:
        logger.warning("Geofence seed error: %s", exc)
    finally:
        db.close()


# ─── Health Check Endpoint ───────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health_check():
    """Simple health check endpoint for load balancers and monitoring."""
    return {"status": "ok", "service": "fleet-manager-api"}


# ─── WebSocket: real-time vehicle positions (delta updates) ───────────────────
@app.websocket("/api/ws/positions")
async def ws_positions(websocket: WebSocket):
    """
    Push vehicle position updates to the client every 5 seconds.

    Protocol (all messages are JSON objects):
      - First message:             {"type": "full",      "vehicles": [...all active vehicles...]}
      - Subsequent (if changed):   {"type": "delta",     "vehicles": [...only changed vehicles...]}
      - Subsequent (no change):    {"type": "heartbeat", "ts": "<iso-timestamp>"}

    'Changed' means the vehicle's lat/lng, speed, or status differs from the
    previous broadcast. This reduces bandwidth when the fleet is stationary.
    """
    await websocket.accept()
    prev_fingerprints: dict = {}   # vehicle_id -> "lat,lng,speed,status" string

    def _fingerprint(vehicle_dict: dict) -> str:
        lat = vehicle_dict.get("current_lat") or 0.0
        lng = vehicle_dict.get("current_lng") or 0.0
        spd = vehicle_dict.get("current_speed") or 0.0
        return f"{lat:.5f},{lng:.5f},{spd:.1f},{vehicle_dict.get('status', '')}"

    try:
        first_send = True
        while True:
            db = SessionLocal()
            try:
                rows = db.query(Vehicle).filter(Vehicle.is_active).all()
                current_data: dict[int, dict] = {
                    v.id: VehicleOut.model_validate(v).model_dump(mode="json")
                    for v in rows
                }
            finally:
                db.close()

            current_fps = {
                vid: _fingerprint(d) for vid, d in current_data.items()
            }

            if first_send:
                # Always send the full payload on connection open so the client
                # can initialise its state without needing a separate HTTP call.
                msg: dict = {"type": "full", "vehicles": list(current_data.values())}
                first_send = False
            else:
                changed = [
                    current_data[vid]
                    for vid, fp in current_fps.items()
                    if prev_fingerprints.get(vid) != fp
                ]
                if changed:
                    msg = {"type": "delta", "vehicles": changed}
                else:
                    msg = {"type": "heartbeat", "ts": datetime.now(timezone.utc).isoformat()}

            prev_fingerprints = current_fps
            await websocket.send_json(msg)
            await asyncio.sleep(5)
    except (WebSocketDisconnect, Exception):
        pass


# ─── Root Redirect ────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    """Redirect root to API docs."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/api/docs")


# ─── Serve Admin SPA (Railway / single-server deployment) ─────────────────────
# When deployed to Railway the build step copies frontend/build → backend/static/frontend/.
# The app then serves:
#   /app/static/**  — hashed JS/CSS assets (immutable cache)
#   /app/**         — SPA shell (index.html) for all client-side React routes
# This block is a no-op locally and in CI where the build dir doesn't exist.
import pathlib
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse as _FileResponse

_FRONTEND_BUILD = pathlib.Path(__file__).parent.parent / "static" / "frontend"

if _FRONTEND_BUILD.exists():
    app.mount(
        "/app/static",
        StaticFiles(directory=_FRONTEND_BUILD / "static"),
        name="admin-static",
    )

    @app.get("/app", include_in_schema=False)
    @app.get("/app/", include_in_schema=False)
    async def _serve_admin_root():
        return _FileResponse(_FRONTEND_BUILD / "index.html")

    @app.get("/app/{path:path}", include_in_schema=False)
    async def _serve_admin_spa(path: str):  # noqa: ARG001
        """Return the SPA shell for all client-side React routes under /app/."""
        return _FileResponse(_FRONTEND_BUILD / "index.html")

    logger.info("Admin SPA mounted at /app/ from %s", _FRONTEND_BUILD)
else:
    logger.info("No frontend build found at %s — skipping admin SPA mount", _FRONTEND_BUILD)
