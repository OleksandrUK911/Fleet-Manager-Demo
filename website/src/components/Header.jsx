import { useState, useEffect } from 'react'
import './Header.css'
import useActiveSection from '../hooks/useActiveSection'

const NAV_LINKS = [
  { href: '#features',     label: 'Features' },
  { href: '#how',          label: 'How It Works' },
  { href: '#stack',        label: 'Tech Stack' },
  { href: '#stats',        label: 'Stats' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#highlights',   label: 'Highlights' },
  { href: '#screenshots',  label: 'Screenshots' },
]

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || 'https://github.com/OleksandrUK911/Fleet-Manager-Demo'
const DEMO_URL   = import.meta.env.VITE_DEMO_URL   || 'https://fleet-manager-demo-production.up.railway.app/app'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const activeId = useActiveSection(['features', 'how', 'stack', 'stats', 'architecture', 'highlights', 'screenshots'])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu when the user presses Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        {/* Logo */}
        <a href="#" className="header__logo" aria-label="Fleet Manager Demo home">
          <span className="header__logo-icon" aria-hidden="true">🚛</span>
          <span className="header__logo-text">Fleet<strong>Manager</strong></span>
        </a>

        {/* Desktop nav */}
        <nav className="header__nav" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const id = href.slice(1)
            return (
              <a
                key={href}
                href={href}
                className={`header__nav-link${activeId === id ? ' header__nav-link--active' : ''}`}
                aria-current={activeId === id ? 'true' : undefined}
              >
                {label}
              </a>
            )
          })}
        </nav>

        {/* CTA buttons */}
        <div className="header__actions">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn--sm">
            <GithubIcon /> GitHub
          </a>
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn--sm">
            Live Demo →
          </a>
        </div>

        {/* Hamburger */}
        <button
          className={`header__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-haspopup="true"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="header__mobile-menu" role="dialog"
             aria-label="Mobile navigation" aria-modal="false">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`header__mobile-link${activeId === href.slice(1) ? ' header__mobile-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
              aria-current={activeId === href.slice(1) ? 'true' : undefined}
            >{label}</a>
          ))}
          <a href={DEMO_URL} className="btn btn-primary" style={{ textAlign: 'center' }}
             onClick={() => setMenuOpen(false)}>Live Demo →</a>
        </div>
      )}
    </header>
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
