# Vehicles API

> REST endpoints for vehicles: CRUD, search, stats, heatmap.
> Router: `backend/app/routers/vehicles.py`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Core CRUD
- ✅ `GET /api/vehicles` — list all vehicles, supports `?skip=` / `?limit=` pagination
- ✅ `GET /api/vehicles/{id}` — single vehicle details
- ✅ `GET /api/vehicles/{id}/history` — GPS history with time-range filter
- ✅ `POST /api/vehicles` — create new vehicle (admin only)
- ✅ `PATCH /api/vehicles/{id}` — update name, plate, model, status, notes
- ✅ `DELETE /api/vehicles/{id}` — soft-delete (`is_active = false`)

### Search & Filter
- ✅ `GET /api/vehicles?search=` — case-insensitive search by name or plate number

### Stats & Analytics
- ✅ `GET /api/vehicles/stats` — KPI counters: total / active / inactive / maintenance
- ✅ `GET /api/vehicles/stats/top-active` — top N vehicles by position count today
- ✅ `GET /api/vehicles/stats/distance` — total fleet km today (Haversine formula)
- ✅ `GET /api/vehicles/stats/overspeed?threshold=80` — vehicles exceeding speed limit (validated: 1–250 km/h)
- ✅ `GET /api/vehicles/heatmap` — 24 h traffic intensity for Leaflet.heat overlay
- ✅ `_haversine_km()` helper function in `routers/vehicles.py`

### Validation & Infrastructure
- ✅ Pydantic v2 schemas for request/response serialisation
- ✅ CORS middleware for frontend requests
- ✅ `GET /api/health` — health check endpoint
- ✅ Request logging middleware (`RequestLogMiddleware`)
