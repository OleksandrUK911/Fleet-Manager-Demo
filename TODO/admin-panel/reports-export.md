# Reports & Export

> Reports page (/reports): vehicle selection, date-range filtering,
> statistics, CSV and PDF export.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Reports Page
- ✅ `/reports` page — select vehicle + date range → route table
- ✅ Summary statistics: total distance per vehicle per day/week
- ✅ Fleet activity chart by hour (bar chart, Recharts)

### Export
- ✅ "Download CSV" button for selected vehicle route
- ✅ "Export PDF" button — jsPDF + jspdf-autotable (frontend-side): vehicle info, route, KPIs, position table

> **Backend stats endpoints** (`/stats`, `/stats/top-active`, `/stats/distance`, `/stats/overspeed`, `/heatmap`) →
> see `api-backend/vehicles-api.md`
