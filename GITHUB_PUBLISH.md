# GITHUB_PUBLISH.md — Підготовка до публікації на GitHub

## Перший push

```bash
cd FleetManagerDemo
git init
git add .
git commit -m "feat: Fleet Manager Demo v0.15.0 — FastAPI + React + Leaflet + WebSocket"
git remote add origin https://github.com/OleksandrUK911/Fleet-Manager-Demo.git
git branch -M main
git push -u origin main
```

---

## ✅ ВКЛЮЧИТИ до репозиторію

### Код застосунку

| Шлях | Опис |
|------|------|
| `backend/app/` | Python-код FastAPI: main, models, schemas, auth, routers, generator, rate_limit |
| `backend/tests/` | 62 pytest tests: test_auth, test_vehicles, test_heatmap, test_geofence |
| `backend/alembic/` | Alembic migration scripts |
| `backend/requirements.txt` | Залежності Python |
| `backend/schema.sql` | MySQL DDL + seed data |
| `backend/.env.example` | Шаблон змінних середовища (без справжніх паролів) |
| `frontend/src/` | React SPA: компоненти, сторінки, хуки, API-клієнт |
| `frontend/public/` | HTML-шаблон, маніфест |
| `frontend/package.json` | NPM-залежності та скрипти |
| `website/src/` | Промо-сайт: Vite + React, 11 секцій |
| `website/public/` | favicon.svg, og-image.svg, robots.txt, sitemap.xml |
| `website/index.html` | HTML з SEO, OG-тегами, JSON-LD |
| `website/package.json` | NPM: react, vite, eslint + plugins |
| `website/.eslintrc.json` | ESLint config (react + react-hooks) |
| `website/vite.config.js` | Vite конфіг (base /, dist output) |
| `website/vercel.json` | SPA redirect + security headers + immutable cache |

### Деплой і DevOps

| Шлях | Опис |
|------|------|
| `docker-compose.yml` | Backend + generator + frontend + nginx in one command |
| `docker/` | Dockerfile(s) для окремих сервісів |
| `deploy/nginx-ssl.conf` | Nginx: HTTPS, HTTP→SSL redirect, WebSocket proxy |
| `deploy/setup-vps.sh` | Ubuntu 22.04 one-shot provisioner (UFW, certbot, systemd) |
| `deploy/fleet-generator.service` | systemd unit для генератора даних |
| `deploy/backup-db.sh` | SQLite/MySQL backup (gzip, 7-денна ротація) |
| `nginx/` | Nginx конфіг для локальної розробки |
| `start_local.ps1` | Windows: одночасний запуск backend + generator + frontend |
| `start_backend.sh` | Linux/macOS запуск backend |

### Інструменти якості коду

| Шлях | Опис |
|------|------|
| `Makefile` | 14 targets: test, lint, format, build-website, ci-check, clean тощо |
| `pyproject.toml` | Black (120), isort (black profile), pytest, coverage config |
| `.flake8` | flake8: max-line 120, extend-ignore E203/W503/W504 |
| `.editorconfig` | UTF-8, LF, indent per file type |
| `.pre-commit-config.yaml` | Pre-commit: black, isort, flake8, eslint (frontend + website) |

### CI/CD

| Шлях | Опис |
|------|------|
| `.github/workflows/ci.yml` | 3 jobs: backend (flake8 + pytest 62) / frontend build / website lint + build |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Шаблон баг-репорту |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Шаблон feature request |
| `.github/pull_request_template.md` | Шаблон PR |

### Документація

| Шлях | Опис |
|------|------|
| `README.md` | Головна документація (features, structure, API, Makefile, deploy) |
| `CONTRIBUTING.md` | Покрокове керівництво контриб'ютора |
| `CHANGELOG.md` | Keep-a-Changelog v0.1.0 → v0.15.0 |
| `SECURITY.md` | Reporting policy, scope, SLA, security measures |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 |
| `LICENSE` | MIT |
| `GITHUB_PUBLISH.md` | Цей файл |
| `TODO/` | Вся папка трекінгу завдань |
| `website/README.md` | Quick-start для промо-сайту |
| `.gitignore` | Правила виключення файлів |

---

## 🚫 НЕ ВКЛЮЧАТИ до репозиторію

### Секрети

| Шлях | Причина |
|------|---------|
| `backend/.env` | DATABASE_URL, JWT_SECRET_KEY, паролі |
| `*.key`, `*.pem` | SSL-сертифікати, приватні ключі |

### Локальні дані

| Шлях | Причина |
|------|---------|
| `fleet.db` | Локальна SQLite база (у кожного своя) |
| `ci_test.db` | SQLite файл, що створюється pytest у CI |

### Згенеровані файли

| Шлях | Причина |
|------|---------|
| `.venv/` | Python virtual environment (~100–200 MB) |
| `**/node_modules/` | NPM packages (~300–500 MB) |
| `frontend/build/` | React production build |
| `website/dist/` | Vite production build |
| `**/__pycache__/` | Python bytecode |
| `**/*.pyc` | Compiled Python |
| `.pytest_cache/` | pytest cache |

### Системні файли

| Шлях | Причина |
|------|---------|
| `.DS_Store` | macOS метадані |
| `Thumbs.db` | Windows thumbnail cache |
| `*.log` | Лог-файли |

---

## Перевірка перед push

```bash
# Переконатись що секрети не потрапили
git ls-files | grep "\.env$"        # → порожньо
git ls-files | grep "fleet\.db"     # → порожньо
git ls-files | grep "\.venv"        # → порожньо
git ls-files | grep "node_modules"  # → порожньо

# Переглянути файли які будуть закомічені
git status
git diff --stat HEAD
```

---

## Після push — налаштування репозиторію на GitHub

1. **Settings → About** → Description:
   _"Real-time fleet vehicle tracking dashboard — FastAPI · React · Leaflet · WebSocket · Docker"_

2. **Settings → About → Topics:**
   `fastapi` `react` `leaflet` `fleet-tracking` `real-time` `websocket` `vehicle-tracking` `material-ui` `sqlite` `docker` `python` `portfolio`

3. **Settings → Features** → увімкніть Issues та Discussions.

4. **Settings → Branches** → захистіть `main`: require PR + status checks (CI).

5. **Security → Code security and analysis** → увімкніть Dependabot alerts.

6. **Releases** → після деплою створіть `v1.0.0` з описом з `CHANGELOG.md`.

---

## Оновлення перед першим публічним деплоєм

Замініть placeholder-значення у цих файлах:

| Файл | Що замінити |
|------|-------------|
| `README.md` | `https://fleet.yourdomain.com` → реальний URL демо |
| `README.md` | `your-username` → ваш GitHub username |
| `website/index.html` | `https://fleet-manager-demo.vercel.app/` → реальний Vercel URL |
| `website/src/components/Header.jsx` | Встановіть `VITE_DEMO_URL` і `VITE_GITHUB_URL` у налаштуваннях Vercel ENV — hardcoding не потрібен |
| `website/src/components/ContactCTA.jsx` | Встановіть `VITE_DEMO_URL`, `VITE_GITHUB_URL`, `VITE_SWAGGER_URL` у Vercel ENV — читаються з `import.meta.env` |
| `backend/app/main.py` | CORS `allow_origins` → ваш frontend домен |
| `deploy/nginx-ssl.conf` | `server_name` → ваш реальний домен |
| `SECURITY.md` | Email для звітів → реальний контакт |
| CI badge у `README.md` | `your-username/FleetManagerDemo` → ваш repo |
