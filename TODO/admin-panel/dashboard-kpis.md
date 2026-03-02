# Dashboard & KPIs

> Main application dashboard (/): real-time map, KPI cards, activity widgets,
> fleet status indicators, and UX controls.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### KPI Cards
- ✅ 4 MUI Card components at top-of-page: Total / Active / Inactive / Maintenance (`KpiBar.js`)
- ✅ Fleet distance card: total km today (Haversine formula, GET `/api/vehicles/stats/distance`)
- ✅ Overspeed alert card: vehicles exceeding speed threshold (`GET /api/vehicles/stats/overspeed`)
- ✅ `fetchFleetDistance()` frontend API function in `frontend/src/api/vehicles.js`
- ✅ `fetchOverspeedVehicles(threshold)` frontend API function in `frontend/src/api/vehicles.js`

### Map Controls
- ✅ Full-screen map mode (expand button)
- ✅ Collapsible sidebar (hide/show toggle)
- ✅ "Center on entire fleet" button — fit bounds of all markers
- ✅ "Back to fleet" button — deselect current vehicle, reset sidebar to full list
- ✅ Right-click context menu on marker: Center, Open Details, Clear Path
- ✅ Tile layer switcher: OpenStreetMap / CartoDB Dark / CartoDB Light
- ✅ Min/max zoom constraints on map markers

### Widgets & Feed
- ✅ Fleet activity chart (Recharts AreaChart) — position count over last 24 hours (`FleetActivityChart.js`)
- ✅ Top-5 most active vehicles table (most GPS records today) (`TopActiveTable.js`)
- ✅ Recent updates mini-table — 5 vehicles with latest position (`RecentUpdates.js`)
- ✅ Alert indicator — vehicle not updated for > 30 minutes (orange indicator)
- ✅ Live update counter: "Updated X seconds ago"

### Status Indicators
- ✅ API connection indicator — green/red dot in AppBar
- ✅ WebSocket connection status in AppBar
- ✅ Speed indicator below marker on map

### UI Polish
- ✅ Dark Mode toggle in AppBar; preference saved to localStorage (`fleet_dark`)
- ✅ Skeleton loaders instead of CircularProgress during data load
- ✅ Marker pulse animation on position update (`fm-update-ring` CSS)
- ✅ Speed alert: 🚨 icon + highlight in VehicleList if vehicle exceeds speed limit
- ✅ Status legend on map (permanently visible, bottom-left)
- ✅ Empty state: icon + message when no vehicles in list
- ✅ Error state: styled banner when API unreachable (Retry button, WifiOff icon)
- ✅ Warning banner when running in HTTP polling fallback mode
- ✅ Toast / Snackbar notifications on successful update or error
