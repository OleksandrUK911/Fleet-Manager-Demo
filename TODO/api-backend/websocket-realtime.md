# WebSocket & Real-Time

> WebSocket endpoint for live GPS push, delta-update protocol,
> and HTTP polling fallback.
> Hook: `frontend/src/hooks/useFleetWebSocket.js`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

### Backend
- ✅ `GET /api/ws/positions` WebSocket endpoint — pushes position updates to all connected clients
- ✅ Typed message protocol: `full` (initial snapshot) → `delta` (only changed vehicles) → `heartbeat`
- ✅ Delta fingerprint: only vehicles with changed lat/lng/speed/status are sent
- ✅ Broadcast on generator tick — no redundant full snapshots

### Frontend
- ✅ `useFleetWebSocket.js` — manages WebSocket connection lifecycle
- ✅ `react-use-websocket` library integration
- ✅ WebSocket connection status indicator in AppBar (green dot)
- ✅ HTTP polling fallback: activates every 10 s when `wsOnline = false`
- ✅ Warning banner displayed when running in polling mode
- ✅ Smooth reconnect with exponential back-off
