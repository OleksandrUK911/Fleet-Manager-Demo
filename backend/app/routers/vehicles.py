# routers/vehicles.py — API route handlers for vehicle-related endpoints

import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from itertools import groupby

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, require_admin

# Create a router with /vehicles prefix and tag for Swagger grouping
router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


# ─── Haversine distance helper ────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in km between two (lat, lon) points."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── GET /vehicles ────────────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.VehicleOut])
def list_vehicles(
    skip: int = Query(0, ge=0, description="Number of records to skip (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    status: Optional[str] = Query(None, description="Filter by status: active, inactive, maintenance"),
    search: Optional[str] = Query(None, description="Search by vehicle name or license plate"),
    db: Session = Depends(get_db),
):
    """
    Return all registered vehicles with their current positions.
    Optionally filter by status or search by name/plate. Supports pagination.
    """
    q = db.query(models.Vehicle).filter(models.Vehicle.is_active)
    if status:
        q = q.filter(models.Vehicle.status == status)
    if search:
        term = f"%{search.lower()}%"
        q = q.filter(
            func.lower(models.Vehicle.name).like(term)
            | func.lower(models.Vehicle.license_plate).like(term)
        )
    return q.offset(skip).limit(limit).all()


# ─── GET /vehicles/stats ──────────────────────────────────────────────────────

@router.get("/stats", tags=["Vehicles"])
def get_fleet_stats(db: Session = Depends(get_db)):
    """
    Return KPI summary counts: total / active / inactive / maintenance.
    Used by the frontend KPI bar at the top of the dashboard.
    """
    total       = db.query(models.Vehicle).filter(models.Vehicle.is_active).count()
    active      = db.query(models.Vehicle).filter(models.Vehicle.is_active, models.Vehicle.status == "active").count()
    inactive    = db.query(models.Vehicle).filter(models.Vehicle.is_active, models.Vehicle.status == "inactive").count()
    maintenance = (
        db.query(models.Vehicle)
        .filter(models.Vehicle.is_active, models.Vehicle.status == "maintenance")
        .count()
    )
    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "maintenance": maintenance,
    }


# ─── GET /vehicles/stats/activity ────────────────────────────────────────────

@router.get("/stats/activity", tags=["Vehicles"])
def get_fleet_activity(db: Session = Depends(get_db)):
    """
    Return hourly position counts for the last 24 hours.
    Used by the dashboard activity bar chart.
    Each entry: { "hour": "14:00", "count": 42 }
    """
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    timestamps = [
        row[0]
        for row in db.query(models.Position.timestamp)
        .filter(models.Position.timestamp >= since)
        .all()
    ]

    def _ensure_tz(dt):
        return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt

    now = datetime.now(timezone.utc)
    result = []
    for i in range(23, -1, -1):
        bstart = now - timedelta(hours=i + 1)
        bend = now - timedelta(hours=i)
        count = sum(1 for ts in timestamps if bstart <= _ensure_tz(ts) < bend)
        result.append({"hour": bend.strftime("%H:00"), "count": count})
    return result


# ─── GET /vehicles/stats/top-active ───────────────────────────────────────────────────────────────

@router.get("/stats/top-active", tags=["Vehicles"])
def get_top_active(
    limit: int = Query(5, ge=1, le=20, description="Number of vehicles to return"),
    hours: int = Query(24, ge=1, le=168, description="Lookback window in hours"),
    db: Session = Depends(get_db),
):
    """
    Return top N vehicles ranked by the number of GPS position records
    recorded within the last `hours` hours.
    Each entry: { id, name, license_plate, status, position_count }
    """
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    rows = (
        db.query(
            models.Vehicle.id,
            models.Vehicle.name,
            models.Vehicle.license_plate,
            models.Vehicle.status,
            func.count(models.Position.id).label("position_count"),
        )
        .join(models.Position, models.Position.vehicle_id == models.Vehicle.id)
        .filter(
            models.Vehicle.is_active,
            models.Position.timestamp >= since,
        )
        .group_by(models.Vehicle.id)
        .order_by(func.count(models.Position.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id":             r.id,
            "name":           r.name,
            "license_plate":  r.license_plate,
            "status":         r.status,
            "position_count": r.position_count,
        }
        for r in rows
    ]


# ─── GET /vehicles/stats/distance ────────────────────────────────────────────

@router.get("/stats/distance", tags=["Vehicles"])
def get_fleet_distance(db: Session = Depends(get_db)):
    """
    Return total km driven today (UTC) across all active vehicles.
    Computed using the Haversine formula on consecutive position records per vehicle.
    Response: { total_km, vehicle_count }
    """
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    rows = (
        db.query(
            models.Position.vehicle_id,
            models.Position.latitude,
            models.Position.longitude,
            models.Position.timestamp,
        )
        .join(models.Vehicle, models.Vehicle.id == models.Position.vehicle_id)
        .filter(
            models.Vehicle.is_active,
            models.Position.timestamp >= today_start,
        )
        .order_by(models.Position.vehicle_id, models.Position.timestamp.asc())
        .all()
    )

    total_km = 0.0
    vehicle_ids: set = set()
    for vid, points in groupby(rows, key=lambda r: r.vehicle_id):
        vehicle_ids.add(vid)
        pts = list(points)
        for i in range(1, len(pts)):
            total_km += _haversine_km(
                pts[i - 1].latitude, pts[i - 1].longitude,
                pts[i].latitude, pts[i].longitude,
            )

    return {
        "total_km": round(total_km, 2),
        "vehicle_count": len(vehicle_ids),
    }


# ─── GET /vehicles/stats/overspeed ───────────────────────────────────────────

@router.get("/stats/overspeed", tags=["Vehicles"])
def get_overspeed_vehicles(
    threshold: float = Query(
        80.0, ge=1.0, le=250.0, description="Speed threshold in km/h"
    ),
    db: Session = Depends(get_db),
):
    """
    Return active vehicles whose current_speed exceeds `threshold` km/h.
    Response: { count, threshold, vehicles: [{id, name, license_plate, current_speed}] }
    """
    vehicles = (
        db.query(models.Vehicle)
        .filter(
            models.Vehicle.is_active,
            models.Vehicle.current_speed >= threshold,
        )
        .order_by(models.Vehicle.current_speed.desc())
        .all()
    )
    return {
        "count": len(vehicles),
        "threshold": threshold,
        "vehicles": [
            {
                "id":            v.id,
                "name":          v.name,
                "license_plate": v.license_plate,
                "current_speed": round(v.current_speed or 0, 1),
                "status":        v.status,
            }
            for v in vehicles
        ],
    }


# ─── GET /vehicles/heatmap ──────────────────────────────────────────────────────

@router.get("/heatmap", tags=["Vehicles"])
def get_fleet_heatmap(
    hours: int = Query(24, ge=1, le=72, description="History window in hours"),
    limit: int = Query(3000, ge=100, le=10000, description="Max position records"),
    db: Session = Depends(get_db),
):
    """
    Return a flat list of [latitude, longitude, intensity] triples for all
    vehicle positions recorded in the last `hours` hours.  Intensity is
    speed normalised to [0.0, 1.0] capped at 80 km/h.
    Intended for consumption by the Leaflet.heat frontend overlay.
    """
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    positions = (
        db.query(
            models.Position.latitude,
            models.Position.longitude,
            models.Position.speed,
        )
        .filter(
            models.Position.timestamp >= since,
            models.Position.latitude.isnot(None),
            models.Position.longitude.isnot(None),
        )
        .order_by(models.Position.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        [float(p.latitude), float(p.longitude), round(min(1.0, (p.speed or 0) / 80.0), 3)]
        for p in positions
    ]


@router.post("/", response_model=schemas.VehicleOut, status_code=201)
def create_vehicle(payload: schemas.VehicleCreate, db: Session = Depends(get_db), _: dict = Depends(get_current_user)):
    """
    Register a new vehicle in the fleet.
    Returns 409 if license plate already exists.
    """
    existing = db.query(models.Vehicle).filter(
        models.Vehicle.license_plate == payload.license_plate
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"License plate '{payload.license_plate}' already registered")

    vehicle = models.Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


# ─── GET /vehicles/{vehicle_id} ───────────────────────────────────────────────

@router.get("/{vehicle_id}", response_model=schemas.VehicleDetail)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Return detailed information about a single vehicle, including
    its 20 most recent position records.
    """
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    vehicle.positions = (
        db.query(models.Position)
        .filter(models.Position.vehicle_id == vehicle_id)
        .order_by(models.Position.timestamp.desc())
        .limit(20)
        .all()
    )
    return vehicle


# ─── PATCH /vehicles/{vehicle_id} ────────────────────────────────────────────

@router.patch("/{vehicle_id}", response_model=schemas.VehicleOut)
def update_vehicle(
    vehicle_id: int,
    payload: schemas.VehicleUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    """
    Partially update a vehicle's details (name, plate, model, status, is_active).
    Only the fields present in the request body will be updated.
    """
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    # Check for plate conflicts if license_plate is being changed
    if payload.license_plate and payload.license_plate != vehicle.license_plate:
        conflict = db.query(models.Vehicle).filter(
            models.Vehicle.license_plate == payload.license_plate
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail=f"License plate '{payload.license_plate}' already taken")

    # Apply only the provided fields (exclude_unset=True skips None fields)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


# ─── DELETE /vehicles/{vehicle_id} ───────────────────────────────────────────

@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: dict = Depends(require_admin)):
    """
    Soft-delete a vehicle (sets is_active=False).
    The vehicle and its history remain in the database but won't appear in listings.
    """
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    vehicle.is_active = False
    db.commit()


# ─── GET /vehicles/{vehicle_id}/history ──────────────────────────────────────

@router.get("/{vehicle_id}/history", response_model=List[schemas.PositionOut])
def get_vehicle_history(
    vehicle_id: int,
    hours: int = Query(24, ge=1, le=168, description="Hours of history (max 7 days)"),
    limit: int = Query(500, ge=1, le=2000, description="Max position records"),
    from_dt: Optional[str] = Query(None, description="ISO datetime start (overrides hours)"),
    to_dt: Optional[str] = Query(None, description="ISO datetime end (default: now)"),
    db: Session = Depends(get_db),
):
    """
    Return historical GPS positions for a vehicle, ordered chronologically.
    Use `from_dt` / `to_dt` (ISO 8601) for explicit ranges, or `hours` for
    a rolling window relative to now.
    """
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found")

    if from_dt:
        try:
            since = datetime.fromisoformat(from_dt.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid from_dt format — use ISO 8601")
    else:
        since = datetime.now(timezone.utc) - timedelta(hours=hours)

    if to_dt:
        try:
            until = datetime.fromisoformat(to_dt.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid to_dt format — use ISO 8601")
        filters = [
            models.Position.vehicle_id == vehicle_id,
            models.Position.timestamp >= since,
            models.Position.timestamp <= until,
        ]
    else:
        filters = [
            models.Position.vehicle_id == vehicle_id,
            models.Position.timestamp >= since,
        ]

    return (
        db.query(models.Position)
        .filter(*filters)
        .order_by(models.Position.timestamp.asc())
        .limit(limit)
        .all()
    )


# ─── (end of router) ──────────────────────────────────────────────────────────
