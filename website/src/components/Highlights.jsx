/**
 * Highlights.jsx — "Built to Production Standards"
 *
 * Concrete, verifiable code-quality signals for recruiters and developers.
 * Each card maps to a specific, testable aspect of the codebase so every
 * claim can be verified in the repository.
 */
import useScrollReveal from '../hooks/useScrollReveal'
import './Highlights.css'

const CARDS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 3h6v8l4 9H5L9 11V3Z"
          stroke="#2e7d32" strokeWidth="1.5" fill="#2e7d32" fillOpacity=".1"
          strokeLinejoin="round"/>
        <path d="M9 3h6" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7.5 16l2.5 2.5L16 12" stroke="#2e7d32" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#2e7d32',
    title: 'Test-Driven Development',
    metric: '62 / 62',
    metricLabel: 'tests passing',
    body: 'Full pytest suite covering auth, CRUD, heatmap and geofence endpoints. Every route is exercised via httpx TestClient with fixture-based DB isolation — zero mock patches needed.',
    tag: 'backend/tests/',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2 4 6v6c0 4.5 3.5 8.5 8 10 4.5-1.5 8-5.5 8-10V6Z"
          stroke="#1565c0" strokeWidth="1.5" fill="#1565c0" fillOpacity=".1"/>
        <path d="M9 12l2 2 4-4" stroke="#1565c0" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#1565c0',
    title: 'Security by Design',
    metric: '5',
    metricLabel: 'defence layers',
    body: 'JWT RS256 → bcrypt hashing → slowapi rate limiting → security-header middleware (CSP, X‑Frame‑Options) → secrets.compare_digest constant-time checks. No SQL injection surface via ORM.',
    tag: 'backend/app/security.py',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0097a7" strokeWidth="1.3"
          fill="#0097a7" fillOpacity=".08"/>
        <path d="M8 12h8M16 12l-3-3M16 12l-3 3" stroke="#0097a7" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="5" cy="12" r="1.5" fill="#0097a7"/>
      </svg>
    ),
    color: '#0097a7',
    title: 'Efficient Real-Time Protocol',
    metric: '< 100 ms',
    metricLabel: 'latency target',
    body: 'WebSocket delta protocol dispatches only changed vehicle objects, not full fleet snapshots. Typed message envelopes (full / delta / heartbeat) with automatic HTTP-polling fallback on disconnect.',
    tag: 'backend/app/ws_manager.py',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"
          stroke="#6a1b9a" strokeWidth="1.4" fill="#6a1b9a" fillOpacity=".08"/>
        <path d="M3 9h18" stroke="#6a1b9a" strokeWidth="1.2"/>
        <circle cx="6.5" cy="7" r="1" fill="#6a1b9a"/>
        <circle cx="9.5" cy="7" r="1" fill="#6a1b9a"/>
        <path d="M8 13l2.5 2.5L16 11" stroke="#6a1b9a" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#6a1b9a',
    title: 'Production-Ready Delivery',
    metric: '3',
    metricLabel: 'CI jobs on every push',
    body: 'Docker Compose stack (backend + generator + frontend + nginx), Alembic version-controlled migrations, GitHub Actions CI running pytest + React build + Vite build, VPS deploy scripts with systemd unit.',
    tag: '.github/workflows/ci.yml',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7l9-5 9 5-9 5-9-5Z"
          fill="#b71c1c" fillOpacity=".15" stroke="#b71c1c" strokeWidth="1.3"/>
        <path d="M3 7v7l9 5 9-5V7" fill="none" stroke="#b71c1c" strokeWidth="1.3"/>
        <path d="M3 14l9-5 9 5" stroke="#b71c1c" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    ),
    color: '#b71c1c',
    title: 'Clean 4-Layer Architecture',
    metric: '4',
    metricLabel: 'separated concerns',
    body: 'Generator → SQLite/MySQL → FastAPI (router / service / schema) → React frontend. Each layer is independently testable and replaceable, with Pydantic v2 enforcing contract boundaries at every API surface.',
    tag: 'README.md#architecture',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#e65100" strokeWidth="1.3"
          fill="#e65100" fillOpacity=".08"/>
        <path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z"
          fill="#e65100" fillOpacity=".5" stroke="#e65100" strokeWidth=".8"/>
      </svg>
    ),
    color: '#e65100',
    title: 'Feature-Complete Demo',
    metric: '12',
    metricLabel: 'live features',
    body: 'Route replay, speed heatmap, geofence zones, fleet KPIs, activity charts, CSV/PDF export, dark mode, bulk-action admin table, WebSocket live feed, tile-layer switcher, notes field, JWT-authenticated API.',
    tag: 'website/#features',
  },
]

export default function Highlights() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="highlights section-py" id="highlights"
      aria-labelledby="highlights-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">Built to a standard</p>
          <h2 className="section-title" id="highlights-heading">
            Production-Quality Signals
          </h2>
          <p className="section-desc">
            Every claim below is backed by code you can read in the repository —
            no hand-wavy &ldquo;best practices&rdquo; unchecked.
          </p>
        </div>

        <ul className="highlights__grid" role="list">
          {CARDS.map((c, i) => (
            <li
              key={c.title}
              className="hl-card"
              style={{ '--hl-color': c.color }}
              data-reveal
              data-reveal-delay={String(i * 80)}
            >
              <span className="hl-card__icon" aria-hidden="true">{c.icon}</span>
              <div className="hl-card__metric">
                <span className="hl-card__number">{c.metric}</span>
                <span className="hl-card__unit">{c.metricLabel}</span>
              </div>
              <h3 className="hl-card__title">{c.title}</h3>
              <p className="hl-card__body">{c.body}</p>
              <code className="hl-card__tag">{c.tag}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
