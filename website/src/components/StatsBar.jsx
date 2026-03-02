import useScrollReveal from '../hooks/useScrollReveal'
import './StatsBar.css'

const STATS = [
  { value: '62',      unit: '',     label: 'Tests passing',     sub: 'pytest + httpx · CI on every push' },
  { value: '12',      unit: '',     label: 'Features built',    sub: 'From live map to PDF export' },
  { value: '<100',    unit: 'ms',   label: 'API response',      sub: 'Median on SQLite dev setup' },
  { value: '4',       unit: '',     label: 'System layers',     sub: 'Generator · DB · FastAPI · React' },
  { value: 'WS',      unit: '',     label: 'Real-time push',    sub: 'Delta WebSocket protocol' },
  { value: 'MIT',     unit: '',     label: 'Open source',       sub: 'Clone, fork, adapt freely' },
]

export default function StatsBar() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="stats section-py" id="stats" aria-label="Project statistics">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">by the numbers</p>
          <h2 className="section-title">Project at a glance</h2>
        </div>
        <ul className="stats__grid" role="list">
          {STATS.map((s, i) => (
            <li
              key={s.label}
              className="stats__card"
              data-reveal
              data-reveal-delay={String(i * 80)}
            >
              <div className="stats__value" aria-label={`${s.value}${s.unit}`}>
                <span className="stats__num">{s.value}</span>
                {s.unit && <span className="stats__unit">{s.unit}</span>}
              </div>
              <strong className="stats__label">{s.label}</strong>
              <p className="stats__sub">{s.sub}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
