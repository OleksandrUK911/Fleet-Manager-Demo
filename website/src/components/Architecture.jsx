import useScrollReveal from '../hooks/useScrollReveal'
import './Architecture.css'

/* ── constants ── */
const BW = 140, BH = 88, BY = 56  // box width, height, top-y
const GX = 20, DX = 228, AX = 456, WX = 700  // box left-x positions
const CY = BY + BH / 2  // vertical center = 100

/* helper: box right-edge x */
const rx = x => x + BW

/* arrow label mid-x */
const mx = (x1, x2) => (x1 + x2) / 2

export default function Architecture() {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className="arch section-py" id="architecture" aria-labelledby="arch-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">System design</p>
          <h2 className="section-title" id="arch-heading">Architecture</h2>
          <p className="section-desc">
            Every layer is independently deployable. The generator only writes to SQLite;
            FastAPI only reads and pushes; React only displays.
          </p>
        </div>

        {/* ── SVG Diagram ── */}
        <div className="arch__svg-wrap" data-reveal="scale" data-reveal-delay="100">
          <svg
            viewBox="0 0 880 200"
            className="arch__svg"
            role="img"
            aria-label="Architecture diagram: Generator inserts into SQLite, FastAPI selects from SQLite, FastAPI pushes WebSocket delta and REST responses to React Browser"
          >
            <defs>
              {/* Arrowhead markers */}
              {[
                ['arr-orange', '#ff9800'],
                ['arr-amber',  '#f57f17'],
                ['arr-blue',   '#00b0ff'],
                ['arr-green',  '#4caf50'],
              ].map(([id, fill]) => (
                <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={fill} />
                </marker>
              ))}

              {/* Glow filters */}
              <filter id="glow-orange" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-blue" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ── Arrow: Generator → SQLite (INSERT) ── */}
            <line
              x1={rx(GX)} y1={CY} x2={DX - 2} y2={CY}
              stroke="#ff9800" strokeWidth="2" markerEnd="url(#arr-orange)"
              className="arch-arrow"
            />
            <text x={mx(rx(GX), DX)} y={CY - 8} className="arch-arr-label arch-arr-label--top" fill="#ff9800">
              INSERT positions
            </text>

            {/* ── Arrow: SQLite → FastAPI (SELECT) ── */}
            <line
              x1={rx(DX)} y1={CY} x2={AX - 2} y2={CY}
              stroke="#f5a623" strokeWidth="2" markerEnd="url(#arr-amber)"
              className="arch-arrow"
            />
            <text x={mx(rx(DX), AX)} y={CY + 18} className="arch-arr-label arch-arr-label--bot" fill="#f5a623">
              SELECT queries
            </text>

            {/* ── Arrow: FastAPI → Browser WebSocket (dashed blue) ── */}
            <line
              x1={rx(AX)} y1={CY - 14} x2={WX - 2} y2={CY - 14}
              stroke="#00b0ff" strokeWidth="2" strokeDasharray="7 4"
              markerEnd="url(#arr-blue)" className="arch-arrow arch-arrow--ws"
            />
            <text x={mx(rx(AX), WX)} y={CY - 22} className="arch-arr-label arch-arr-label--top" fill="#00b0ff">
              WebSocket delta
            </text>

            {/* ── Arrow: FastAPI → Browser REST (solid green) ── */}
            <line
              x1={rx(AX)} y1={CY + 14} x2={WX - 2} y2={CY + 14}
              stroke="#4caf50" strokeWidth="2" markerEnd="url(#arr-green)"
              className="arch-arrow"
            />
            <text x={mx(rx(AX), WX)} y={CY + 32} className="arch-arr-label arch-arr-label--bot" fill="#4caf50">
              REST /api/*
            </text>

            {/* ── Boxes ── */}
            <ArchNode x={GX} color="#ff9800" icon="⚙️" label="Generator"
              sub="Python · 10 s tick" />
            <ArchNode x={DX} color="#f57f17" icon="🗄️" label="SQLite / MySQL"
              sub="Vehicles · Positions" />
            <ArchNode x={AX} color="#1976d2" icon="⚡" label="FastAPI"
              sub="JWT · WS · Rate limit" />
            <ArchNode x={WX} color="#4caf50" icon="🌐" label="React Browser"
              sub="Map · Charts · Admin" />
          </svg>
        </div>

        {/* ── Legend ── */}
        <ul className="arch__legend" data-reveal="" data-reveal-delay="200" aria-label="Architecture legend">
          {[
            { color: '#ff9800', label: 'Generator → INSERT positions every 10 s' },
            { color: '#f57f17', label: 'SQLite / MySQL → SELECT by FastAPI' },
            { color: '#00b0ff', label: 'WebSocket — delta frames (only changed vehicles)' },
            { color: '#4caf50', label: 'REST API — CRUD, reports, heatmap, geofence' },
          ].map(l => (
            <li key={l.label} className="arch__legend-item">
              <span className="arch__legend-dot" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ArchNode({ x, color, icon, label, sub }) {
  return (
    <g className="arch-node" role="img" aria-label={label}>
      {/* Glow rect behind */}
      <rect x={x + 4} y={BY + 4} width={BW} height={BH} rx="12"
            fill={color} opacity="0.12" />
      {/* Main rect */}
      <rect x={x} y={BY} width={BW} height={BH} rx="10"
            fill="var(--arch-box-bg)" stroke={color} strokeWidth="1.5" className="arch-node__rect" />
      {/* Icon */}
      <text x={x + BW / 2} y={BY + 26} textAnchor="middle" fontSize="18"
            className="arch-node__icon">{icon}</text>
      {/* Label */}
      <text x={x + BW / 2} y={BY + 48} textAnchor="middle" fontSize="11"
            fontWeight="700" fill="var(--arch-text)" className="arch-node__label">{label}</text>
      {/* Sub */}
      <text x={x + BW / 2} y={BY + 63} textAnchor="middle" fontSize="9"
            fill="var(--arch-sub)" className="arch-node__sub">{sub}</text>
    </g>
  )
}

