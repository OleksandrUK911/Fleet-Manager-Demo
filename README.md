# Fleet Manager Demo

![CI](https://github.com/OleksandrUK911/Fleet-Manager-Demo/actions/workflows/ci.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-74%20passed-brightgreen)](backend/tests/)

> A full-stack web application for **real-time and historical fleet vehicle tracking** on an interactive map.

## 🔗 Links

| | URL |
|---|---|
| 🌐 **Landing page** | [oleksandruk911.github.io/Fleet-Manager-Demo](https://oleksandruk911.github.io/Fleet-Manager-Demo/) |
| 🚀 **Live Admin Panel** | [fleet-manager-demo-production-47c1.up.railway.app/app](https://fleet-manager-demo-production-47c1.up.railway.app/app) |
| 📖 **API Docs** (Swagger) | [fleet-manager-demo-production-47c1.up.railway.app/api/docs](https://fleet-manager-demo-production-47c1.up.railway.app/api/docs) |
| 💻 **Source Code** | [github.com/OleksandrUK911/Fleet-Manager-Demo](https://github.com/OleksandrUK911/Fleet-Manager-Demo) |

## 🔑 Demo Credentials

| Role | Username | Password | Access |
|---|---|---|---|
| **Admin** | `admin` | `fleet2024` | Full CRUD — add/edit/delete vehicles |
| **Viewer** | `viewer` | `viewer123` | Read-only — map, reports, history |

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup (MySQL)](#1-database-setup-mysql)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Start the Data Generator](#3-start-the-data-generator)
  - [4. Frontend Setup (React)](#4-frontend-setup-react)
- [API Endpoints](#api-endpoints)
- [Production Deployment (VPS / Shared Hosting)](#production-deployment-vps--shared-hosting)
  - [1. Build the Frontend](#1-build-the-frontend)
  - [2. Deploy the Backend](#2-deploy-the-backend)
  - [3. Configure Nginx](#3-configure-nginx)
  - [4. Set Up a systemd Service](#4-set-up-a-systemd-service)
  - [5. SSL with Certbot](#5-ssl-with-certbot)
- [GitHub Repository Setup](#github-repository-setup)
- [Reviewer Guide](#reviewer-guide)
- [Developer Tools](#developer-tools)
- [Contributing](CONTRIBUTING.md)

---

## Features

### 🗺️ Live Map & Tracking
- **Real-time vehicle map** — All fleet vehicles shown as emoji markers on a London-based OpenStreetMap view, updated via WebSocket every 5 seconds
- **Speed heatmap polylines** — Route history colour-coded by speed (green → amber → red) instead of a flat line
- **Route replay animation** — Play/Pause/Stop controls + scrub slider + 1×/2×/5× speed multiplier
- **Geofence zones** — Depot, Service Centre, and City Drop-off zones drawn as coloured circles on the map
- **Marker pulse animation** — Green flash ring on a marker when it receives a fresh GPS position
- **Context menu** — Right-click any marker for Centre / Open Details / Clear Path shortcuts
- **Fullscreen map** — One-click fullscreen toggle for distraction-free monitoring

### 📊 Dashboard & Reports
- **KPI dashboard bar** — Real-time counters: Total / Active / Inactive / Maintenance vehicles
- **Fleet Activity chart** — Recharts AreaChart of GPS pings per hour over the last 24 h
- **Top-5 active vehicles** — League table of most active vehicles by GPS ping count
- **Reports page** — Speed timeline chart + full position log table with distance calculations
- **PDF export** — Client-side A4 PDF (jsPDF + jspdf-autotable) with KPI summary and position table
- **CSV export** — Download raw position data as CSV for external analysis

### 🔒 Authentication & Roles
- **JWT auth** — `POST /api/auth/login` returns a 24-hour access token
- **Role-based access** — `admin` can add / edit / delete vehicles; `viewer` is read-only
- **Protected Admin panel** — `/admin` redirects to Login if unauthenticated; viewer sees greyed-out controls
- **Rate limiting** — Login endpoint capped at 10 req/min per IP (slowapi, no Redis required)

### 🛠️ API & Backend
- **Full CRUD REST API** — Create, read, update, delete vehicles; Swagger UI at `/api/docs`
- **WebSocket endpoint** — `/api/ws/positions` pushes live positions to all clients simultaneously; delta-only updates save bandwidth
- **Geofence zones API** — `GET/POST/PATCH/DELETE /api/geofence`; 3 London demo zones auto-seeded; admin-protected writes
- **Vehicle notes** — Operator notes field per vehicle, editable in Admin panel
- **Alembic migrations** — Version-controlled schema changes with auto-generated migration files
- **Auto-cleanup task** — Background asyncio task deletes positions older than 30 days (configurable via `POSITION_RETENTION_DAYS`)
- **Health check** — `GET /api/health` for load-balancer and uptime monitoring

### 🔧 Developer Experience
- **Docker Compose** — One-command local setup (backend + generator + frontend + nginx)
- **pytest test suite** — 74 tests covering auth, CRUD, heatmap and geofence endpoints (100% passing)
- **GitHub Actions CI** — Lint (flake8) + pytest + npm build on every push and PR
- **Pre-commit hooks** — black, isort, flake8 for Python; eslint for JS/JSX
- **Dark mode** — Full MUI dark theme toggle in the AppBar
- **Mobile responsive** — Drawer sidebar on small screens; map fills full viewport

---

## Screenshots

> 📸 **Add screenshots after deployment.** Place PNG/WebP files in `docs/screenshots/` and update the image links below.
> Interactive CSS mock-ups of every screen are available on the **[Promo Site →](http://fleet-manager-demo.skakun-ml.com/#screenshots)**

| Screen | Description |
|--------|-------------|
| ![Dashboard](docs/screenshots/dashboard.png) | **Live Dashboard** — Leaflet map with pulsing markers, KPI bar, vehicle sidebar and WebSocket live-feed indicator |
| ![Dark Mode](docs/screenshots/dark-mode.png) | **Dark Mode** — Full MUI dark theme; map tiles switch to CartoDB Dark automatically |
| ![Vehicle Detail](docs/screenshots/vehicle-detail.png) | **Vehicle Detail** — Speed AreaChart (24 h), operator notes, route replay with play/pause/speed controls |
| ![Admin Panel](docs/screenshots/admin-panel.png) | **Admin Panel** — Two-tab UI: Overview (KPI cards, charts, top-5 vehicles) + Fleet Management (sortable CRUD table, bulk toolbar, add/edit/delete) |
| ![Reports Page](docs/screenshots/reports.png) | **Reports Page** — Date-range picker → speed chart + position table + CSV/PDF export |

<details>
<summary>How to take screenshots</summary>

1. Start the app locally: `.\ start_local.ps1`
2. Open `http://localhost:3000` in your browser
3. Log in with `admin / fleet2024`
4. Capture each screen at **1280 × 800** (use DevTools device toolbar)
5. Save as WebP: `cwebp -q 85 screenshot.png -o docs/screenshots/dashboard.webp`
6. Replace the `.png` links in the table above with `.webp`

</details>

---

## Architecture

```mermaid
graph TD
    GEN["🔄 Generator\n(python -m app.generator)\nRandom-walk GPS simulation\nevery 10 s"]
    DB[("🗄️ SQLite / MySQL\nvehicles\npositions\ngeofence_zones")]
    API["⚡ FastAPI backend\nport 7767\nREST · WebSocket · JWT"]
    REACT["🖥️ React SPA\nport 3000\nLeaflet · MUI · Recharts"]
    WS["🔌 WebSocket\n/api/ws/positions\ndelta push every 5 s"]
    HTTP["🌐 REST API\n/api/vehicles\n/api/geofence\n/api/auth"]

    GEN -->|"INSERT position\nUPDATE vehicle lat/lng"| DB
    DB -->|"SQLAlchemy ORM"| API
    API -->|"full/delta/heartbeat JSON"| WS
    API -->|"JSON responses"| HTTP
    WS -->|"live position updates"| REACT
    HTTP -->|"initial load · stats · history"| REACT
```

---

## Project Structure

```
FleetManagerDemo/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Package marker
│   │   ├── main.py              # FastAPI app, CORS, lifespan, router registration
│   │   ├── database.py          # SQLAlchemy engine and session factory
│   │   ├── models.py            # ORM models: Vehicle, Position, GeofenceZone
│   │   ├── schemas.py           # Pydantic v2 response schemas
│   │   ├── auth.py              # JWT helpers, password hashing, role checks
│   │   ├── generator.py         # Vehicle movement simulator (multi-city)
│   │   ├── rate_limit.py        # slowapi limiter instance
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── vehicles.py      # CRUD + /stats + /history + /heatmap
│   │       ├── auth.py          # Login + JWT token endpoints
│   │       └── geofence.py      # Geofence zone CRUD endpoints
│   ├── tests/
│   │   ├── conftest.py          # Fixtures, helpers, in-memory SQLite
│   │   ├── test_auth.py         # Auth + JWT tests
│   │   ├── test_vehicles.py     # Vehicle CRUD tests
│   │   ├── test_heatmap.py      # Heatmap endpoint tests
│   │   └── test_geofence.py     # Geofence CRUD tests
│   ├── alembic/             # Database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.js               # Main layout, routing, WebSocket + HTTP state
│       ├── api/vehicles.js      # Axios API client (all endpoints)
│       ├── components/
│       │   ├── VehicleMap.js    # Leaflet map, heatmap, clusters, geofences
│       │   ├── VehicleList.js   # Sidebar with search + filter
│       │   ├── KpiBar.js        # Top KPI cards
│       │   └── FleetActivityChart.js
│       ├── pages/
│       │   ├── AdminPage.js     # Vehicle CRUD admin table
│       │   ├── ReportsPage.js   # CSV/PDF export + speed chart
│       │   └── VehiclePage.js   # Per-vehicle detail + history
│       └── hooks/
│           └── useFleetWebSocket.js
│
├── website/             # Promo landing page (Vite + React, deploy to Vercel)
│   ├── src/components/  # Hero, Features, TechStack, Architecture, Screenshots…
│   ├── public/          # favicon.svg, og-image.svg, robots.txt, sitemap.xml
│   └── vercel.json      # SPA rewrite + security headers + immutable asset cache
│
├── deploy/              # VPS deployment scripts
│   ├── nginx-ssl.conf   # Nginx: HTTPS, HTTP→SSL redirect, WebSocket proxy
│   ├── setup-vps.sh     # One-shot Ubuntu 22.04 provisioner (UFW, certbot, systemd)
│   ├── fleet-generator.service  # systemd unit for the data generator
│   └── backup-db.sh     # SQLite/MySQL backup with 7-day rotation
│
├── TODO/                # Development task tracking
├── docker-compose.yml
├── Makefile             # Developer shortcuts: make test / make lint / make build-website
├── start_local.ps1      # Windows: launch all 3 processes at once
├── pyproject.toml       # Black, isort, pytest, coverage config
├── .editorconfig        # Per-language indent, charset, line-ending rules
├── .flake8              # Flake8 linter config (max-line 120)
├── .pre-commit-config.yaml  # Pre-commit hooks: black, isort, flake8, eslint
├── SECURITY.md          # Vulnerability reporting & response policy
├── CODE_OF_CONDUCT.md   # Contributor Covenant 2.1
└── README.md
```

---

## Local Development Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python      | 3.10+   |
| Node.js     | 18+     |
| MySQL       | 8.0+    |
| npm         | 9+      |

---

### Quick Start (Windows — one script)

```powershell
# From the FleetManagerDemo root:
.\start_local.ps1
```

This opens 3 PowerShell windows: backend (7767), generator, and frontend (3000).

---

### Quick Start (Docker Compose — all platforms)

```bash
# From the FleetManagerDemo root:
docker compose up --build
```

Services started:
| Service | URL |
|---------|-----|
| React frontend | http://localhost:3000 |
| FastAPI backend | http://localhost:7767 |
| Swagger UI | http://localhost:7767/api/docs |
| Data generator | runs in background |

> **Note:** The Docker Compose setup uses SQLite by default. Set `DATABASE_URL` in `backend/.env` to switch to MySQL.

---

### 1. Database Setup

**Local development uses SQLite** — no installation required.
The database file `backend/fleet.db` is created automatically on first run.

**For MySQL (production only):**
```bash
# Log in to MySQL as root
mysql -u root -p

# Run the schema file (creates DB, user, tables, and seeds sample data)
source /path/to/FleetManagerDemo/backend/schema.sql
```

Or manually:
```sql
CREATE DATABASE fleet_manager CHARACTER SET utf8mb4;
CREATE USER 'fleet_user'@'localhost' IDENTIFIED BY 'fleet_pass';
GRANT ALL PRIVILEGES ON fleet_manager.* TO 'fleet_user'@'localhost';
FLUSH PRIVILEGES;
```

Then set in `.env`:
```
DATABASE_URL=mysql+pymysql://fleet_user:fleet_pass@localhost:3306/fleet_manager
```

---

### 2. Backend Setup (FastAPI)

```bash
cd FleetManagerDemo/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from the example
cp .env.example .env
# Edit .env and set your DATABASE_URL, e.g.:
# DATABASE_URL=mysql+pymysql://fleet_user:fleet_pass@localhost:3306/fleet_manager

# Start the development server on PORT 7767
uvicorn app.main:app --reload --host 0.0.0.0 --port 7767
```

API will be available at:
- Swagger UI: http://localhost:7767/api/docs
- Base API: http://localhost:7767/api/vehicles/

---

### 3. Start the Data Generator

In a **second terminal** (with the venv activated):

```bash
cd FleetManagerDemo/backend
source venv/bin/activate

# Generates new GPS positions every 10 seconds for all vehicles
python -m app.generator
```

The generator will:
1. Seed 5 sample vehicles on first run (if the DB is empty)
2. Continuously update their positions and write to the `positions` table

---

### 4. Frontend Setup (React)

```bash
cd FleetManagerDemo/frontend

# Install dependencies
npm install

# Start the development server
# The proxy in package.json will forward /api/* to http://localhost:7767
npm start
```

Open http://localhost:3000 in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/vehicles/` | List all active vehicles with current GPS position |
| GET | `/api/vehicles/stats` | KPI counts: `{total, active, inactive, maintenance}` |
| GET | `/api/vehicles/stats/activity` | Hourly position counts for the last 24 h |
| GET | `/api/vehicles/stats/top-active` | Top N vehicles by GPS ping count |
| GET | `/api/vehicles/heatmap?hours=24&limit=3000` | `[[lat, lng, intensity]]` triples for Leaflet heatmap |
| GET | `/api/vehicles/{id}` | Vehicle details + 20 recent positions |
| GET | `/api/vehicles/{id}/history?hours=24&limit=500` | Full GPS history for a vehicle |
| POST | `/api/vehicles/` | Create a new vehicle |
| PATCH | `/api/vehicles/{id}` | Partially update a vehicle (name, status, etc.) |
| DELETE | `/api/vehicles/{id}` | Soft-delete a vehicle (sets `is_active=false`) |
| POST | `/api/auth/login` | Exchange credentials for a JWT access token |
| GET | `/api/geofence` | List all geofence zones |
| POST | `/api/geofence` | Create a geofence zone (admin) |
| PATCH | `/api/geofence/{id}` | Update a zone (admin) |
| DELETE | `/api/geofence/{id}` | Delete a zone (admin) |

**Query parameters for `/history`:**

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `hours` | int | 24 | 168 | Hours of history to return |
| `limit` | int | 500 | 2000 | Max number of position records |

Interactive API docs: `http://localhost:7767/api/docs`

---

## Production Deployment (VPS / Shared Hosting)

### 1. Build the Frontend

```bash
cd FleetManagerDemo/frontend

# Set the production API URL if backend is on a different domain
# echo "REACT_APP_API_URL=https://fleet.yourdomain.com" > .env

npm run build
# Output: frontend/build/ — copy this to your web root
```

Copy the build output to your server:

```bash
sudo mkdir -p /var/www/fleet-manager
sudo cp -r build/* /var/www/fleet-manager/
```

---

### 2. Deploy the Backend

```bash
# On your VPS:
mkdir -p /var/www/fleet-manager-backend
cd /var/www/fleet-manager-backend

# Clone or upload your backend files, then:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env  # Set DATABASE_URL to your production MySQL credentials
```

---

### 3. Configure Nginx

```bash
# Copy the Nginx config (edit server_name and root path first)
sudo cp nginx/fleet-manager.conf /etc/nginx/sites-available/fleet-manager

# Edit the config
sudo nano /etc/nginx/sites-available/fleet-manager
# Change: server_name fleet.yourdomain.com;
# Change: root /var/www/fleet-manager;

sudo ln -s /etc/nginx/sites-available/fleet-manager /etc/nginx/sites-enabled/
sudo nginx -t          # Validate config
sudo systemctl reload nginx
```

---

### 4. Set Up a systemd Service

```bash
# Edit the service file paths and username
sudo cp nginx/fleet-manager.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable fleet-manager
sudo systemctl start fleet-manager

# Check status
sudo systemctl status fleet-manager
sudo journalctl -u fleet-manager -f  # Follow logs
```

---

### 5. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d fleet.yourdomain.com
sudo systemctl reload nginx
```

---

## GitHub Repository Setup

```bash
cd FleetManagerDemo

# Initialize git
git init
git add .
git commit -m "Initial commit: Fleet Manager Demo"

# Add remote and push
git remote add origin https://github.com/OleksandrUK911/Fleet-Manager-Demo.git
git branch -M main
git push -u origin main
```

> **Note:** The `.gitignore` already excludes `venv/`, `node_modules/`, `.env`, and `frontend/build/`.

> **GitHub Topics (add after push):** `fastapi` · `react` · `leaflet` · `fleet-tracking` · `real-time` · `websocket` · `vehicle-tracking` · `material-ui` · `sqlite` · `docker` · `python` · `portfolio`

---

## Reviewer Guide

1. Clone the repository and follow the **Local Development Setup** section above.
2. **SQLite is used by default** — no MySQL installation required for local review.
3. Run `pip install -r requirements.txt` and start with `uvicorn app.main:app --reload --port 7767`.
4. Start the data generator in a separate terminal: `python -m app.generator`.
5. Install frontend dependencies (`npm install`) and start with `npm start`.
6. Open http://localhost:3000 — you should see 5 UK vehicles on a London map, moving every 10 seconds.
7. The KPI bar at the top shows live counts; use the search box and status filter in the sidebar.
8. Click any vehicle to highlight it on the map and load its GPS history path.
9. API docs (Swagger UI) are available at http://localhost:7767/api/docs.
10. **Quick start on Windows:** run `.\start_local.ps1` to launch all three processes at once.

---

## Developer Tools

The project ships with a `Makefile` for common tasks (requires GNU Make; use Git Bash or WSL on Windows):

```bash
make help          # List all available targets

make install       # pip install + npm ci for all sub-projects
make install-dev   # + black, isort, flake8, pre-commit; installs git hooks

make test          # pytest (74 tests)
make test-cov      # pytest + coverage report
make lint          # flake8 on backend/
make format        # black + isort on backend/
make format-check  # CI-mode format check (no file changes)

make build-website # Vite production build (website/)
make dev-website   # Vite dev server on :5173

make ci-check      # format-check + lint + test + build-website (full local CI)
make clean         # Remove __pycache__, .pytest_cache, website/dist
```

Code quality is enforced by **pre-commit hooks** (installed via `make install-dev`):

| Hook | Scope | Tool |
|------|-------|------|
| Python formatter | `backend/` | `black` (line-length 120) |
| Import sorter | `backend/` | `isort` (profile=black) |
| Python linter | `backend/` | `flake8` |
| File hygiene | all | trailing-whitespace, end-of-file-fixer, check-yaml, LF line endings |
| JS/JSX linter | `frontend/src/` | `eslint` |
| JSX linter | `website/src/` | `eslint` (via `npm run lint`) |

> **Security:** see [SECURITY.md](SECURITY.md) for the vulnerability reporting process and response SLA.

---

_Built with FastAPI · React · Material UI · Leaflet · SQLite/MySQL · London OpenStreetMap tiles._

---

**[Contributing](CONTRIBUTING.md)** · [Code of Conduct](CODE_OF_CONDUCT.md) · [MIT License](LICENSE) · [Security](SECURITY.md) · [Promo Site](https://fleet-manager-demo.vercel.app)
