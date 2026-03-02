# Geofence API

> CRUD endpoints for geofence zones.
> Router: `backend/app/routers/geofence.py`
> Model: `GeofenceZone` in `backend/app/models.py`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

- ✅ `GET /api/geofence` — list all geofence zones
- ✅ `POST /api/geofence` — create zone (admin only)
- ✅ `PATCH /api/geofence/{id}` — update zone name, radius, coordinates (admin only)
- ✅ `DELETE /api/geofence/{id}` — delete zone (admin only)
- ✅ `GeofenceZone` SQLAlchemy model with columns: id, name, lat, lng, radius_m, colour
- ✅ Auto-seed 3 London demo zones on first startup (warehouse, service centre, city centre)
- ✅ 15 pytest tests covering all CRUD operations and role enforcement
- ✅ Alembic migration `34a72b37fc5e_add_geofence_zones_table.py`
