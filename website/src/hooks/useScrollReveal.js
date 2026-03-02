import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — attaches an IntersectionObserver to all `[data-reveal]`
 * descendants of the returned `ref`. When they enter the viewport they get the
 * `data-revealed` attribute which triggers the CSS animation.
 *
 * Usage:
 *   const ref = useScrollReveal()
 *   <section ref={ref}>
 *     <h2 data-reveal>...</h2>
 *     <p  data-reveal data-reveal-delay="150">...</p>
 *   </section>
 *
 * CSS (already in index.css via .reveal-* classes):
 *   [data-reveal] { opacity: 0; transform: translateY(20px); transition: ... }
 *   [data-reveal][data-revealed] { opacity: 1; transform: none; }
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = options

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll('[data-reveal]'))
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const delay = el.dataset.revealDelay ?? '0'
          setTimeout(() => {
            el.setAttribute('data-revealed', '')
          }, Number(delay))
          observer.unobserve(el)
        })
      },
      {
        threshold,
        rootMargin,
        ...options,
      },
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  // threshold and rootMargin are primitive values destructured from options,
  // so they are stable and safe as deps (options object reference is intentionally excluded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin])

  return ref
}
