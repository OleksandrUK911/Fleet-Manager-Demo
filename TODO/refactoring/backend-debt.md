# Backend Technical Debt

> Code quality improvements, linting fixes, type hints, and
> structural cleanup in `backend/app/`.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Linting (flake8 — Sprint 29)
- ✅ `[flake8]` section added to `.flake8` (settings were silently ignored without it)
- ✅ `E201`, `E221` added to `extend-ignore` for intentional column alignment
- ✅ `main.py` — removed unused `JSONResponse` import (F401); fixed class spacing (E302/E305)
- ✅ `main.py` — `is_active == True` → `is_active` throughout (E712)
- ✅ `generator.py` — removed status-comment E501 lines; fixed E712 instances
- ✅ `routers/auth.py` — two blank lines before `_init_users()` (E302/E305)
- ✅ `routers/geofence.py` — removed trailing blank line (W391)
- ✅ `routers/vehicles.py` — removed unused `cast`, `Date`, `date` imports (F401 ×3);
  6× `is_active == True` → `is_active`; split long signatures (E501); added final newline (W292)
- ✅ flake8: **0 errors** (EXIT 0)

### Code Quality
- ✅ `_haversine_km()` extracted as standalone pure function
- ✅ All `datetime.utcnow()` replaced with `datetime.now(timezone.utc)` (Python 3.12+ deprecation)
- ✅ SQLAlchemy 2.0 `select()` style used throughout (no legacy `Query` API)
- ✅ `asyncio_mode = "auto"` in `pyproject.toml` — no `@pytest.mark.asyncio` boilerplate
