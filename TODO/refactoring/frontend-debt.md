# Frontend Technical Debt

> Pending UI improvements, accessibility gaps, and component-level
> refactoring in `frontend/src/`.

---

## Planned

- ⬜ Full mobile responsiveness audit: adaptive layout when sidebar is open on narrow viewports
- ⬜ Replace `localStorage` token storage with `httpOnly` cookie (security upgrade path)
- ⬜ Add `PropTypes` or migrate to TypeScript for component contracts

---

## In Progress

_(nothing active)_

---

## Done

- ✅ Extracted `useFleetWebSocket.js` custom hook (separation of concerns)
- ✅ `AuthContext` — global auth state via React Context
- ✅ `SnackbarContext` — decoupled toast notifications
- ✅ Adaptive layout: sidebar as Drawer overlay on mobile (hamburger menu)
- ✅ Dark mode persisted in `localStorage` (`fleet_dark`)
- ✅ Skeleton loaders replace blocking `CircularProgress`
- ✅ Empty state + Error state components (no inline fallback JSX)
- ✅ Speed-alert highlight extracted into `VehicleList.js` display logic
