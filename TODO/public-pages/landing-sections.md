# Landing — Content Sections

> All content sections of the promo website below the hero:
> Features, How It Works, Tech Stack, Architecture, Highlights,
> Screenshots tab switcher, Stats bar, Contact CTA.
> Also covers site structure, routing, and design system.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Site Structure & Routing
- ✅ Framework selected: Vite + React SPA (static, deployed on Vercel)
- ✅ `usePath()` hook for client-side routing without react-router
- ✅ Shared Header and Footer on all pages
- ✅ NotFound (404) page with back link to home
- ✅ Mobile-first layout with breakpoints: 375 px / 768 px / 1280 px

### Design System
- ✅ Color palette: primary `#1976d2`, accent `#00e5ff`, background `#08091a`
- ✅ CSS custom properties: `--clr-primary`, `--radius`, `--font-heading`
- ✅ Typography scale: h1 60 px / h2 48 px / h3 30 px / body 16 px
- ✅ Google Fonts: Inter + Plus Jakarta Sans (`preconnect` + `display=swap`)
- ✅ `favicon.svg` for the website
- ✅ Micro-animations: hover on buttons, cards, links (transition 200 ms ease)
### Features Section
- ✅ 12 feature cards: Real-Time Map, Speed Heatmap, Fleet KPIs, Activity Chart,
  Vehicle History, Reports/CSV, Admin Panel, Dark Mode, WS Live Feed,
  Tile Switcher, Route Replay, Geofence Zones
- ✅ CSS Grid layout: 1 / 2 / 3 columns (responsive)
- ✅ SVG icons from `TechIcons.jsx` (20 inline branded SVGs)
- ✅ Hover animation: `translateY(-4px)` + blue border glow

### How It Works Section
- ✅ 4 numbered steps: Generator → Backend → Map → Report
- ✅ Horizontal layout (desktop) / vertical (mobile)
- ✅ Connector line/arrow between steps (desktop only)
- ✅ Scroll-reveal animation via `useScrollReveal` + `data-reveal` attributes

### Stats Bar
- ✅ `StatsBar.jsx` — 6 metrics: 74 tests · 12 features · <100 ms · 4 layers · WS · MIT

### Tech Stack Section
- ✅ Two-column grid: Backend / Frontend + Infra row (`TechStack.jsx`)
- ✅ Correct versions: FastAPI 0.111, Leaflet 1.9, jsPDF 4.2, Recharts 3.7, react-router 7.13
- ✅ Section label: "Production-proven stack"

### Architecture Diagram
- ✅ Inline SVG in `Architecture.jsx` — 4 nodes: Browser ↔ React ↔ FastAPI ↔ SQLite ↔ Generator
- ✅ WebSocket channel: blue dashed animated arrow (`wsFlow`)
- ✅ Generator shown as separate service with orange INSERT arrow

### Highlights Section
- ✅ 6 "Production-Quality Signals" cards with scroll-reveal (`Highlights.jsx`)
- ✅ Responsive 1 / 2 / 3 columns

### Screenshots Tab Switcher
- ✅ CSS Tab Switcher with `aria-controls` / `role="tab"` (5 panels)
- ✅ Browser chrome mockup with tri-dot buttons + URL bar
- ✅ Caption under each panel (name + 1-line description)
- ⬜ Take real screenshots: Dashboard, Dark Mode, VehiclePage, AdminPage, ReportsPage
- ⬜ Crop and optimise screenshots (WebP, max 1200 px width)

### Contact / CTA Section
- ✅ Final CTA block: "Try the demo right now" + 3 buttons: Live Demo, API Docs, View Source
- ✅ Social links: GitHub, LinkedIn, Email with Plausible event tracking
- ✅ `mailto:` link in ContactCTA
- ✅ All URLs read from `import.meta.env.VITE_*` with fallbacks

### Mobile Responsiveness
- ✅ Breakpoints: 375 px / 768 px / 1024 px / 1280 px
- ✅ Hero: text + buttons below; image hidden / above on mobile
- ✅ Hamburger nav with Escape-to-close, `aria-controls`, `aria-haspopup`, `aria-modal`
- ✅ Scroll-to-top button (`ScrollToTop.jsx`) — visible after 400 px, respects `prefers-reduced-motion`
- ✅ All `@keyframes` and `[data-reveal]` transitions disabled when `prefers-reduced-motion`
- ⬜ Test on real devices: iPhone SE, Pixel 5, iPad Air
