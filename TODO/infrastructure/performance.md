# Performance

> Frontend and backend performance optimisations:
> build size, caching, database query speed, SEO scores.

---

## Planned

- ⬜ Run Lighthouse audit after deployment — target ≥ 90 on all categories
- ⬜ Optimise real screenshots: WebP format, `loading="lazy"`, max 1200 px

---

## In Progress

_(nothing active)_

---

## Done

### Frontend Build
- ✅ Vite build: 61 modules, ~500 ms, 0 errors
- ✅ CSS gzip: ~4.6 kB; JS gzip: ~53 kB
- ✅ Google Fonts loaded with `preconnect` + `display=swap`
- ✅ `prefers-reduced-motion` — all animations and `data-reveal` transitions disabled (WCAG 2.3.3)
- ✅ `<noscript>` fallback page for users without JavaScript

### Database
- ✅ Composite index `positions(vehicle_id, timestamp)` for history range queries
- ✅ Index on `vehicles(license_plate)` for search
- ✅ Async background task purges positions older than `POSITION_RETENTION_DAYS`

### WebSocket Efficiency
- ✅ Delta updates — only changed vehicles are broadcast per tick
- ✅ Fingerprint on {lat, lng, speed, status} avoids redundant payloads
