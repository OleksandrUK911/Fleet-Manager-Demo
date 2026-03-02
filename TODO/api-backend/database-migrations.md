# Database & Migrations

> SQLAlchemy models, Alembic migrations, indexing strategy,
> and data retention policy.
> Config: `backend/alembic.ini`, `backend/alembic/env.py`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Models
- ✅ `Vehicle` model — id, name, plate, model, status, is_active, notes, current_speed
- ✅ `Position` model — id, vehicle_id (FK cascade delete), lat, lng, speed, timestamp
- ✅ `GeofenceZone` model — id, name, lat, lng, radius_m, colour

### Indexing
- ✅ Composite index on `positions(vehicle_id, timestamp)` for fast history queries
- ✅ Index on `vehicles(license_plate)` for search
- ✅ Foreign key with `CASCADE DELETE` on positions

### Migrations (Alembic)
- ✅ `alembic.ini` and `env.py` configured
- ✅ Migration `9c87501a05b7_initial_schema.py` — Vehicle + Position tables
- ✅ Migration `34a72b37fc5e_add_geofence_zones_table.py` — GeofenceZone table

### Data Management
- ✅ `schema.sql` — DDL + seed data for quick start
- ✅ Async background task: purge positions older than N days (`POSITION_RETENTION_DAYS` env)
- ✅ SQLite as default for development (no MySQL required locally)
- ✅ MySQL supported in production via `DATABASE_URL` env var
- ✅ Python 3.13 compatibility: `SQLAlchemy 2.0.47`, `datetime.now(timezone.utc)`
