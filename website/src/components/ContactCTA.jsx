import useScrollReveal from '../hooks/useScrollReveal'
import './ContactCTA.css'

const DEMO_URL    = import.meta.env.VITE_DEMO_URL    || 'https://fleet-manager-demo-production-47c1.up.railway.app/app'
const GITHUB_URL  = import.meta.env.VITE_GITHUB_URL  || 'https://github.com/OleksandrUK911/Fleet-Manager-Demo'
const SWAGGER_URL = import.meta.env.VITE_SWAGGER_URL || 'https://fleet-manager-demo-production-47c1.up.railway.app/api/docs'

export default function ContactCTA() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="cta section-py" id="contact" aria-labelledby="cta-heading">
      {/* Background glow */}
      <div className="cta__glow" aria-hidden="true" />

      <div className="container cta__inner">
        <p className="section-label" data-reveal style={{ textAlign: 'center' }}>Ready to explore?</p>
        <h2 className="cta__title" data-reveal data-reveal-delay="80" id="cta-heading">
          Try the demo{' '}
          <span className="text-gradient">right now</span>
        </h2>
        <p className="cta__sub" data-reveal data-reveal-delay="160">
          No signup. No credit card. Just open the live app and watch the fleet move.
        </p>

        <div className="cta__buttons" data-reveal data-reveal-delay="240">
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn--lg"
            onClick={() => window.plausible?.('Live Demo', { props: { source: 'cta' } })}
          >
            🚀 Open Live Demo
          </a>
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn--lg"
            onClick={() => window.plausible?.('API Docs')}
          >
            📖 API Docs (Swagger)
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn--lg"
            onClick={() => window.plausible?.('GitHub Click', { props: { source: 'cta' } })}
          >
            <GithubIcon /> View Source
          </a>
        </div>

        {/* Social links */}
        <div className="cta__social">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="cta__social-link" aria-label="GitHub repository"
            onClick={() => window.plausible?.('GitHub Click', { props: { source: 'social' } })}>
            <GithubIcon />
            <span>Star on GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/fleet-manager-demo" target="_blank" rel="noopener noreferrer" className="cta__social-link" aria-label="LinkedIn profile">
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/OleksandrUK911/Fleet-Manager-Demo" className="cta__social-link" aria-label="GitHub repository">
            <EmailIcon />
            <span>Get in touch</span>
          </a>
        </div>
      </div>
    </section>
  )
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}
