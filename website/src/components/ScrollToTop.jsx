import { useState, useEffect, useCallback } from 'react'
import './ScrollToTop.css'

const SCROLL_THRESHOLD = 400   // px scrolled before button appears

/**
 * ScrollToTop — floating "back to top" button.
 * Appears after the user scrolls past SCROLL_THRESHOLD px.
 * Uses smooth scroll unless the user prefers reduced motion.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollUp = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' })
  }, [])

  return (
    <button
      className={`scroll-top ${visible ? 'scroll-top--visible' : ''}`}
      onClick={scrollUp}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
