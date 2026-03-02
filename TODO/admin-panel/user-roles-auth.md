# User Roles & Authentication

> JWT-based authentication, role management (admin / viewer),
> login page, and protected routes.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Role Definitions
- ✅ Role "admin" — can add/edit/delete vehicles and geofence zones
- ✅ Role "viewer" — read-only access to map and route history

### Frontend Auth
- ✅ Login page with MUI form + token saved to localStorage
- ✅ `AuthContext` — global auth state
- ✅ Protected routes (redirect to `/login` when unauthenticated)

> **Backend implementation** (JWT endpoints, bcrypt, rate limiting, compare_digest) →
> see `api-backend/auth-api.md`
>
> **Secrets management** (`.env`, `.env.example`) →
> see `infrastructure/security.md`
