# Changelog

All notable changes to **Fleet Manager Demo** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions track development sprints; semantic versioning begins at public release.

---

## [Unreleased]

---

## [0.19.0] — Sprint 30 — Fleet Intelligence Features

### Added
- **`GET /api/vehicles/stats/distance`** — new backend endpoint returning total km driven today (UTC) across all active vehicles; computed using the Haversine formula on consecutive per-vehicle position records; response: `{ total_km, vehicle_count }`
- **`GET /api/vehicles/stats/overspeed?threshold=80`** — new backend endpoint returning all active vehicles whose `current_speed` exceeds the threshold; response: `{ count, threshold, vehicles: [{id, name, license_plate, current_speed, status}] }`; default threshold 80 km/h; validated `ge=1.0, le=250.0`
- **`search=` query parameter** on `GET /api/vehicles/` — case-insensitive search by vehicle name or license plate via `func.lower().like()`; returns empty list when nothing matches
- **`_haversine_km` helper** in `routers/vehicles.py` — reusable great-circle distance calculator
- **`fetchFleetDistance()`** and **`fetchOverspeedVehicles(threshold)`** — two new functions in `frontend/src/api/vehicles.js`
- **KpiBar — 2 new cards** — "km today" (purple, RouteIcon) showing total fleet distance; "overspeed" (red when > 0, SpeedIcon) showing count of vehicles above 80 km/h; both include Tooltip with context
- **Dark mode persistence** — `App.js` now initialises dark mode from `localStorage.getItem('fleet_dark')` and saves on every toggle; preference survives page reload
- **12 new backend tests** — `TestSearchVehicles` (4 tests), `TestFleetDistance` (2 tests), `TestOverspeedStats` (6 tests)

---

## [0.18.0] — Sprint 29 — Backend Lint Clean Pass

### Fixed
- `.flake8` — missing `[flake8]` section header (settings were silently ignored; `max-line-length = 120` was never applied); added `E201` and `E221` to `extend-ignore` (intentional column-alignment throughout codebase)
- `backend/app/main.py` — removed unused `JSONResponse` import (F401); fixed single-space inline comment (E261); added required blank lines around `SecurityHeadersMiddleware` and `RequestLogMiddleware` class definitions (E302, E305 ×2); reduced 3 blank lines to 2 before `_seed_demo_geofences` (E303); `Vehicle.is_active == True` → `Vehicle.is_active` (E712); split `_DEMO_ZONES` list entries to keep lines ≤ 120 chars (E501)
- `backend/app/generator.py` — removed verbose inline status comments (E501); split `_CITY_CONFIGS` entries across two lines (E501); split long `print()` tick statement (E501); `Vehicle.is_active == True` → `Vehicle.is_active` (E712)
- `backend/app/routers/auth.py` — added required 2 blank lines before `def _init_users()` (E302) and before the `_init_users()` call site (E305)
- `backend/app/routers/geofence.py` — removed trailing blank line (W391)
- `backend/app/routers/vehicles.py` — removed unused imports `cast`, `Date` (sqlalchemy) and `date` (datetime) (F401 ×3); `is_active == True` → `is_active` in 6 query filters (E712); split `update_vehicle` signature and `maintenance` query to ≤ 120 chars (E501); fixed missing final newline (W292)
- `CONTRIBUTING.md` — flake8 run command simplified to `flake8 backend/app/` (flags are now handled by `.flake8` config)

---

## [0.17.0] — Sprint 28 — Docs Accuracy & Env Correctness

### Fixed
- `CONTRIBUTING.md` — JavaScript/JSX Code Style section: replaced incorrect "CRA defaults" blanket label with accurate per-project description; removed non-existent `npm run lint` command for `frontend/` (CRA has no separate lint script — issues surface via `npm run build`); added `cd website && npm run lint` command for the promo site (ESLint 8, `--max-warnings 0`)
- `CONTRIBUTING.md` — PR Checklist: `App.js` → `App.jsx` (correct filename in the project); added checklist item for `cd website && npm run lint` producing zero warnings
- `backend/.env.example` — renamed `SECRET_KEY` → `JWT_SECRET_KEY` (matches `os.getenv("JWT_SECRET_KEY", …)` in `auth.py` and the `JWT_SECRET_KEY` CI env var); added generation hint comment
- `backend/.env.example` — Database section: SQLite (`sqlite:///./fleet.db`) now shown as the default development URL; MySQL connection string moved to a commented-out example for production use

---

## [0.16.0] — Sprint 27 — Version Consistency & Publish Guide Update

### Fixed
- `README.md` — FastAPI badge corrected from `0.133` → `0.111` to match both `requirements.txt` (pinned `fastapi==0.111.0`) and `TechStack.jsx` (aligned in Sprint 26)
- `GITHUB_PUBLISH.md` — first-commit message updated from `v0.11.0` → `v0.15.0`; `CHANGELOG.md` description updated `v0.1.0 → v0.11.0` → `v0.1.0 → v0.15.0`; placeholder table rows for `Header.jsx` and `ContactCTA.jsx` updated to reflect env-var-based configuration (`VITE_DEMO_URL`, `VITE_GITHUB_URL`, `VITE_SWAGGER_URL` set in Vercel ENV — no more hardcoding)
- `website/README.md` — Pre-Deploy Configuration table replaced: old approach (edit constants in source) → new env-var driven approach; expanded Environment Variables section to list all four `VITE_*` variables with examples; hooks directory listing added `useActiveSection.js`; CI snippet updated to include `npm run lint` step; Vercel deploy step updated to mention all four env vars

---

## [0.15.0] — Sprint 26 — Section Order, Version Accuracy & Env Vars

### Fixed
- `website/src/App.jsx` — `<Screenshots>` was rendered 4th (after HowItWorks) while both Header and Footer nav show it last; moved to correct position after Highlights
- `website/src/components/TechStack.jsx` — stale version numbers corrected: Leaflet `4.2` → `1.9` (react-leaflet 4.2 noted in role), jsPDF `2.x` → `4.2`, Recharts `2.x` → `3.7`, react-router `7.x` → `7.13`
- `website/src/components/TechStack.jsx` — `section-label` was "Under the hood" (same as HowItWorks); changed to "Production-proven stack"
- `website/src/components/Footer.jsx` — Stats + Architecture LINKS entries were on a single minified line; reformatted

### Changed
- `website/src/components/ContactCTA.jsx` — hardcoded `localhost` URLs replaced with `import.meta.env.VITE_DEMO_URL`, `VITE_GITHUB_URL`, `VITE_SWAGGER_URL` (each with fallback)
- `website/src/components/Hero.jsx` — `DEMO_URL` and `GITHUB_URL` now read from `import.meta.env` with fallbacks
- `website/src/components/Header.jsx` — `DEMO_URL` and `GITHUB_URL` now read from `import.meta.env` with fallbacks
- `website/src/components/Footer.jsx` — `GITHUB_URL` now reads from `import.meta.env.VITE_GITHUB_URL` with fallback
- `website/.env.example` — added `VITE_SWAGGER_URL` entry

---

## [0.14.0] — Sprint 25 — Config Hygiene & Tooling Fixes

### Fixed
- `Makefile` — `.PHONY` declaration: removed phantom `type-check` target; added missing `test-cov`, `format-check`, `dev-website`, `ci-check`
- `.github/workflows/ci.yml` — backend job Python version corrected `3.12` → `3.13` to match `README.md` badge and `pyproject.toml`
- `TODO/TODO_tech.md` — Sprint 24 section had UTF-8 encoding corruption (PowerShell `Add-Content` without encoding flag); section rewritten cleanly

---

## [0.13.0] — Sprint 24 — Website Data Accuracy & Footer Polish

### Fixed
- `website/src/components/Hero.jsx` — stale test count updated from `49` to `62` in hero stats strip
- `website/src/components/Footer.jsx` — added missing `Stats` (`#stats`) navigation link so footer nav matches header (8 links total)
- `website/src/components/Footer.jsx` — corrected tech-stack label from "Leaflet 4" → "Leaflet 1.9" (we use v1.9.4)

---

## [0.12.0] — Sprint 23 — Code of Conduct, Security Headers & Publish Guide

### Added
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1; enforcement contacts via `SECURITY.md`
- `ci_test.db` and `website/dist/` added to `.gitignore`; `website/.env.local` added

### Changed
- `website/vercel.json` — added `Strict-Transport-Security` (HSTS, max-age 63072000, includeSubDomains, preload), `Permissions-Policy` (camera/mic/geolocation/payment/usb all denied), `Content-Security-Policy` (default-src self, fonts via googleapis/gstatic, Plausible analytics connect-src) to the catch-all header rule
- `GITHUB_PUBLISH.md` — fully rewritten: updated include/exclude tables cover all current root files (Makefile, SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, CHANGELOG.md, pyproject.toml, .editorconfig, .flake8, .pre-commit-config.yaml, docker-compose.yml, website/, deploy/); added post-push settings checklist; added placeholder-replacement table for first public deploy

---

## [0.11.0] — Sprint 20-21 — Developer Tooling, Security & Active Nav

### Added
- `.editorconfig` — unified charset (UTF-8), line endings (LF), and per-language indent rules (Python 4 sp, JS/CSS/HTML/JSON/YAML 2 sp, Makefile tabs)
- `pyproject.toml` — centralised Python tooling config: `[tool.black]` (line-length 120), `[tool.isort]` (profile=black), `[tool.pytest.ini_options]` (testpaths, pythonpath, asyncio_mode=auto), `[tool.coverage.run/report]`
- `.flake8` — max-line-length 120, extend-ignore E203/W503/W504, per-file ignores for tests, full exclude list
- `.github/ISSUE_TEMPLATE/bug_report.md` — structured bug report template (label: `bug`; sections: description, steps, expected/actual, environment table, logs)
- `.github/ISSUE_TEMPLATE/feature_request.md` — feature request template (label: `enhancement`; component checkboxes: Backend/Frontend/Generator/DB/CI/Website/Docs)
- `.github/pull_request_template.md` — PR template with Summary, Related Issue, Type of Change, Changes Made, Test Plan (62 tests + builds), Checklist
- `website/src/hooks/useActiveSection.js` — `IntersectionObserver`-based hook returning the currently visible section id; `rootMargin` default shrinks root to mid-viewport
- `Makefile` — 14 GNU Make targets: `help`, `install`, `install-dev`, `test`, `test-cov`, `lint`, `format`, `format-check`, `build-website`, `dev-website`, `dev`, `pre-commit`, `ci-check`, `clean`
- `SECURITY.md` — GitHub Private Advisory reporting flow, 48 h ack / 14-day critical patch SLA, in/out-of-scope tables, existing security-measures summary
- `website/.eslintrc.json` — ESLint config for the promo site (eslint:recommended + plugin:react + plugin:react-hooks; `react/react-in-jsx-scope` off for React 17+ JSX transform)
- `website/` ESLint step added to GitHub Actions `website` CI job
- `website/.eslintrc.json` local pre-commit hook added to `.pre-commit-config.yaml`

### Changed
- `Header.jsx` — imports `useActiveSection`; nav links receive `header__nav-link--active` class and `aria-current="true"` when their section is in-viewport; mobile links receive `header__mobile-link--active`
- `Header.css` — `.header__nav-link--active` rule: `color: var(--clr-primary)` + `::after` 2 px underline; `.header__mobile-link--active`: primary colour only
- `pyproject.toml` — `pythonpath = ["."]` and `asyncio_mode = "auto"` added to `[tool.pytest.ini_options]`
- `website/package.json` — `lint` and `lint:fix` scripts added; `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks` added to `devDependencies`
- `Features.jsx`, `Highlights.jsx`, `NotFound.jsx` — unescaped `'`/`"` replaced with `&apos;`/`&ldquo;`/`&rdquo;` to satisfy `react/no-unescaped-entities`
- `useScrollReveal.js` — `options` destructured to primitive `threshold`/`rootMargin` before use; deps array updated accordingly; `eslint-disable` comment added for intentional object-reference exclusion

### Removed
- `pytest.ini` — deleted; all settings consolidated into `pyproject.toml` (no behaviour change; 62/62 tests still pass)

---

## [0.10.0] — Sprint 19 — Accessibility & Website Polish

### Added
- `prefers-reduced-motion` media query across all website CSS — disables `@keyframes` and `[data-reveal]` animations for users who request reduced motion (WCAG 2.3.3)
- `ScrollToTop` component — fixed-position "↑ back to top" button appears after 400 px of scroll; respects `prefers-reduced-motion` for instant vs smooth scroll
- Escape-key handler on the mobile navigation menu (`Header.jsx`) — pressing Escape closes the drawer without a click, inline with ARIA authoring best practices
- `aria-controls="mobile-menu"`, `aria-haspopup`, and `aria-modal` attributes on the hamburger button and mobile menu panel
- `<noscript>` fallback in `website/index.html` — dark-themed informational page for JS-disabled browsers
- `website/README.md` — developer quick-start guide for the promo site sub-project

---

## [0.9.0] — Sprint 18 — Branded SVG Icons + Production Highlights

### Added
- `TechIcons.jsx` — 20 hand-crafted inline SVG icons (one per technology): FastAPI, SQLAlchemy, Pydantic, Alembic, python-jose, slowapi, pytest+httpx, Uvicorn, React, MUI, Leaflet, Recharts, react-router, jsPDF, Axios, Vite, Docker Compose, Nginx, GitHub Actions, SQLite→MySQL
- `Highlights.jsx` + `Highlights.css` — "Production-Quality Signals" section with 6 metric cards (62 tests, 5 security layers, <100 ms WS, 3 CI jobs, 4-layer architecture, 12 features); each card shows a verifiable file path reference
- `#highlights` anchor added to `Header.jsx` nav (7 items) and `Footer.jsx` nav

### Changed
- `TechStack.jsx` — coloured dot indicators replaced with 28 px branded SVG icons via `TechIcon` dispatcher; infra row updated identically
- `TechStack.css` — grid column widened from `10 px` to `28 px`; added `.tech-icon` and `.tech-icon--sm` classes; fixed stray `}` brace that caused a CSS minifier warning
- `App.jsx` — `<Highlights />` wired between `<Architecture />` and `<ContactCTA />`

---

## [0.8.0] — Sprint 17 — Housekeeping & CI Expansion

### Added
- `CONTRIBUTING.md` — full contributor guide: prerequisites, local setup, test commands, code style, PR checklist, project layout, bug report format
- `website` CI job in `.github/workflows/ci.yml` — runs `npm ci` + `npm run build` on every push so Vite builds are validated in CI

### Changed
- README: test badge `49 → 62`, body text updated, GitHub Topics block added, CONTRIBUTING linked in ToC and footer
- `Header.jsx` NAV_LINKS: added `Stats` (`#stats`) and `Architecture` (`#architecture`)
- `.github/workflows/ci.yml` comment: "pytest (34 tests)" → "pytest (62 tests)"

---

## [0.7.0] — Sprint 16 — StatsBar & SVG Architecture Diagram

### Added
- `StatsBar.jsx` + `StatsBar.css` — "By the Numbers" section with 6 animated metric cards (62 tests · 12 features · <100 ms · 4 layers · WebSocket · MIT); responsive 2→3→6 column grid
- `Architecture.jsx` rewritten — inline SVG diagram (880×200 viewBox) with 4 nodes, 4 colour-coded arrow lines, animated WebSocket dashed stroke (`wsFlow` keyframe), SVG `<defs>` glow filters and arrowhead markers

### Changed
- `Architecture.css` fully rewritten to support SVG diagram layout and `wsFlow` animation
- `App.jsx` — `<StatsBar />` placed between `<TechStack />` and `<Architecture />`

---

## [0.6.0] — Sprint 15 — Rich Mock UIs & Screenshot Improvements

### Added
- Full CSS/SVG mock UIs for all 5 Screenshots panels: Dashboard (KPI + map), Dashboard Dark, Vehicle (stats + area chart), Admin (table), Reports (chart + position table)
- LinkedIn and Email social icons in `ContactCTA.jsx`
- `Architecture` link in `Footer.jsx` nav

### Changed
- `Features.jsx` and `TechStack.jsx` — "49 Tests" updated to "62 Tests"
- `HowItWorks.jsx` — typo "persistspositions" fixed to "persists positions"
- `og:image` updated to `/og-image.svg`; `twitter:image` meta tag added

---

## [0.5.0] — Sprint 14 — Promo Website Launch

### Added
- `website/` sub-project — Vite + React promotional landing page
- Sections: Hero, Features (12 cards), How It Works (4 steps), Screenshots (tab switcher), TechStack (2-column), Architecture, Contact/CTA, Footer
- Progressive scroll-reveal via `useScrollReveal` hook (Intersection Observer)
- `og-image.svg` (1200×630) social card
- `sitemap.xml`, `robots.txt`, JSON-LD `SoftwareApplication` structured data
- Plausible analytics integration via `VITE_PLAUSIBLE_DOMAIN`
- `vercel.json` — SPA rewrites + security/cache headers for Vercel deploy
- `NotFound` 404 page with back-home link

---

## [0.4.0] — Sprint 13 — Heatmap, Rate Limiting & Deploy Scripts

### Added
- `GET /vehicles/heatmap` — returns `[[lat, lng, intensity]]` array; `intensity = speed/80` capped at 1.0; `?hours` and `?limit` params
- `test_heatmap.py` — 13 tests covering empty DB, accuracy, intensity formula, param validation
- `slowapi` IP-based rate limiting middleware
- `deploy/nginx-ssl.conf`, `deploy/setup-vps.sh`, `deploy/fleet-generator.service`, `deploy/backup-db.sh`
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) with `backend`, `frontend`, `website` jobs

### Changed
- Total test count: 49 → 62 (added 13 heatmap tests)

---

## [0.3.0] — Sprint 11-12 — Geofence API & Security Hardening

### Added
- `GET/POST/PATCH/DELETE /api/geofence` — full CRUD for geofence zones; `GeofenceZone` SQLAlchemy model; 3 London zones auto-seeded on startup
- 15 geofence pytest tests
- Security middleware: CSP, `X-Frame-Options`, `X-Content-Type-Options` response headers
- `secrets.compare_digest` constant-time role checks to prevent username enumeration
- WebSocket delta protocol — typed messages (`full` / `delta` / `heartbeat`); only changed vehicles broadcast; HTTP polling fallback after 10 s disconnect
- `GENERATOR_INTERVAL_SECS` env var to configure tick speed

---

## [0.2.0] — Sprint 6-10 — Route Replay, Reports & Admin

### Added
- Route replay animation — play/pause/stop controls, speed multiplier, scrub slider
- Speed heatmap overlay (`leaflet.heat`) with colour gradient (green → red)
- `ReportsPage` — date-range picker, AreaChart, CSV download, PDF export (`jsPDF` + `jspdf-autotable`)
- `AdminPage` — CRUD table with search, sort, bulk-action toolbar, vehicle notes field
- Geofence circles on map with labels (`geofence.jsx`)
- Dark mode toggle persisted in `localStorage`
- Tile layer switcher (OSM / CartoDB Dark / CartoDB Light)
- WebSocket live-indicator dot in AppBar

---

## [0.1.0] — Sprint 1-5 — Core Application

### Added
- FastAPI backend on port 7767 with SQLite (dev) / MySQL (prod) via SQLAlchemy 2
- Pydantic v2 schemas, Alembic migrations (`alembic.ini`, `env.py`, initial autogenerate)
- `GET /vehicles`, `POST /vehicles`, `PATCH /vehicles/{id}`, `DELETE /vehicles/{id}`
- `GET /vehicles/{id}/positions` with date-range filtering
- `POST /auth/login` — JWT RS256 access token; `bcrypt` password hashing
- React frontend (port 3000) with MUI 5, react-router-dom 7, Axios
- `DashboardPage` — Leaflet map, vehicle sidebar, KPI cards, activity bar chart (Recharts)
- `VehiclePage` — vehicle details, speed area chart, position history table
- GPS data generator (`generator/generator.py`) simulating 10 London vehicles
- Docker Compose stack: backend + generator + frontend + nginx
- `start_local.ps1` — one-command local launch with port-in-use check
- 34 initial pytest tests (`test_auth.py`, `test_vehicles.py`)

---

[Unreleased]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.16.0...HEAD
[0.16.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Fleet-Manager-Demo/fleet-manager-demo/releases/tag/v0.1.0
