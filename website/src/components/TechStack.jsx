import useScrollReveal from '../hooks/useScrollReveal'
import { TechIcon } from './TechIcons'
import './TechStack.css'

const BACKEND = [
  { name: 'FastAPI',       version: '0.133',  role: 'REST API + WebSocket server',       color: '#009688' },
  { name: 'SQLAlchemy 2',  version: '2.0',    role: 'ORM — Vehicle & Position models',   color: '#cc2222' },
  { name: 'Pydantic v2',   version: '2.x',    role: 'Schema validation & serialisation', color: '#e92063' },
  { name: 'Alembic',       version: '1.18',   role: 'Database migration versioning',      color: '#6d4c41' },
  { name: 'python-jose',   version: '3.5',    role: 'JWT token sign & verify',           color: '#5c6bc0' },
  { name: 'slowapi',       version: '0.1.9',  role: 'IP-based rate limiting',            color: '#f57c00' },
  { name: 'pytest + httpx', version: '9.0',   role: '62-test CI suite',                  color: '#2e7d32' },
  { name: 'Uvicorn',       version: '0.34',   role: 'ASGI production server',            color: '#1976d2' },
]

const FRONTEND = [
  { name: 'React 18',       version: '18.3',  role: 'SPA, hooks, context',              color: '#00bcd4' },
  { name: 'Material UI 5',  version: '5.15',  role: 'Component library & theming',      color: '#1976d2' },
  { name: 'Leaflet',        version: '1.9',   role: 'Interactive GPS map (react-leaflet 4.2)', color: '#4caf50' },
  { name: 'Recharts',       version: '3.7',   role: 'Speed & activity charts',          color: '#8e24aa' },
  { name: 'react-router 7', version: '7.13',  role: 'Client-side routing',              color: '#f44336' },
  { name: 'jsPDF',          version: '4.2',   role: 'PDF report generation',            color: '#e91e63' },
  { name: 'Axios',          version: '1.x',   role: 'HTTP client with interceptors',    color: '#5c6bc0' },
  { name: 'Vite',           version: '5.x',   role: 'Build tool & dev server',          color: '#ff6d00' },
]

const INFRA = [
  { name: 'Docker Compose', role: 'Local container orchestration', color: '#0288d1' },
  { name: 'Nginx',          role: 'Static files + /api proxy',     color: '#43a047' },
  { name: 'GitHub Actions', role: 'CI: lint + pytest + npm build', color: '#24292e' },
  { name: 'SQLite → MySQL', role: 'Dev DB → production DB',        color: '#f57f17' },
]

export default function TechStack() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="stack section-py" id="stack" aria-labelledby="stack-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">Production-proven stack</p>
          <h2 className="section-title" id="stack-heading">Tech Stack</h2>
          <p className="section-desc">
            Carefully chosen, production-proven tools — each playing a specific role
            in the architecture.
          </p>
        </div>

        <div className="stack__columns">
          <TechColumn title="Backend" emoji="🐍" items={BACKEND} reveal />
          <TechColumn title="Frontend" emoji="⚛️" items={FRONTEND} reveal delay={100} />
        </div>

        <h3 className="stack__infra-heading" data-reveal data-reveal-delay="150">Infrastructure & Tooling</h3>
        <ul className="stack__infra" aria-label="Infrastructure tools">
          {INFRA.map((t, i) => (
            <li key={t.name} className="stack__infra-item" data-reveal data-reveal-delay={String(200 + i * 60)}>
              <span className="tech-icon tech-icon--sm" aria-hidden="true"><TechIcon name={t.name} color={t.color} /></span>
              <strong>{t.name}</strong>
              <span className="stack__infra-role">{t.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TechColumn({ title, emoji, items, reveal, delay = 0 }) {
  return (
    <div className="tech-col" data-reveal={reveal ? '' : undefined} data-reveal-delay={reveal ? String(delay) : undefined}>
      <h3 className="tech-col__heading">
        <span aria-hidden="true">{emoji}</span> {title}
      </h3>
      <ul className="tech-col__list" role="list" aria-label={`${title} technologies`}>
        {items.map(t => (
          <li key={t.name} className="tech-item">
            <span className="tech-icon" aria-hidden="true"><TechIcon name={t.name} color={t.color} /></span>
            <div className="tech-item__info">
              <span className="tech-item__name">{t.name}</span>
              <span className="tech-item__version">v{t.version}</span>
            </div>
            <span className="tech-item__role">{t.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
