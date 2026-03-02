# Fleet Manager Demo — Promo Website

> **Vite + React** promotional landing page for the Fleet Manager Demo project.
> Deployed to [Vercel](https://vercel.com) · lives in the `website/` folder of the monorepo.

---

## Stack

| Tool | Role |
|------|------|
| **Vite 5** | Build tool & dev server |
| **React 18** | UI framework |
| **Plain CSS** (custom properties) | Styling — no Tailwind, no CSS-in-JS |
| **Inter + Plus Jakarta Sans** | Google Fonts |
| **Vercel** | Static hosting + CI/CD |

---

## Quick Start

```bash
# From the repo root:
cd website

npm install          # install dependencies
npm run dev          # dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview dist/ locally
```

---

## Project Structure

```
website/
├── public/
│   ├── favicon.svg          # Site icon
│   ├── og-image.svg         # 1200×630 Open Graph social card
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── Header.jsx/.css          # Sticky nav, hamburger, Escape-key close
│   │   ├── Hero.jsx/.css            # First-screen CTA, badges, mock browser
│   │   ├── Features.jsx/.css        # 12 feature cards grid
│   │   ├── HowItWorks.jsx/.css      # 4-step numbered flow
│   │   ├── Screenshots.jsx/.css     # Tab switcher with 5 rich mock UIs
│   │   ├── TechStack.jsx/.css       # Backend / Frontend / Infra columns
│   │   ├── TechIcons.jsx            # 20 branded inline SVG icons
│   │   ├── StatsBar.jsx/.css        # "By the Numbers" 6-metric grid
│   │   ├── Architecture.jsx/.css    # Inline SVG system diagram
│   │   ├── Highlights.jsx/.css      # "Production-Quality Signals" 6 cards
│   │   ├── ContactCTA.jsx/.css      # Final CTA + social links
│   │   ├── Footer.jsx/.css          # Copyright, nav, tech badges
│   │   ├── NotFound.jsx/.css        # 404 page
│   │   └── ScrollToTop.jsx/.css     # Fixed "back to top" button
│   ├── hooks/
│   │   ├── useScrollReveal.js      # Intersection Observer scroll-reveal
│   │   └── useActiveSection.js     # Tracks active scroll section for nav highlight
│   ├── App.jsx                     # Root component, minimal hash router
│   ├── main.jsx                    # Entry point, Plausible analytics init
│   └── index.css                   # Global reset, custom properties, utilities
├── index.html                       # SEO meta, OG, JSON-LD, Google Fonts
├── vite.config.js
├── vercel.json                      # SPA rewrites, security headers, cache rules
└── package.json
```

---

## Pre-Deploy Configuration

All URLs are driven by **environment variables** — no source-file edits needed.
Set them in Vercel **Project Settings → Environment Variables** (or in `website/.env.local` locally):

| Variable | Component(s) | Example value |
|----------|-------------|---------------|
| `VITE_DEMO_URL` | Hero, Header, ContactCTA | `http://fleet-manager-demo.skakun-ml.com/app/` |
| `VITE_GITHUB_URL` | Hero, Header, ContactCTA, Footer | `https://github.com/OleksandrUK911/Fleet-Manager-Demo` |
| `VITE_SWAGGER_URL` | ContactCTA | `http://fleet-manager-demo.skakun-ml.com/api/docs` |
| `VITE_PLAUSIBLE_DOMAIN` | main.jsx (analytics) | `fleet-manager-demo.skakun-ml.com` |

All variables fall back to safe `localhost` defaults when absent, so the site works locally without any `.env.local` file.

Also update these **static files** once you know your deployed URL:

| File | Field | Set to |
|------|-------|--------|
| `index.html` | `og:url`, `canonical` | Your deployed website URL |
| `public/sitemap.xml` | `<loc>` | Your deployed website URL |

---

## Environment Variables

Create `website/.env.local` for local overrides (git-ignored):

```env
# Live app URL — used in "Live Demo" CTAs (falls back to localhost:3000)
VITE_DEMO_URL=http://fleet-manager-demo.skakun-ml.com/app/

# GitHub repo URL — used in GitHub buttons
VITE_GITHUB_URL=https://github.com/OleksandrUK911/Fleet-Manager-Demo

# Swagger docs URL — used in "API Docs" button
VITE_SWAGGER_URL=http://fleet-manager-demo.skakun-ml.com/api/docs

# Plausible Analytics — leave empty to disable event tracking
VITE_PLAUSIBLE_DOMAIN=fleet-manager-demo.skakun-ml.com
```

On Vercel, set all four in **Project Settings → Environment Variables**.

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Set **Root Directory** → `website`.
4. Build command: `npm run build` · Output: `dist`.
5. Add environment variables: `VITE_DEMO_URL`, `VITE_GITHUB_URL`, `VITE_SWAGGER_URL`, `VITE_PLAUSIBLE_DOMAIN`.
6. Enable **Automatic Deployments** on push to `main`.

`vercel.json` already configures:
- SPA rewrite (`/* → /index.html`)
- Security headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`)
- Long-term cache for hashed assets in `dist/assets/`

---

## Key Design Notes

**CSS Custom Properties** — all colours, spacing and radii are variables in `index.css`:
```css
--clr-bg: #08091a  |  --clr-primary: #1976d2  |  --clr-accent: #00e5ff
```

**Scroll-Reveal** — `useScrollReveal` uses a single `IntersectionObserver`.
Add `data-reveal` (+ optional `data-reveal-delay="200"` in ms) to any element.

**Accessibility** — `prefers-reduced-motion: reduce` disables all `@keyframes` and `[data-reveal]` transitions site-wide. The hamburger menu closes on Escape. The scroll-to-top button respects reduced motion for instant vs smooth scroll.

**Adding a new section**:
1. Create `src/components/MySection.jsx` + `MySection.css`.
2. Import and render in `App.jsx`.
3. Add `{ href: '#my-section', label: 'My Section' }` to `Header.jsx` `NAV_LINKS` and `Footer.jsx` `LINKS`.
4. Give the `<section>` `id="my-section"` and `aria-labelledby="my-section-heading"`.

---

## CI

The `website` job in `.github/workflows/ci.yml` runs on every push:

```yaml
- run: npm ci
- run: npm run lint   # ESLint; fails on any warning (--max-warnings 0)
- run: npm run build  # Vite production build; fails on any error
```

---

## License

MIT — see [LICENSE](../LICENSE).
