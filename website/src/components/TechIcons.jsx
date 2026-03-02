/**
 * TechIcons.jsx — Brand-aware SVG icons for the TechStack section.
 * Every icon uses a 24×24 viewBox and leverages the tech's official colour palette.
 * A `TechIcon` dispatcher component returns the correct icon by name, or falls back
 * to a coloured circle dot when no branded icon is defined.
 */

/* ── Backend ─────────────────────────────────────────────────────────── */

export function FastAPIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#009688" fillOpacity=".15"/>
      <path d="M13.1 3.5 7 13.5h5.3L10.9 20.5 17 10.5h-5.3L13.1 3.5Z" fill="#009688"/>
    </svg>
  )
}

export function SQLAlchemyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="12" cy="6.5" rx="7" ry="2.5" fill="#cc2222"/>
      <path d="M5 6.5v11c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-11" stroke="#cc2222" strokeWidth="1.5" fill="none"/>
      <path d="M5 12c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" stroke="#cc2222" strokeWidth="1.2" strokeDasharray="2 2" fill="none"/>
    </svg>
  )
}

export function PydanticIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 21 12 12 22 3 12 12 2Z" stroke="#e92063" strokeWidth="1.5" fill="#e92063" fillOpacity=".12"/>
      <path d="M8 12 10.5 14.5 16 10" stroke="#e92063" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function AlembicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#6d4c41" fillOpacity=".15"/>
      <path d="M8 8h5l-1.5 3H16M8 16h5l-1.5-3H16" stroke="#6d4c41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="8"  r="1.5" fill="#6d4c41"/>
      <circle cx="6" cy="16" r="1.5" fill="#6d4c41"/>
    </svg>
  )
}

export function PythonJoseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="11" r="4" stroke="#5c6bc0" strokeWidth="1.5"/>
      <path d="M13 13 20 20" stroke="#5c6bc0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17.5 18 16 16.5M19.5 16 18 14.5" stroke="#5c6bc0" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function SlowAPIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 4 6v6c0 4.5 3.5 8.5 8 10 4.5-1.5 8-5.5 8-10V6L12 2Z" stroke="#f57c00" strokeWidth="1.5" fill="#f57c00" fillOpacity=".12"/>
      <text x="12" y="15.5" textAnchor="middle" fill="#f57c00" fontSize="7" fontWeight="700" fontFamily="monospace">429</text>
    </svg>
  )
}

export function PytestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 3h6v8l4 9H5L9 11V3Z" stroke="#2e7d32" strokeWidth="1.5" fill="#2e7d32" fillOpacity=".1" strokeLinejoin="round"/>
      <path d="M9 3h6" stroke="#2e7d32" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10"  cy="15" r="1.1" fill="#2e7d32"/>
      <circle cx="13.5" cy="17" r="1.1" fill="#2e7d32"/>
    </svg>
  )
}

export function UvicornIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2c0 0-5 3-5 9.5l2 2h6l2-2C17 5 12 2 12 2Z" stroke="#1976d2" strokeWidth="1.4" fill="#1976d2" fillOpacity=".12"/>
      <path d="M9 13.5 7 19l5-2 5 2-2-5.5" stroke="#1976d2" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="2" fill="#1976d2" fillOpacity=".6"/>
    </svg>
  )
}

/* ── Frontend ─────────────────────────────────────────────────────────── */

export function ReactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#00bcd4" strokeWidth="1.3"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#00bcd4" strokeWidth="1.3" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#00bcd4" strokeWidth="1.3" transform="rotate(120 12 12)"/>
      <circle cx="12" cy="12" r="2" fill="#00bcd4"/>
    </svg>
  )
}

export function MUIIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 7 12 2l9 5-9 5-9-5Z" fill="#1976d2" fillOpacity=".2" stroke="#1976d2" strokeWidth="1.3"/>
      <path d="M3 7v7l9 5 9-5V7" fill="none" stroke="#1976d2" strokeWidth="1.3"/>
      <path d="M3 14 12 9l9 5" stroke="#1976d2" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  )
}

export function LeafletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 20C12 20 5 15 5 9.5 5 6.5 8 4 12 4c4 0 7 2.5 7 5.5C19 15 12 20 12 20Z" fill="#4caf50" fillOpacity=".18" stroke="#4caf50" strokeWidth="1.5"/>
      <line x1="12" y1="14" x2="12" y2="4" stroke="#4caf50" strokeWidth="1.2" strokeDasharray="2 2"/>
    </svg>
  )
}

export function RechartsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4"  y="14" width="4" height="6" rx="1" fill="#8e24aa" fillOpacity=".7"/>
      <rect x="10" y="9"  width="4" height="11" rx="1" fill="#8e24aa"/>
      <rect x="16" y="11" width="4" height="9" rx="1" fill="#8e24aa" fillOpacity=".6"/>
      <line x1="3" y1="21" x2="21" y2="21" stroke="#8e24aa" strokeWidth="1.2"/>
    </svg>
  )
}

export function ReactRouterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="5"  cy="12" r="2.5" fill="#f44336" fillOpacity=".25" stroke="#f44336" strokeWidth="1.3"/>
      <circle cx="19" cy="7"  r="2.5" fill="#f44336" fillOpacity=".25" stroke="#f44336" strokeWidth="1.3"/>
      <circle cx="19" cy="17" r="2.5" fill="#f44336" fillOpacity=".25" stroke="#f44336" strokeWidth="1.3"/>
      <path d="M7.5 11 16.5 8" stroke="#f44336" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7.5 13 16.5 16" stroke="#f44336" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function JsPDFIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6V3Z" stroke="#e91e63" strokeWidth="1.4" fill="#e91e63" fillOpacity=".1"/>
      <path d="M15 3v4h4" stroke="#e91e63" strokeWidth="1.2" fill="none"/>
      <text x="12" y="16" textAnchor="middle" fill="#e91e63" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">PDF</text>
    </svg>
  )
}

export function AxiosIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#5c6bc0" strokeWidth="1.3" fill="#5c6bc0" fillOpacity=".08"/>
      <path d="M9 8.5 12 5.5l3 3"     stroke="#5c6bc0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 15.5 12 18.5l-3-3" stroke="#5c6bc0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="5.5" x2="12" y2="18.5" stroke="#5c6bc0" strokeWidth="1.3"/>
    </svg>
  )
}

export function ViteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 3 12.5 13.5h4L10 21l1.8-7.5H8L16 3h5Z"
        fill="#ff6d00" fillOpacity=".18" stroke="#ff6d00" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Infra ────────────────────────────────────────────────────────────── */

export function DockerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="5"  y="8" width="3" height="3" rx=".5" fill="#0288d1" fillOpacity=".5" stroke="#0288d1" strokeWidth=".9"/>
      <rect x="9"  y="8" width="3" height="3" rx=".5" fill="#0288d1" fillOpacity=".7" stroke="#0288d1" strokeWidth=".9"/>
      <rect x="9"  y="4" width="3" height="3" rx=".5" fill="#0288d1" fillOpacity=".5" stroke="#0288d1" strokeWidth=".9"/>
      <rect x="13" y="8" width="3" height="3" rx=".5" fill="#0288d1" stroke="#0288d1" strokeWidth=".9"/>
      <path d="M4 15c0 2.8 2.2 5 6.5 5 6 0 9.5-3.8 10-6.5H4Z"
        fill="#0288d1" fillOpacity=".15" stroke="#0288d1" strokeWidth="1.2"/>
      <path d="M20.5 11c-1.2-1-2.8-1-2.8-1s0-2-2-2H6"
        stroke="#0288d1" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

export function NginxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#43a047" fillOpacity=".12" stroke="#43a047" strokeWidth="1.3"/>
      <path d="M7 7v10M17 7v10M7 7l10 10" stroke="#43a047" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function GitHubActionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" stroke="#6e7681" strokeWidth="1.3" fill="#6e7681" fillOpacity=".2"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="#6e7681" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function SQLiteMySQLIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="9"  cy="7"  rx="5" ry="2"   fill="#f57f17" fillOpacity=".7"/>
      <path d="M4 7v5c0 1.1 2.24 2 5 2s5-.9 5-2V7" stroke="#f57f17" strokeWidth="1.3" fill="none"/>
      <ellipse cx="15" cy="14" rx="5" ry="2"   fill="#f57f17" fillOpacity=".45"/>
      <path d="M10 14v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="#f57f17" strokeWidth="1.3" fill="none"/>
      <path d="M9 12 15 14" stroke="#f57f17" strokeWidth="1.2" strokeDasharray="2 1.5"/>
    </svg>
  )
}

/* ── Dispatcher ────────────────────────────────────────────────────────── */

const ICON_MAP = {
  'FastAPI':          FastAPIIcon,
  'SQLAlchemy 2':     SQLAlchemyIcon,
  'Pydantic v2':      PydanticIcon,
  'Alembic':          AlembicIcon,
  'python-jose':      PythonJoseIcon,
  'slowapi':          SlowAPIIcon,
  'pytest + httpx':   PytestIcon,
  'Uvicorn':          UvicornIcon,
  'React 18':         ReactIcon,
  'Material UI 5':    MUIIcon,
  'Leaflet':          LeafletIcon,
  'Recharts':         RechartsIcon,
  'react-router 7':   ReactRouterIcon,
  'jsPDF':            JsPDFIcon,
  'Axios':            AxiosIcon,
  'Vite':             ViteIcon,
  'Docker Compose':   DockerIcon,
  'Nginx':            NginxIcon,
  'GitHub Actions':   GitHubActionsIcon,
  'SQLite → MySQL':   SQLiteMySQLIcon,
}

/**
 * Renders the branded SVG icon for a given technology name.
 * Falls back to a small `●` circle in the brand colour if no icon is defined.
 */
export function TechIcon({ name, color }) {
  const IconComp = ICON_MAP[name]
  if (IconComp) return <IconComp />
  /* Fallback dot */
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill={color ?? '#888'}/>
    </svg>
  )
}
