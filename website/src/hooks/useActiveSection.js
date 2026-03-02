import { useState, useEffect } from 'react'

/**
 * useActiveSection — returns the id of the section currently most visible
 * in the viewport. Useful for highlighting the matching nav link.
 *
 * @param {string[]} sectionIds  Array of element IDs to observe (without '#').
 * @param {number}   rootMargin  Shrinks the intersection root (default: top −30% bottom −60%).
 * @returns {string}  The id of the currently active section, or '' if none.
 *
 * Usage:
 *   const active = useActiveSection(['features', 'how', 'stack', 'screenshots'])
 *   <a className={active === 'features' ? 'nav-link--active' : ''} href="#features">…</a>
 */
export default function useActiveSection(sectionIds, rootMargin = '-30% 0px -60% 0px') {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (!sectionIds || sectionIds.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sectionIds, rootMargin])

  return activeId
}
