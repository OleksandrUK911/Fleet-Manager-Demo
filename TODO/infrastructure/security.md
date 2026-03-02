# Security

> Application-layer security: HTTP headers, secrets management,
> TLS configuration, rate limiting.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### HTTP Security Headers (SecurityHeadersMiddleware)
- ✅ `Content-Security-Policy` — restricts script/style/font/connect sources
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy` — camera, mic, geolocation, payment, USB blocked

### Website Headers (vercel.json)
- ✅ HSTS: `max-age=63072000; includeSubDomains; preload`
- ✅ CSP, Permissions-Policy mirrored for Vercel deployment

### Secrets & Configuration
- ✅ All secrets in `.env` — never committed to version control
- ✅ `JWT_SECRET_KEY` in `backend/.env.example` with generation hint
- ✅ `SECURITY.md` — supported versions, reporting via GitHub Private Advisory,
  response SLAs (48 h ack, 14 d critical patch, 30 d moderate)

### Authentication Security
- ✅ bcrypt for password hashing
- ✅ `secrets.compare_digest` for constant-time comparison
- ✅ slowapi rate limiter: 10 login req/min per IP (brute-force protection)
- ✅ Username-enumeration prevention (identical timing for wrong user vs wrong pass)

### Transport Security
- ✅ TLS 1.2 / 1.3 enforced in Nginx (`deploy/nginx-ssl.conf`)
