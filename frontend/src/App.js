// App.js — Main application component
//
// Layout (Dashboard route "/"):
//   ┌──────────────────────────────────────────────────────┐
//   │  AppBar — title · updated Xs ago · 🌙 · Admin · ⟳   │
//   ├──────────────────────────────────────────────────────┤
//   │  KpiBar — Total / Active / Inactive / Maint.         │
//   ├──────────────────┬───────────────────────────────────┤
//   │  VehicleList     │  VehicleMap (London)              │
//   │  search + filter │  + fit-to-fleet button            │
//   │  VehicleInfo     │                                   │
//   └──────────────────┴───────────────────────────────────┘
//
// Admin route "/admin" → AdminPage (full CRUD table)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Drawer,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ReplayIcon from '@mui/icons-material/Replay';

import VehicleList from './components/VehicleList';
import VehicleMap from './components/VehicleMap';
import VehicleInfo from './components/VehicleInfo';
import KpiBar from './components/KpiBar';
import RecentUpdates from './components/RecentUpdates';
import TopActiveTable from './components/TopActiveTable';
import FleetActivityChart from './components/FleetActivityChart';
import AdminPage from './pages/AdminPage';
import VehiclePage from './pages/VehiclePage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { useFleetWebSocket } from './hooks/useFleetWebSocket';
import { fetchVehicles, fetchVehicleHistory, fetchFleetStats, fetchGeofences, fetchFleetDistance, fetchOverspeedVehicles } from './api/vehicles';

// HTTP stats refresh interval — vehicle positions come via WebSocket (5s).
// Stats still polled every 60 s as a lightweight fallback.
const STATS_REFRESH_MS = 60000;

// ── Root App — providers + routing ────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('fleet_dark') === 'true'
  );
  useEffect(() => {
    localStorage.setItem('fleet_dark', darkMode);
  }, [darkMode]);
  const theme = useMemo(
    () => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }),
    [darkMode]
  );

  return (
    <BrowserRouter basename="/app">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SnackbarProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/vehicles/:vehicleId" element={<VehiclePage />} />
            </Routes>
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// ── Route guard — redirect to /login if not authenticated ─────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

// ── Dashboard — main fleet view ────────────────────────────────────────────────
function Dashboard({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyHours, setHistoryHours] = useState(24);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [wsOnline, setWsOnline] = useState(false);
  const [httpOnline, setHttpOnline] = useState(true);
  const apiOnline = wsOnline || httpOnline;
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [zones, setZones] = useState([]);   // geofence zones from API
  const [distanceKm, setDistanceKm] = useState(undefined);
  const [overspeedCount, setOverspeedCount] = useState(undefined);

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // ── WebSocket: live vehicle position updates (every 5 s) ──────────────────
  const handleWsUpdate = useCallback((msg) => {
    // Backend sends typed messages:
    //   {type:"full",      vehicles:[...all...]}   — on connect or full refresh
    //   {type:"delta",     vehicles:[...changed...]} — only mutated vehicles
    //   {type:"heartbeat", ts:"..."}                — no change, keeps connection alive
    if (msg.type === 'full') {
      setVehicles(msg.vehicles);
    } else if (msg.type === 'delta') {
      setVehicles(prev => {
        const map = new Map(prev.map(v => [v.id, v]));
        for (const v of msg.vehicles) map.set(v.id, v);
        return Array.from(map.values());
      });
    }
    // heartbeat: nothing to update, just refresh the timestamp below
    setLastUpdated(new Date());
    setSecondsAgo(0);
    setLoading(false);
    setError(null);
  }, []);

  useFleetWebSocket({ onUpdate: handleWsUpdate, onStatusChange: setWsOnline });

  // ── HTTP: initial load + 60 s stats refresh ────────────────────────────────
  const loadVehicles = useCallback(async () => {
    try {
      const [data, statsData, distData, speedData] = await Promise.all([
        fetchVehicles(),
        fetchFleetStats(),
        fetchFleetDistance(),
        fetchOverspeedVehicles(80),
      ]);
      setVehicles(data);
      setStats(statsData);
      setDistanceKm(distData.total_km);
      setOverspeedCount(speedData.count);
      setLastUpdated(new Date());
      setSecondsAgo(0);
      setError(null);
      setHttpOnline(true);
    } catch (err) {
      setError('Cannot reach the backend. Is the server running on port 7767?');
      setHttpOnline(false);
      console.error('[App] loadVehicles error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fallback HTTP polling when WebSocket is unavailable ──────────────────
  // If WS stays offline, poll vehicles via HTTP every 10 s so the map
  // doesn't freeze. Cancelled automatically when WS reconnects.
  useEffect(() => {
    if (wsOnline) return;                           // WS is fine — no need
    const id = setInterval(() => {
      loadVehicles();                               // fetch + stats in one call
    }, 10_000);
    return () => clearInterval(id);
  }, [wsOnline, loadVehicles]);

  const loadStats = useCallback(async () => {
    try {
      const [statsData, distData, speedData] = await Promise.all([
        fetchFleetStats(),
        fetchFleetDistance(),
        fetchOverspeedVehicles(80),
      ]);
      setStats(statsData);
      setDistanceKm(distData.total_km);
      setOverspeedCount(speedData.count);
    } catch { /* silent */ }
  }, []);

  const loadGeofences = useCallback(async () => {
    try {
      const data = await fetchGeofences();
      setZones(data);
    } catch { /* silent — map falls back to DEMO_ZONES */ }
  }, []);

  // ── Load GPS history for selected vehicle ──────────────────────────────────
  const loadHistory = useCallback(async (vehicleId, hours) => {
    if (!vehicleId) { setHistory([]); return; }
    try {
      const data = await fetchVehicleHistory(vehicleId, hours || 24, 500);
      setHistory(data);
    } catch (err) {
      console.error('[App] fetchVehicleHistory error:', err);
      setHistory([]);
    }
  }, []);

  // ── Auto-refresh ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadVehicles(); // initial full load (vehicles + stats)
    loadGeofences(); // load geofence zones once on mount
    const statsInterval = setInterval(loadStats, STATS_REFRESH_MS);
    return () => clearInterval(statsInterval);
  }, [loadVehicles, loadStats, loadGeofences]);

  useEffect(() => {
    loadHistory(selectedId, historyHours);
  }, [selectedId, historyHours, loadHistory]);

  // ── "Updated X seconds ago" live counter ──────────────────────────────────
  useEffect(() => {
    if (!lastUpdated) return;
    const ticker = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastUpdated]);

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedId) || null;

  const handleSelectVehicle = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // ── Helper: "Updated Xs / Xm ago" label ───────────────────────────────────
  const updatedLabel = lastUpdated
    ? secondsAgo < 60
      ? `Updated ${secondsAgo}s ago`
      : `Updated ${Math.floor(secondsAgo / 60)}m ago`
    : '';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── AppBar ── */}
      <AppBar position="static" elevation={2}>
        <Toolbar variant="dense">
          {/* Hamburger menu — mobile only */}
          <IconButton
            color="inherit"
            size="small"
            onClick={() => setSidebarOpen((o) => !o)}
            sx={{ mr: 0.5, display: { xs: 'flex', sm: 'none' } }}
            aria-label="Open vehicle list"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <DirectionsBusIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Fleet Manager
          </Typography>

          {/* Connection indicator: green=WebSocket live, yellow=HTTP only, red=offline */}
          <Tooltip title={wsOnline ? 'Live (WebSocket)' : apiOnline ? 'HTTP polling' : 'API offline'}>
            <FiberManualRecordIcon
              sx={{ fontSize: 12, mr: 1.5, color: wsOnline ? '#69f0ae' : apiOnline ? '#ffca28' : '#ff5252' }}
            />
          </Tooltip>

          {updatedLabel && (
            <Typography variant="caption" sx={{ mr: 1.5, opacity: 0.75, display: { xs: 'none', sm: 'block' } }}>
              {updatedLabel}
            </Typography>
          )}

          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton color="inherit" size="small" onClick={() => setDarkMode((d) => !d)} sx={{ mr: 0.5 }}>
              {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Admin panel button */}
          <Tooltip title="Admin panel">
            <Button
              color="inherit"
              size="small"
              startIcon={<AdminPanelSettingsIcon fontSize="small" />}
              onClick={() => navigate('/admin')}
              sx={{ mr: 0.5, textTransform: 'none', fontSize: '0.8rem' }}
            >
              Admin
            </Button>
          </Tooltip>

          {/* Reports button */}
          <Tooltip title="Reports">
            <Button
              color="inherit"
              size="small"
              startIcon={<AssessmentIcon fontSize="small" />}
              onClick={() => navigate('/reports')}
              sx={{ mr: 0.5, textTransform: 'none', fontSize: '0.8rem' }}
            >
              Reports
            </Button>
          </Tooltip>

          <Tooltip title="Refresh now">
            <IconButton color="inherit" size="small" onClick={loadVehicles}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Auth: Login or user chip + logout */}
          {isAuthenticated ? (
            <>
              <Chip
                label={`${user?.displayName || user?.username} (${user?.role})`}
                size="small"
                sx={{
                  ml: 1,
                  color: 'primary.contrastText',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  fontSize: 11,
                  height: 22,
                  display: { xs: 'none', md: 'flex' },
                }}
              />
              <Tooltip title="Sign out">
                <IconButton color="inherit" size="small" onClick={logout} sx={{ ml: 0.5 }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Sign in to manage vehicles">
              <Button
                color="inherit"
                size="small"
                startIcon={<LoginIcon fontSize="small" />}
                onClick={() => navigate('/login')}
                sx={{ ml: 0.5, textTransform: 'none', fontSize: '0.8rem' }}
              >
                Sign In
              </Button>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* ── KPI bar ── */}
      <KpiBar stats={stats} loading={loading} distanceKm={distanceKm} overspeedCount={overspeedCount} />

      {/* ── Secondary info row: Recent Updates + Top Active + Fleet Activity ── */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0, borderRight: '1px solid', borderColor: 'divider' }}>
          <RecentUpdates vehicles={vehicles} loading={loading} onSelect={(v) => handleSelectVehicle(v.id)} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, borderRight: '1px solid', borderColor: 'divider' }}>
          <TopActiveTable />
        </Box>
        <Box sx={{ flex: 1.2, minWidth: 0 }}>
          <FleetActivityChart />
        </Box>
      </Box>

      {/* ── Connectivity / Error banner ── */}
      {!apiOnline ? (
        <Alert
          severity="error"
          icon={<WifiOffIcon fontSize="inherit" />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<ReplayIcon fontSize="inherit" />}
              onClick={loadVehicles}
              sx={{ fontWeight: 700, border: '1px solid rgba(255,255,255,0.5)', px: 1.5, py: 0.25, fontSize: '0.75rem' }}
            >
              Retry
            </Button>
          }
          sx={{ borderRadius: 0, py: 0.5, '& .MuiAlert-message': { display: 'flex', alignItems: 'center', gap: 0.5 } }}
        >
          <Box component="span" sx={{ fontWeight: 700 }}>API Offline</Box>
          &nbsp;— Backend unreachable on port 7767. Ensure the server is running.
        </Alert>
      ) : !wsOnline && httpOnline ? (
        <Alert
          severity="warning"
          onClose={() => {}}
          sx={{ borderRadius: 0, py: 0.25, '& .MuiAlert-action': { pt: 0 } }}
        >
          WebSocket unavailable — using HTTP polling every 10 s.
          &nbsp;<Box component="span" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>Reconnecting automatically.</Box>
        </Alert>
      ) : error ? (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0, py: 0.5 }}>
          {error}
        </Alert>
      ) : null}

      {/* ── Main content ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Mobile: Drawer overlay sidebar ── */}
        <Drawer
          anchor="left"
          open={isMobile && sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          PaperProps={{ sx: { width: '85vw', maxWidth: 340, display: 'flex', flexDirection: 'column' } }}
          ModalProps={{ keepMounted: true }}
        >
          {loading && vehicles.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <>
              <VehicleList
                vehicles={filteredVehicles}
                allCount={vehicles.length}
                selectedId={selectedId}
                onSelect={(id) => { handleSelectVehicle(id); setSidebarOpen(false); }}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                loading={loading}
              />
              {selectedVehicle && (
                <VehicleInfo
                  vehicle={selectedVehicle}
                  history={history}
                  historyCount={history.length}
                  historyHours={historyHours}
                  onHistoryHoursChange={setHistoryHours}
                  onClearSelection={() => setSelectedId(null)}
                  onClearRoute={() => setHistory([])}
                />
              )}
            </>
          )}
        </Drawer>

        {/* ── Desktop: sidebar Box ── */}
        <Box
          sx={{
            width: !isMobile && sidebarOpen ? 310 : 0,
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            borderRight: !isMobile && sidebarOpen ? '1px solid' : 'none',
            borderColor: 'divider',
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.25s ease',
          }}
        >
          {loading && vehicles.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <>
              <VehicleList
                vehicles={filteredVehicles}
                allCount={vehicles.length}
                selectedId={selectedId}
                onSelect={handleSelectVehicle}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                loading={loading}
              />
              {selectedVehicle && (
                <VehicleInfo
                  vehicle={selectedVehicle}
                  history={history}
                  historyCount={history.length}
                  historyHours={historyHours}
                  onHistoryHoursChange={setHistoryHours}
                  onClearSelection={() => setSelectedId(null)}
                  onClearRoute={() => setHistory([])}
                />
              )}
            </>
          )}
        </Box>

        {/* ── Map ── */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Sidebar toggle tab — desktop only */}
          <Box
            onClick={() => setSidebarOpen((o) => !o)}
            sx={{
              position: 'absolute', top: '50%', left: 0,
              transform: 'translateY(-50%)',
              zIndex: 1000,
              bgcolor: 'background.paper',
              borderRadius: '0 6px 6px 0',
              boxShadow: 2,
              cursor: 'pointer',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center', justifyContent: 'center',
              width: 20, height: 52,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {sidebarOpen
              ? <ChevronLeftIcon sx={{ fontSize: 16 }} />
              : <ChevronRightIcon sx={{ fontSize: 16 }} />}
          </Box>
          <VehicleMap
            vehicles={filteredVehicles}
            selectedVehicle={selectedVehicle}
            history={history}
            zones={zones}
            onSelectVehicle={handleSelectVehicle}
            onClearRoute={() => setHistory([])}
            onOpenDetails={(id) => navigate(`/vehicles/${id}`)}
          />
        </Box>
      </Box>
    </Box>
  );
}
