# Fleet Manager — Task Board

**Project:** Fleet Manager Demo
**Stack:** FastAPI · SQLite/MySQL · React · Material UI · Leaflet
**Status:** 🟢 Active development

---

## Folder Structure

```
TODO/
├── README.md                  ← You are here (master index)
├── blog/                      ← Articles, SEO, content logic
│   ├── content-strategy.md
│   └── seo-optimization.md
├── admin-panel/               ← Dashboard, users, roles, content management
│   ├── dashboard-kpis.md
│   ├── vehicle-management.md
│   ├── user-roles-auth.md
│   └── reports-export.md
├── public-pages/              ← Landing, promo site, media
│   ├── landing-hero.md
│   ├── landing-sections.md
│   ├── screenshots-media.md
│   └── deploy-vercel.md
├── api-backend/               ← API endpoints, DB, generator, real-time
│   ├── vehicles-api.md
│   ├── geofence-api.md
│   ├── auth-api.md
│   ├── websocket-realtime.md
│   ├── database-migrations.md
│   └── data-generator.md
├── infrastructure/            ← Deployment, security, performance, CI/CD
│   ├── deployment-vps.md
│   ├── docker-ci-cd.md
│   ├── security.md
│   └── performance.md
└── refactoring/               ← Technical debt, code quality, tooling
    ├── frontend-debt.md
    ├── backend-debt.md
    └── tooling-config.md
```

---

## Progress Overview

> Counts reflect unique tasks only — duplicates removed after migration audit (2026-03-02).

| Area             | ✅ Done | 🔄 In Progress | ⬜ Planned | Total |
|------------------|---------|----------------|-----------|-------|
| Blog / SEO       | 16      | 0              | 0         | 16    |
| Admin Panel      | 28      | 0              | 0         | 28    |
| Public Pages     | 93      | 0              | 8         | 101   |
| API & Backend    | 52      | 0              | 0         | 52    |
| Infrastructure   | 26      | 1              | 0         | 27    |
| Refactoring      | 42      | 0              | 0         | 42    |
| **Total**        | **257** | **1**          | **8**     | **266** |

> Overall: ~97% complete. Remaining 8 tasks all depend on production deployment.

---

## Active Sprint Priorities

1. ⬜ Deploy to Vercel — connect repo, set `VITE_*` env vars
2. ⬜ Take real screenshots — dashboard, dark mode, admin, reports
3. ⬜ Lighthouse audit ≥ 90 (requires live deployment)
4. ⬜ Test on real devices — iPhone SE, Pixel 5, iPad Air
5. 🟡 VPS SSL + Nginx — Certbot Let's Encrypt in progress

---

## Conventions

- ✅ Done
- 🔄 In Progress
- ⬜ Planned / Not Started
- Each file has three sections: **Planned**, **In Progress**, **Done**
- Tasks are small and actionable — one concrete deliverable per line
