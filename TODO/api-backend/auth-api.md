# Authentication API

> JWT authentication endpoints and middleware.
> Router: `backend/app/routers/auth.py`
> Auth logic: `backend/app/auth.py`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Endpoints
- ✅ `POST /api/auth/login` — validates credentials, returns JWT access token
- ✅ Dependency `get_current_user` — validates Bearer token on protected routes
- ✅ Dependency `require_admin` — raises 403 if role ≠ "admin"

### Security
- ✅ bcrypt password hashing
- ✅ `secrets.compare_digest` for constant-time role comparison
- ✅ Timing-safe bcrypt flow prevents username enumeration
- ✅ Rate limiter: 10 login attempts/min per IP (slowapi)
- ✅ JWT expiry configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` env var

### Testing
- ✅ `test_auth.py` — covers login success, wrong password, expired token, role enforcement
