// pages/VehiclePage.js — Full detail view for a single vehicle
//
// Route: /vehicles/:vehicleId
//
// Features:
//   - KPI cards: max speed · avg speed · total GPS points · current status
//   - Recharts AreaChart: speed over time (last 24 h)
//   - Table: 50 most recent positions (time, coords, speed)
//   - Back to dashboard · Edit in Admin buttons

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Skeleton,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

import { fetchVehicleDetail, fetchVehicleHistory } from '../api/vehicles';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}
function fmtCoord(v) {
  return v !== null && v !== undefined ? Number(v).toFixed(5) : '—';
}
function statusColor(s) {
  if (s === 'active') return 'success';
  if (s === 'maintenance') return 'warning';
  return 'default';
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, color = 'primary.main', loading }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ flex: 1, minWidth: 120, p: 1.5, borderRadius: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
        <Box sx={{ color, fontSize: 18, display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      {loading ? (
        <Skeleton width={60} height={28} />
      ) : (
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
      )}
    </Paper>
  );
}

// ── Custom Recharts tooltip ───────────────────────────────────────────────────
function SpeedTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ px: 1.5, py: 1, fontSize: 12 }}>
      <Typography variant="caption" display="block" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color="primary.main">
        {Number(payload[0].value).toFixed(1)} km/h
      </Typography>
    </Paper>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VehiclePage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [veh, hist] = await Promise.all([
        fetchVehicleDetail(vehicleId),
        fetchVehicleHistory(vehicleId, 24, 500),
      ]);
      setVehicle(veh);
      setHistory(hist);
      setError(null);
    } catch (err) {
      setError('Could not load vehicle data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => { load(); }, [load]);

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const speeds       = history.map((p) => p.speed ?? 0);
  const maxSpeed     = speeds.length ? Math.max(...speeds) : 0;
  const avgSpeed     = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  const totalPoints  = history.length;

  // Chart data — sample every N points to keep chart readable
  const CHART_MAX = 120;
  const step = Math.max(1, Math.floor(history.length / CHART_MAX));
  const chartData = history
    .filter((_, i) => i % step === 0)
    .map((p) => ({
      time:  fmtTime(p.timestamp),
      speed: Number((p.speed ?? 0).toFixed(1)),
    }));

  // Recent 50 rows for table
  const tableRows = [...history].reverse().slice(0, 50);
  const avgSpeedLine = avgSpeed.toFixed(1);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Tooltip title="Back to dashboard">
          <IconButton onClick={() => navigate('/')} size="small" sx={{ mr: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <DirectionsBusIcon color="primary" />
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          {loading ? <Skeleton width={220} /> : vehicle?.name ?? `Vehicle #${vehicleId}`}
        </Typography>
        {vehicle && (
          <Chip
            label={vehicle.license_plate}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          />
        )}
        {vehicle && (
          <Chip
            label={vehicle.status}
            color={statusColor(vehicle.status)}
            size="small"
          />
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<AdminPanelSettingsIcon fontSize="small" />}
          onClick={() => navigate('/admin')}
          sx={{ textTransform: 'none', ml: 1 }}
        >
          Edit in Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* ── KPI row ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <KpiCard
          icon={<SpeedIcon fontSize="inherit" />}
          label="Max speed"
          value={loading ? '…' : `${maxSpeed.toFixed(1)} km/h`}
          color="error.main"
          loading={loading}
        />
        <KpiCard
          icon={<SpeedIcon fontSize="inherit" />}
          label="Avg speed"
          value={loading ? '…' : `${avgSpeed.toFixed(1)} km/h`}
          color="warning.main"
          loading={loading}
        />
        <KpiCard
          icon={<MyLocationIcon fontSize="inherit" />}
          label="GPS points (24 h)"
          value={loading ? '…' : totalPoints}
          color="info.main"
          loading={loading}
        />
        <KpiCard
          icon={<TimelineIcon fontSize="inherit" />}
          label="Model"
          value={loading ? '…' : vehicle?.model ?? '—'}
          color="success.main"
          loading={loading}
        />
      </Box>

      {/* ── Speed chart ── */}
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
          <TimelineIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Speed over time — last 24 h
          </Typography>
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} />
        ) : history.length < 2 ? (
          <Box
            sx={{
              height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            <Typography variant="body2">No history data available.</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1976d2" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                interval={Math.floor(chartData.length / 6)}
                tickLine={false}
              />
              <YAxis
                unit=" km/h"
                tick={{ fontSize: 10 }}
                width={64}
                tickLine={false}
              />
              <ReTooltip content={<SpeedTooltip />} />
              <ReferenceLine
                y={Number(avgSpeedLine)}
                stroke="#ff8f00"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{ value: `avg ${avgSpeedLine}`, position: 'right', fontSize: 10, fill: '#ff8f00' }}
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke="#1976d2"
                strokeWidth={2}
                fill="url(#speedGrad)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* ── Position table ── */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ px: 2, pt: 1.5, pb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <MyLocationIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Recent positions (last 50 of {totalPoints})
          </Typography>
        </Box>
        <Divider />
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Longitude</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Speed (km/h)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : tableRows.map((point, idx) => (
                    <TableRow
                      key={point.id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? 'transparent' : 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <TableCell sx={{ fontSize: 11, color: 'text.disabled' }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {fmtDateTime(point.timestamp)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {fmtCoord(point.latitude)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {fmtCoord(point.longitude)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {point.speed != null ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: Math.min(40, (point.speed / maxSpeed) * 40),
                                height: 5,
                                borderRadius: 1,
                                bgcolor:
                                  point.speed > 50 ? 'error.main' :
                                  point.speed > 20 ? 'warning.main' : 'success.main',
                                mr: 0.5,
                              }}
                            />
                            {Number(point.speed).toFixed(1)}
                          </Box>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
