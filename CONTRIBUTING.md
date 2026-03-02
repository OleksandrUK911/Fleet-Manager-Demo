# Contributing to Fleet Manager Demo

Thank you for your interest in contributing! This guide explains how to get the
project running locally and what to check before opening a pull request.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11 + | 3.13 recommended |
| Node.js | 18 + | 20 LTS recommended |
| Git | any | — |
| SQLite | bundled | no extra install needed for development |

---

## Local Setup (Development)

### 1 — Clone the repo

```bash
git clone https://github.com/your-username/fleet-manager-demo.git
cd fleet-manager-demo
```

### 2 — Backend

```bash
# Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Copy environment file and set at minimum JWT_SECRET_KEY
copy backend\.env.example backend\.env   # Windows
# cp backend/.env.example backend/.env   # Unix

# Run database migrations (creates SQLite tables)
alembic upgrade head

# Start the backend (port 7767)
uvicorn backend.app.main:app --reload --port 7767
```

### 3 — Data generator (separate terminal)

```bash
python -m backend.app.generator
```

### 4 — Frontend

```bash
cd frontend
npm install
npm start   # opens http://localhost:3000
```

### 5 — Quick start (Windows PowerShell)

```powershell
.\start_local.ps1   # launches all three processes in separate windows
```

---

## Running Tests

```bash
# From the repo root (with .venv active)
python -m pytest backend/tests/ -v --tb=short
# Expected: 62 passed
```

---

## Code Style

### Python
- Formatter: **black** (line length 120)
- Import order: **isort** (black-compatible profile)
- Linter: **flake8** (ignores E501, W503, E402)

Run before committing:

```bash
black backend/
isort backend/
flake8 backend/app/
```

### JavaScript / JSX
- **Frontend app** (`frontend/`): CRA built-in ESLint (`react-app` config) — issues surface during `npm run build`
- **Promo site** (`website/`): ESLint 8 with custom `.eslintrc.json` (`plugin:react/recommended` + `plugin:react-hooks/recommended`)

Run the website linter before committing:

```bash
# Promo site — zero warnings enforced
cd website && npm run lint
```

---

## Pull Request Checklist

Before opening a PR, please confirm:

- [ ] `pytest backend/tests/` passes with zero failures
- [ ] `npm run build` in `frontend/` produces no errors
- [ ] `npm run build` in `website/` produces no errors (if you edited the promo site)
- [ ] `cd website && npm run lint` produces zero errors or warnings (if you edited the promo site)
- [ ] New backend endpoints have at least one happy-path test in `backend/tests/`
- [ ] New React components are added to the section layout in `App.jsx` or appropriate page
- [ ] No secrets, API keys, or `.env` files are committed
- [ ] Changes to the data model include an Alembic migration (`alembic revision --autogenerate`)

---

## Project Layout

```
FleetManagerDemo/
├── backend/          FastAPI app, models, routers, tests
├── frontend/         React SPA (MUI, Leaflet, Recharts)
├── website/          Vite + React promo landing page
├── deploy/           VPS setup scripts (Nginx, systemd, backup)
├── .github/          GitHub Actions CI workflow
├── TODO/             Task tracking (TODO_MAIN.md + category files)
├── docker-compose.yml
└── start_local.ps1   Windows quick-start script
```

---

## Reporting Bugs

Open a GitHub Issue and include:
1. Steps to reproduce
2. Expected vs actual behaviour
3. Browser / OS / Python version
4. Any relevant console output or screenshots

---

## License

By contributing you agree that your changes will be released under the
project's **MIT License**.
