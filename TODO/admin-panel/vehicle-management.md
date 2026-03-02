# Vehicle Management

> Admin page (/admin/vehicles): CRUD operations on vehicles,
> bulk actions, search, sort, notes field.

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Vehicle CRUD Table
- ✅ `/admin/vehicles` page — table of all vehicles with edit capability
- ✅ Add new vehicle form (POST `/api/vehicles`)
- ✅ Edit vehicle form: name, plate, model, status
- ✅ Delete vehicle with confirmation (soft-delete via `is_active=false`)
- ✅ Operator notes field per vehicle (PATCH `/api/vehicles/{id}`)

### Table UX
- ✅ Filter/search in table by name, plate number, status
- ✅ Column sorting: by name, status, timestamp
- ✅ Bulk actions — select multiple vehicles for status change or delete

### Vehicle Detail Page (/vehicles/:id)
- ✅ Full vehicle details page (or expanded panel)
- ✅ Table of last 50 route points with time, coordinates, speed
- ✅ Speed-over-time chart (Recharts)
- ✅ "Edit Vehicle" button (admin only)

### Map Markers
- ✅ Custom DivIcon markers with colour coding: blue = selected, green = others
- ✅ Separate marker styles for inactive (grey) and maintenance (orange 🔧)
- ✅ Marker popup with vehicle details
- ✅ Miniature or emoji in popup for better UX
- ✅ Marker clustering for large fleets (react-leaflet-cluster, toggle button)

### Route & History
- ✅ Polyline from GPS points for selected vehicle (last 24 h)
- ✅ Time-range toggle: 1 h / 6 h / 24 h
- ✅ Speed tooltip on each route point
- ✅ "Clear route" button
- ✅ Speed-coloured Polyline (heatmap style: green → red)
- ✅ Route replay animation: play/pause/stop + speed control + scrub slider

### Heatmap Overlay (Frontend)
- ✅ Leaflet.heat plugin integration — 24 h traffic intensity layer
- ✅ Whatshot toggle button in floating map panel to show/hide heatmap

### Geofence Zones
- ✅ Colour-coded circles (Circle) for demo zones: warehouse, service, city centre
- ✅ Labels on geofence circles
