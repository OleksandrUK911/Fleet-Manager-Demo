import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Screenshots from './components/Screenshots'
import TechStack from './components/TechStack'
import StatsBar from './components/StatsBar'
import Architecture from './components/Architecture'
import Highlights from './components/Highlights'
import ContactCTA from './components/ContactCTA'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import ScrollToTop from './components/ScrollToTop'

/** Minimal hash/path-based 404: show NotFound for any path other than "/" or the Vite base */
function usePath() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  return path
}

export default function App() {
  const path = usePath()
  const base = import.meta.env.BASE_URL // '/' locally, '/Fleet-Manager-Demo/' on GitHub Pages

  // Allow root, empty, or the Vite base path (e.g. /Fleet-Manager-Demo/)
  const isRoot = path === '/' || path === '' || path === base || path === base.replace(/\/$/, '')
  if (!isRoot) {
    return <NotFound />
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <TechStack />
        <StatsBar />
        <Architecture />
        <Highlights />
        <Screenshots />
        <ContactCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
