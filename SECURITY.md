# Security Policy

## Supported Versions

Fleet Manager Demo is a **portfolio / demonstration project** and is not intended
for production use without additional hardening. Security fixes are applied only
to the latest version on `main`.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Yes |
| Older branches | ❌ No |

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

### Option A — GitHub Private Advisory (preferred)

1. Go to the repository on GitHub.
2. Click **Security** → **Advisories** → **New draft security advisory**.
3. Fill in the title, description, and affected versions.
4. Submit — only repository maintainers can see it until it is published.

### Option B — Email

Send details to the address listed in the repository's GitHub profile.
Encrypt the message with the maintainer's GPG public key if the issue is sensitive.

---

## What to Include in Your Report

- A clear description of the vulnerability and its potential impact.
- Steps to reproduce, including any PoC code or screenshots.
- The affected component (backend API, frontend, data generator, Docker config, etc.).
- The environment details (OS, Python version, Node version, browser if applicable).

---

## Response Timeline

| Stage | Target time |
|-------|-------------|
| Acknowledgement | Within **48 hours** |
| Triage & severity assessment | Within **5 business days** |
| Patch / workaround available | Within **14 days** for critical; **30 days** for moderate |
| Advisory published | After patch is released |

---

## Scope

The following are **in scope** for security reports:

- Unauthenticated access to protected API endpoints.
- JWT authentication bypass or token forgery.
- SQL injection or ORM query manipulation.
- Sensitive data exposed in API responses or logs.
- CORS misconfiguration allowing cross-origin credential access.
- Missing or bypassable Content Security Policy headers.
- Server-Side Request Forgery (SSRF) in any server component.

The following are **out of scope** for this demo project:

- Vulnerabilities that require physical device access.
- Denial-of-service attacks against the demo server (rate limiting is already applied via `slowapi`).
- Issues in third-party libraries that are not yet patched upstream.
- Issues only reproducible with an extremely outdated browser.

---

## Disclosure Policy

We follow **coordinated disclosure** (also known as responsible disclosure).
We will credit reporters in the changelog and advisory unless they prefer to remain anonymous.

---

## Security Measures Already in Place

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT (HS256), `python-jose` |
| Password hashing | bcrypt, work factor 12 |
| Timing-safe comparison | `secrets.compare_digest` in `require_admin` |
| Rate limiting | `slowapi` — 100 req/min per IP |
| Security headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| TLS | TLS 1.2 / 1.3 enforced in `deploy/nginx-ssl.conf` |
| Secrets management | `.env` file (not committed); `.gitignore` enforced |
| Dependency pinning | `requirements.txt` with pinned versions |
