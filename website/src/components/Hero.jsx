import './Hero.css'

const DEMO_URL   = import.meta.env.VITE_DEMO_URL   || 'https://fleet-manager-demo-production-47c1.up.railway.app/app'
const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/OleksandrUK911/Fleet-Manager-Demo'
const GITHUB_STARS_BADGE = 'https://img.shields.io/github/stars/Fleet-Manager-Demo/fleet-manager-demo?style=social'
const CI_BADGE = 'https://github.com/Fleet-Manager-Demo/fleet-manager-demo/actions/workflows/ci.yml/badge.svg'

const TECH_BADGES = ['FastAPI', 'React 18', 'Leaflet', 'WebSocket', 'Material UI', 'SQLite']

const STATS = [
  { value: '5',   label: 'Live vehicles' },
  { value: '<1s', label: 'WS latency'    },
  { value: '62', label: 'Tests passing' },
  { value: '4',   label: 'UK cities'     },
]

export default function Hero() {
  return (
    <section className="hero" id="home" aria-label="Hero">
      {/* background grid */}
      <div className="hero__grid" aria-hidden="true" />
      {/* glow blobs */}
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />

      <div className="container hero__inner">
        {/* Text column */}
        <div className="hero__content">
          <p className="section-label animate-fadeInUp" style={{ animationDelay: '0ms' }}>
            Open Source Demo Project
          </p>

          <h1 className="hero__title animate-fadeInUp" style={{ animationDelay: '80ms' }}>
            Real-Time{' '}
            <span className="text-gradient">Fleet Tracking</span>{' '}
            Dashboard
          </h1>

          <p className="hero__subtitle animate-fadeInUp" style={{ animationDelay: '160ms' }}>
            Monitor vehicle positions live on an interactive map, replay routes, spot speed
            anomalies and export reports — all powered by a WebSocket-first FastAPI backend
            and a React + Leaflet frontend.
          </p>

          {/* Tech badge strip */}
          <div className="hero__badges animate-fadeInUp" style={{ animationDelay: '240ms' }} aria-label="Tech stack">
            {TECH_BADGES.map(t => (
              <span key={t} className="badge badge-primary">{t}</span>
            ))}
          </div>

          {/* CTA row */}
          <div className="hero__actions animate-fadeInUp" style={{ animationDelay: '320ms' }}>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn--lg"
              onClick={() => window.plausible?.('Live Demo')}
            >
              🚀 Live Demo
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn--lg"
              onClick={() => window.plausible?.('GitHub Click', { props: { source: 'hero' } })}
            >
              <GithubIcon /> View on GitHub
            </a>
          </div>

          {/* GitHub badges */}
          <div className="hero__gh-badges animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub stars">
              <img src={GITHUB_STARS_BADGE} alt="GitHub stars" height="20" />
            </a>
            <a
              href={`${GITHUB_URL}/actions`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="CI status"
            >
              <img src={CI_BADGE} alt="CI" height="20" />
            </a>
          </div>
        </div>

        {/* Visual column — dashboard mock */}
        <div className="hero__visual animate-fadeInUp" style={{ animationDelay: '500ms' }} aria-hidden="true">
          <DashboardMock />
        </div>
      </div>

      {/* Stats strip */}
      <div className="container">
        <div className="hero__stats animate-fadeInUp" style={{ animationDelay: '600ms' }} role="list" aria-label="Project statistics">
          {STATS.map(s => (
            <div key={s.label} className="hero__stat" role="listitem">
              <strong className="hero__stat-value text-gradient">{s.value}</strong>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Inline SVG dashboard mockup ─────────────────────────── */
function DashboardMock() {
  return (
    <div className="mock-browser">
      <div className="mock-browser__bar">
        <span className="mock-dot red"   />
        <span className="mock-dot amber" />
        <span className="mock-dot green" />
        <span className="mock-url">fleet-manager-demo.skakun-ml.com</span>
      </div>
      <div className="mock-browser__body">
        {/* KPI row */}
        <div className="mock-kpi-row">
          {[['Total','5','#8892b0'],['Active','3','#4caf50'],['Idle','1','#ff9800'],['Maint.','1','#f44336']].map(([l,v,c])=>(
            <div key={l} className="mock-kpi">
              <span className="mock-kpi__value" style={{color:c}}>{v}</span>
              <span className="mock-kpi__label">{l}</span>
            </div>
          ))}
        </div>
        {/* Map placeholder */}
        <div className="mock-map">
          <div className="mock-map__bg" />
          {/* road lines */}
          <svg className="mock-map__roads" viewBox="0 0 300 200" fill="none" aria-hidden="true">
            <line x1="0" y1="100" x2="300" y2="100" stroke="#1e2547" strokeWidth="2"/>
            <line x1="150" y1="0"  x2="150" y2="200" stroke="#1e2547" strokeWidth="2"/>
            <line x1="0" y1="50"  x2="300" y2="150"  stroke="#1e2547" strokeWidth="1" strokeDasharray="4 4"/>
            <line x1="0" y1="150" x2="300" y2="50"   stroke="#1e2547" strokeWidth="1" strokeDasharray="4 4"/>
          </svg>
          {/* vehicle markers */}
          {[
            [80,  80,  '#4caf50'],
            [160, 60,  '#4caf50'],
            [220, 130, '#4caf50'],
            [110, 150, '#ff9800'],
            [260, 70,  '#f44336'],
          ].map(([x,y,c],i)=>(
            <div key={i} className="mock-marker" style={{left:`${x/300*100}%`, top:`${y/200*100}%`, background:c}} />
          ))}
          {/* WS badge */}
          <div className="mock-ws-badge">● WS Live</div>
        </div>
      </div>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57
               0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41
               -1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815
               2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925
               0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23
               .96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65
               .24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925
               .435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57
               A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
