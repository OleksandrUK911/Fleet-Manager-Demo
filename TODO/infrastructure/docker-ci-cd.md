# Docker & CI/CD

> Docker containerisation, GitHub Actions pipeline, local dev parity.
> Files: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`,
> `.github/workflows/ci.yml`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Docker
- ✅ `backend/Dockerfile` — multi-stage build for FastAPI + Uvicorn
- ✅ `frontend/Dockerfile` — Nginx-served React build
- ✅ `docker-compose.yml` — orchestrates: backend + generator + frontend + nginx
- ✅ `docker/nginx.conf` — container nginx configuration

### GitHub Actions
- ✅ `ci.yml` workflow: triggers on push/PR to `main`
- ✅ Python 3.13 matches `pyproject.toml` and README badge
- ✅ CI steps: flake8 lint → pytest → npm build → ESLint (website)
- ✅ `ci_test.db` excluded via `.gitignore`

### Local Development
- ✅ `start_local.ps1` — PowerShell script: starts backend + frontend simultaneously
- ✅ Port conflict check: warns if 7767 or 3000 already in use (`Test-PortInUse`)
- ✅ `Makefile` — 14 targets: `help`, `install`, `install-dev`, `test`, `test-cov`,
  `lint`, `format`, `format-check`, `build-website`, `dev-website`,
  `dev`, `pre-commit`, `ci-check`, `clean`
- ✅ All `Makefile` `.PHONY` targets are correct (no missing / phantom targets)
