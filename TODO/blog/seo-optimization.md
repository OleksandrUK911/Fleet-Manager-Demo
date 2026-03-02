# SEO Optimization

> Covers search engine optimisation for the promo website and GitHub profile:
> meta tags, Open Graph, structured data, sitemap, analytics.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Meta & HTML Structure
- ✅ Base `<title>` and `<meta name="description">` in `index.html`
- ✅ Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`
- ✅ Twitter Card tags
- ✅ `<meta name="keywords">` with relevant keywords
- ✅ `<link rel="canonical">` for primary domain
- ✅ `manifest.json` with app name and icons (PWA-ready)
- ✅ `robots.txt` — allow indexing of public pages
- ✅ `sitemap.xml` for search engine indexing
- ✅ Structured data: JSON-LD `SoftwareApplication` schema in `index.html`

### Content Structure
- ✅ Landing page with correct heading hierarchy: Hero `<h1>`, sections `<h2>`, cards `<h3>`
- ✅ Alt text on all images; `aria-label` on interactive elements

### GitHub & Public Profile
- ✅ Detailed `README.md` with screenshots section
- ✅ `LICENSE` file (MIT)
- ✅ GitHub topics listed in README: `fastapi`, `react`, `leaflet`, `fleet-tracking`, etc.
- ✅ Shields.io badges: CI, license, Python, FastAPI, React, tests

### Analytics
- ✅ Plausible Analytics via `VITE_PLAUSIBLE_DOMAIN` env var in `website/src/main.jsx`
- ✅ Event tracking on CTA buttons: `Live Demo`, `GitHub Click`, `API Docs` via `window.plausible?.()`
