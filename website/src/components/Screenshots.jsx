import { useState } from 'react'
import useScrollReveal from '../hooks/useScrollReveal'
import './Screenshots.css'

const SCREENS = [
  {
    id: 'dashboard',
    url: 'fleet-manager-demo.skakun-ml.com/app/',
    title: 'Live Dashboard',
    desc: 'Interactive Leaflet map with pulsing markers, KPI bar and sidebar vehicle list. WebSocket badge shows live connection status.',
    color: '#1976d2',
  },
  {
    id: 'dark',
    url: 'fleet-manager-demo.skakun-ml.com/app/',
    title: 'Dark Mode',
    desc: 'Full dark-theme support via MUI theme toggle. Every component adapts — map tiles switch to CartoDB Dark automatically.',
    color: '#37474f',
  },
  {
    id: 'vehicle',
    url: 'fleet-manager-demo.skakun-ml.com/app/vehicle/LDN-001',
    title: 'Vehicle Detail',
    desc: 'Per-vehicle page with speed AreaChart (last 24 h), current stats, operator notes and one-click route replay.',
    color: '#00897b',
  },
  {
    id: 'admin',
    url: 'fleet-manager-demo.skakun-ml.com/app/admin',
    title: 'Admin Panel',
    desc: 'Sortable, searchable CRUD table with inline edit, bulk-select toolbar and add/delete vehicle dialogs.',
    color: '#7b1fa2',
  },
  {
    id: 'reports',
    url: 'fleet-manager-demo.skakun-ml.com/app/reports',
    title: 'Reports Page',
    desc: 'Date-range picker + vehicle selector → speed AreaChart + position table + CSV and PDF export — all in one view.',
    color: '#c62828',
  },
]

export default function Screenshots() {
  const [active, setActive] = useState(0)
  const ref = useScrollReveal()

  return (
    <section ref={ref} className="shots section-py" id="screenshots" aria-labelledby="shots-heading">
      <div className="container">
        <div className="section-header" data-reveal>
          <p className="section-label">See it in action</p>
          <h2 className="section-title" id="shots-heading">App screenshots</h2>
          <p className="section-desc">
            Five key screens — each showing a different layer of the platform.
            Click a tab to explore.
          </p>
        </div>

        {/* Tab selector */}
        <div className="shots__tabs" data-reveal data-reveal-delay="100" role="tablist" aria-label="Screenshot tabs">
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={active === i}
              aria-controls={`shots-panel-${s.id}`}
              className={`shots__tab ${active === i ? 'shots__tab--active' : ''}`}
              onClick={() => setActive(i)}
              style={active === i ? { borderColor: s.color, color: s.color } : {}}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Panel */}
        {SCREENS.map((s, i) => (
          <div
            key={s.id}
            id={`shots-panel-${s.id}`}
            role="tabpanel"
            aria-labelledby={s.id}
            hidden={active !== i}
            className="shots__panel"
          >
            {/* Mock screen */}
            <div className="shots__mock" style={{ '--accent': s.color }}>
              <div className="shots__mock-bar">
                <span className="mock-dot red" /><span className="mock-dot amber" /><span className="mock-dot green" />
                <span className="shots__mock-url">{s.url}</span>
              </div>
              <div className="shots__mock-body" aria-label={`${s.title} interface preview`}>
                <ScreenContent id={s.id} color={s.color} />
              </div>
            </div>
            {/* Description */}
            <div className="shots__desc">
              <h3 className="shots__desc-title" style={{ color: s.color }}>{s.title}</h3>
              <p className="shots__desc-text">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* Rich screen mock contents */
const STATUS_COLORS = { active: '#4caf50', idle: '#ff9800', maintenance: '#f44336' }

const VEHICLES = [
  { name: 'LDN-001 · Scania', status: 'active',      speed: '67 km/h' },
  { name: 'LDN-002 · Volvo',  status: 'active',      speed: '43 km/h' },
  { name: 'LDN-003 · MAN',    status: 'idle',        speed: '0 km/h'  },
  { name: 'LDN-004 · DAF',    status: 'maintenance', speed: '—'       },
]

// SVG polyline path for the map mock
const ROUTE_POINTS = [[62,148],[88,132],[115,110],[132,134],[158,122],[178,140],[200,118],[225,108]]

function SvgMap({ color, dark = false }) {
  const pts = ROUTE_POINTS.map(([x,y]) => `${x},${y}`).join(' ')
  const bg = dark ? '#0d1117' : '#0d1117'
  return (
    <svg viewBox="0 0 300 200" className="sc-map-svg" aria-hidden="true" style={{ background: bg, borderRadius: 6 }}>
      {/* Grid lines */}
      {[50,100,150,200,250].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={200} stroke="#ffffff08" strokeWidth="1"/>)}
      {[40,80,120,160].map(y  => <line key={`h${y}`} x1={0} y1={y} x2={300} y2={y} stroke="#ffffff08" strokeWidth="1"/>)}
      {/* Geofence circle */}
      <circle cx="155" cy="95" r="38" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.5"/>
      {/* Route polyline */}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      {/* Vehicle markers */}
      {ROUTE_POINTS.filter((_,i)=>[1,4,7].includes(i)).map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="7" fill={i===2 ? '#ff9800' : color} opacity="0.3"/>
          <circle cx={x} cy={y} r="4" fill={i===2 ? '#ff9800' : color}/>
        </g>
      ))}
      {/* WS badge */}
      <rect x="232" y="183" width="60" height="14" rx="7" fill="rgba(76,175,80,.2)" stroke="rgba(76,175,80,.4)" strokeWidth="1"/>
      <text x="262" y="193" textAnchor="middle" fontSize="8" fill="#4caf50" fontFamily="monospace">● WS Live</text>
    </svg>
  )
}

function ScreenContent({ id, color }) {
  /* ── Dashboard ─────────────────────────────────────── */
  if (id === 'dashboard') return (
    <div className="sc sc--dashboard">
      <div className="sc-kpi-row">
        {[['5','Total'],['3','Active'],['1','Idle'],['1','Maint.']].map(([v,l],i)=>(
          <div key={l} className="sc-kpi">
            <b style={{ color: i===0?'var(--clr-text)':i===1?'#4caf50':i===2?'#ff9800':'#f44336' }}>{v}</b>
            <small>{l}</small>
          </div>
        ))}
      </div>
      <div className="sc-main-row">
        <ul className="sc-vehicle-list">
          {VEHICLES.map(v=>(
            <li key={v.name} className="sc-vehicle-row">
              <span className="sc-v-dot" style={{ background: STATUS_COLORS[v.status] }}/>
              <span className="sc-v-name">{v.name}</span>
              <span className="sc-v-speed">{v.speed}</span>
            </li>
          ))}
        </ul>
        <div className="sc-map-wrap">
          <SvgMap color={color}/>
        </div>
      </div>
    </div>
  )

  /* ── Dark mode ──────────────────────────────────────── */
  if (id === 'dark') return (
    <div className="sc sc--dark">
      {/* AppBar */}
      <div className="sc-dark-bar">
        <span className="sc-dark-logo">🚛 FleetManager</span>
        <div className="sc-dark-actions">
          <span className="sc-dark-toggle">☀️</span>
          <span className="sc-dark-avatar" />
        </div>
      </div>
      <div className="sc-dark-kpi-row">
        {[['5','Total','#90caf9'],['3','Active','#a5d6a7'],['1','Idle','#ffcc80'],['1','Maint.','#ef9a9a']].map(([v,l,c])=>(
          <div key={l} className="sc-dark-kpi">
            <b style={{ color: c }}>{v}</b>
            <small>{l}</small>
          </div>
        ))}
      </div>
      <div style={{ padding: '4px 8px' }}>
        <SvgMap color={color} dark />
      </div>
    </div>
  )

  /* ── Vehicle detail ─────────────────────────────────── */
  if (id === 'vehicle') return (
    <div className="sc sc--vehicle" style={{ '--c': color }}>
      <div className="sc-v-header" style={{ borderLeftColor: color }}>
        <div>
          <strong className="sc-v-title">LDN-001 · Scania Truck</strong>
          <span className="sc-v-badge" style={{ background: '#4caf5020', color: '#4caf50', border: '1px solid #4caf5040' }}>Active</span>
        </div>
        <span className="sc-v-loc">📍 Stratford, London</span>
      </div>
      <div className="sc-v-stats">
        {[['67 km/h','Speed'],['NE 42°','Heading'],['2 min ago','Updated'],['142 km','Today']].map(([v,l])=>(
          <div key={l} className="sc-v-stat">
            <b style={{ color }}>{v}</b><small>{l}</small>
          </div>
        ))}
      </div>
      {/* Area chart mock */}
      <svg viewBox="0 0 260 60" className="sc-chart" aria-hidden="true">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon
          points="0,60 0,45 18,38 35,28 52,15 70,22 88,12 106,20 124,10 142,18 160,8 180,16 198,6 216,14 234,20 260,30 260,60"
          fill="url(#chartGrad)"
        />
        <polyline
          points="0,45 18,38 35,28 52,15 70,22 88,12 106,20 124,10 142,18 160,8 180,16 198,6 216,14 234,20 260,30"
          fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <text x="0" y="58" fontSize="7" fill="#ffffff40" fontFamily="monospace">00:00</text>
        <text x="212" y="58" fontSize="7" fill="#ffffff40" fontFamily="monospace">23:59</text>
        <text x="240" y="28" fontSize="7" fill="#ffffff80">km/h</text>
      </svg>
      <div className="sc-v-notes">
        <small style={{ color: '#ffffff60' }}>📝 Operator notes: </small>
        <small style={{ color: '#ffffff90' }}>Oil change due 2026-03-10</small>
      </div>
    </div>
  )

  /* ── Admin panel ────────────────────────────────────── */
  if (id === 'admin') return (
    <div className="sc sc--admin" style={{ '--c': color }}>
      <div className="sc-admin-toolbar">
        <span className="sc-admin-label">Fleet Vehicles <b style={{ color }}>5</b></span>
        <span className="sc-admin-btn" style={{ borderColor: color, color }}>+ Add Vehicle</span>
      </div>
      <div className="sc-admin-thead">
        {['','Plate / Model','Status','Speed','Actions'].map(h=>(
          <span key={h} className="sc-admin-th">{h}</span>
        ))}
      </div>
      {[
        ['LDN-001','Scania','active','67 km/h'],
        ['LDN-002','Volvo FH','active','43 km/h'],
        ['LDN-003','MAN TGX','idle','0 km/h'],
        ['LDN-004','DAF XF','maintenance','—'],
      ].map(([plate,model,status,speed])=>(
        <div key={plate} className="sc-admin-row">
          <span className="sc-admin-check"/>
          <span className="sc-admin-cell"><b>{plate}</b><small>{model}</small></span>
          <span className="sc-admin-status" style={{ color: STATUS_COLORS[status] }}>{status}</span>
          <span className="sc-admin-speed">{speed}</span>
          <span className="sc-admin-actions">✏️ 🗑️</span>
        </div>
      ))}
    </div>
  )

  /* ── Reports ────────────────────────────────────────── */
  if (id === 'reports') return (
    <div className="sc sc--reports" style={{ '--c': color }}>
      <div className="sc-rpt-filters">
        <span className="sc-rpt-select" style={{ borderColor: color }}>LDN-001 ▾</span>
        <span className="sc-rpt-date">2026-02-01 → 2026-02-27</span>
        <span className="sc-rpt-btn" style={{ background: '#1976d2' }}>CSV</span>
        <span className="sc-rpt-btn" style={{ background: '#c62828' }}>PDF</span>
      </div>
      {/* Area chart */}
      <svg viewBox="0 0 260 55" className="sc-chart" aria-hidden="true">
        <defs>
          <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon
          points="0,55 0,40 20,32 40,18 60,25 80,10 100,16 120,8 140,20 160,12 180,22 200,5 220,18 240,28 260,35 260,55"
          fill="url(#rptGrad)"
        />
        <polyline
          points="0,40 20,32 40,18 60,25 80,10 100,16 120,8 140,20 160,12 180,22 200,5 220,18 240,28 260,35"
          fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {/* Positions table */}
      <div className="sc-rpt-thead">
        {['Time','Speed','Lat','Lng'].map(h=><span key={h} className="sc-rpt-th">{h}</span>)}
      </div>
      {[
        ['14:32:10','67 km/h','51.506','-0.128'],
        ['14:31:00','59 km/h','51.504','-0.125'],
        ['14:29:50','72 km/h','51.501','-0.120'],
      ].map(([t,s,la,lo])=>(
        <div key={t} className="sc-rpt-row">
          <span>{t}</span><span style={{ color }}>{s}</span><span>{la}</span><span>{lo}</span>
        </div>
      ))}
    </div>
  )

  return null
}
