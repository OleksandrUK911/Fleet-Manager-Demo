import './Footer.css'

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/OleksandrUK911/Fleet-Manager-Demo'
const YEAR = new Date().getFullYear()

const LINKS = [
  { label: 'Features',      href: '#features'      },
  { label: 'How It Works',  href: '#how'           },
  { label: 'Tech Stack',    href: '#stack'         },
  { label: 'Stats',         href: '#stats'         },
  { label: 'Architecture',  href: '#architecture'  },
  { label: 'Highlights',    href: '#highlights'    },
  { label: 'Screenshots',   href: '#screenshots'   },
  { label: 'GitHub',        href: GITHUB_URL, external: true },
]

const BADGES = [
  { label: 'FastAPI', href: 'https://fastapi.tiangolo.com/' },
  { label: 'React',   href: 'https://react.dev/' },
  { label: 'Leaflet', href: 'https://leafletjs.com/' },
  { label: 'MUI',     href: 'https://mui.com/' },
  { label: 'Vite',    href: 'https://vite.dev/' },
]

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <a href="#" className="footer__logo" aria-label="Fleet Manager Demo home">
            <span aria-hidden="true">🚛</span>
            <strong>FleetManager</strong> Demo
          </a>
          <p className="footer__tagline">
            Open-source real-time vehicle tracking built with FastAPI + React.
          </p>
          <div className="footer__tech-badges" aria-label="Technologies used">
            {BADGES.map(b => (
              <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
                 className="footer__tech-badge">{b.label}</a>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav className="footer__nav" aria-label="Footer navigation">
          <h4 className="footer__nav-heading">Navigation</h4>
          <ul>
            {LINKS.map(l => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="footer__nav-link"
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tech info */}
        <div className="footer__tech">
          <h4 className="footer__nav-heading">Built with</h4>
          <ul className="footer__tech-list">
            {[
              'Python 3.13 · FastAPI 0.133',
              'React 18 · Material UI 5',
              'Leaflet 1.9 · Recharts',
              'SQLite · Alembic',
              'Docker · GitHub Actions',
            ].map(t => (
              <li key={t} className="footer__tech-item">{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {YEAR} Fleet Manager Demo — MIT License</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer__gh-link">
            <GithubIcon /> View on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
