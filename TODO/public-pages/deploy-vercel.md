# Promo Site Deployment (Vercel)

> Deploying the `website/` Vite + React promo site to Vercel.
> Separate from the main Fleet Manager app deployment on VPS.

---

## Planned

- ⬜ Connect GitHub repository to Vercel project
- ⬜ Set environment variables on Vercel:
  - `VITE_DEMO_URL` — deployed app URL
  - `VITE_GITHUB_URL` — repository URL
  - `VITE_SWAGGER_URL` — Swagger UI URL (`/api/docs`)
  - `VITE_PLAUSIBLE_DOMAIN` — analytics domain
- ⬜ Enable auto-deploy on push to `main`
- ⬜ Configure custom domain (e.g. `fleet-manager.yourdomain.com`)
- ⬜ Verify HTTPS and HTTP → HTTPS redirect
- ⬜ Run Lighthouse audit — target score ≥ 90 on all categories

---

## In Progress

_(nothing active)_

---

## Done

- ✅ Selected Vercel as hosting platform
- ✅ `vercel.json` created: SPA rewrites, security headers (HSTS, CSP, Permissions-Policy)
- ✅ Build command configured: `npm run build` (Vite)
- ✅ `.env.example` documents all four `VITE_*` variables
- ✅ `website/vercel.json` — cache headers, HSTS max-age 63072000,
  CSP (default-src self; connect-src plausible.io; frame-ancestors none)
