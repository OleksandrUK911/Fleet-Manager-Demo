import useScrollReveal from '../hooks/useScrollReveal'
import './HowItWorks.css'

const STEPS = [
  {
    num: '01',
    icon: '⚙️',
    title: 'Generator starts',
    desc: 'The Python generator seeds 5 sample vehicles and then simulates GPS movement every 10 seconds, writing positions to SQLite.',
    detail: 'GENERATOR_INTERVAL_SECS · GENERATOR_CITY',
  },
  {
    num: '02',
    icon: '🔌',
    title: 'FastAPI processes',
    desc: 'FastAPI persists positions, computes delta fingerprints and pushes only changed vehicles over the WebSocket channel.',
    detail: 'full → delta → heartbeat protocol',
  },
  {
    num: '03',
    icon: '🗺️',
    title: 'Map updates live',
    desc: 'React receives the delta frame, updates state and Leaflet re-renders just the moved markers — no full page refresh.',
    detail: 'Leaflet · react-leaflet · MUI',
  },
  {
    num: '04',
    icon: '📄',
    title: 'Report is ready',
    desc: 'Pick a vehicle and date range, hit Export — the backend streams a CSV, jsPDF renders a PDF, and Recharts draws the chart.',
    detail: 'CSV · PDF · speed AreaChart',
  },
]

export default function HowItWorks() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="how section-py" id="how" aria-labelledby="how-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">Under the hood</p>
          <h2 className="section-title" id="how-heading">How it works</h2>
          <p className="section-desc">
            From simulator to live map in four simple steps — each layer
            decoupled so you can swap any piece independently.
          </p>
        </div>

        <ol className="how__steps" aria-label="How it works steps">
          {STEPS.map((step, idx) => (
            <li key={step.num} className="how__step" data-reveal data-reveal-delay={String(idx * 120)}>
              {/* connector line (hidden on last) */}
              {idx < STEPS.length - 1 && <div className="how__connector" aria-hidden="true" />}

              <div className="how__step-num" aria-hidden="true">{step.num}</div>
              <div className="how__step-icon" aria-hidden="true">{step.icon}</div>
              <div className="how__step-body">
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-desc">{step.desc}</p>
                <code className="how__step-detail">{step.detail}</code>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
