import useScrollReveal from '../hooks/useScrollReveal'
import './Features.css'

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Live Map',
    desc: 'Real-time vehicle positions pushed via WebSocket. Animated pulsing markers update every tick with zero page refresh.',
    badge: 'WebSocket',
  },
  {
    icon: '🌡️',
    title: 'Speed Heatmap',
    desc: 'Colour-coded polyline routes — green (slow) through red (fast) — give instant visual insight into driver behaviour.',
    badge: 'Leaflet',
  },
  {
    icon: '⏱️',
    title: 'Route Replay',
    desc: 'Scrub through historical GPS trails with play/pause/stop and variable speed (1×–10×) for post-incident analysis.',
    badge: 'History',
  },
  {
    icon: '📊',
    title: 'Fleet KPIs',
    desc: 'Live counters for Total / Active / Inactive / Maintenance vehicles. Numbers pulse when a status changes.',
    badge: 'Real-time',
  },
  {
    icon: '📈',
    title: 'Activity Chart',
    desc: 'Recharts bar chart showing fleet activity distribution across 24 hours. Instantly reveals peak hours.',
    badge: 'Recharts',
  },
  {
    icon: '📄',
    title: 'Reports & Export',
    desc: 'Select any vehicle and date range to get a speed timeline AreaChart plus CSV and PDF download in one click.',
    badge: 'jsPDF',
  },
  {
    icon: '🔒',
    title: 'JWT Auth & Roles',
    desc: 'Login endpoint issues signed JWT tokens. Admin role unlocks CRUD and bulk actions; viewers get read-only access.',
    badge: 'FastAPI',
  },
  {
    icon: '🛡️',
    title: 'Geofence Zones',
    desc: 'Define circular alert zones on the map. Backend serves zones via REST; frontend renders them as Leaflet circles.',
    badge: 'GeoAPI',
  },
  {
    icon: '🌙',
    title: 'Dark / Light Mode',
    desc: 'Toggle between dark and light MUI themes. Preference persists in localStorage across sessions.',
    badge: 'MUI 5',
  },
  {
    icon: '📱',
    title: 'Responsive Layout',
    desc: 'Mobile-first design with slide-in Drawer navigation, touch-friendly controls and adaptive KPI layout.',
    badge: 'Mobile',
  },
  {
    icon: '🧪',
    title: '62 Tests',
    desc: 'pytest + httpx test suite covers auth, vehicle CRUD, heatmap API, geofence and rate-limiting. Runs in CI on every push.',
    badge: 'pytest',
  },
  {
    icon: '🐳',
    title: 'Docker Compose',
    desc: 'One-command local setup: backend + generator + React dev server + Nginx all orchestrated via docker-compose.yml.',
    badge: 'Docker',
  },
]

export default function Features() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="features section-py" id="features" aria-labelledby="features-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">What&apos;s included</p>
          <h2 className="section-title" id="features-heading">
            Everything a fleet dashboard needs
          </h2>
          <p className="section-desc">
            12 production-ready features — WebSocket live feed, route replay, role-based auth,
            exportable reports and more — all open source.
          </p>
        </div>

        <ul className="features__grid" role="list" aria-label="Feature list">
          {FEATURES.map((f, i) => (
            <li key={f.title} className="feature-card" data-reveal data-reveal-delay={String(i * 60)}>
              <div className="feature-card__icon" aria-hidden="true">{f.icon}</div>
              <div className="feature-card__body">
                <div className="feature-card__top">
                  <h3 className="feature-card__title">{f.title}</h3>
                  <span className="badge badge-primary">{f.badge}</span>
                </div>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
