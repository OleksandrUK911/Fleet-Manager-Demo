// pages/ReportsPage.js — Vehicle Movement Reports
//
// Features:
//   - Vehicle selector (all fleet vehicles)
//   - Date-range picker (from / to datetime-local)
//   - Speed timeline AreaChart (Recharts)
//   - Position table with time, coordinates, speed, and cumulative distance
//   - Total distance KPI card (Haversine)
//   - CSV export button
//   - Quick presets: Last 1h / 6h / 24h

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import DownloadIcon         from '@mui/icons-material/Download';
import AssessmentIcon       from '@mui/icons-material/Assessment';
import DirectionsBusIcon    from '@mui/icons-material/DirectionsBus';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import jsPDF    from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchVehicles, fetchVehicleHistory } from '../api/vehicles';

// ─── Haversine distance (km) between two lat/lng points ───────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLon = toR(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Build the enriched position list with cumulative distance ────────────────
function enrichPositions(positions) {
  let cumDist = 0;
  return positions.map((p, i) => {
    if (i > 0) {
      const prev = positions[i - 1];
      cumDist += haversine(prev.latitude, prev.longitude, p.latitude, p.longitude);
    }
    return { ...p, cumDist };
  });
}

// ─── Format ISO timestamp as locale string ────────────────────────────────────
function fmt(iso) {
  return iso ? new Date(iso).toLocaleString() : '—';
}

// ─── ISO string for datetime-local input ──────────────────────────────────────
function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────
function SpeedTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 0.75, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700}>{label}</Typography>
      <Typography variant="caption" display="block" color="text.secondary">
        ⚡ {Number(payload[0].value).toFixed(1)} km/h
      </Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [vehicles,    setVehicles]    = useState([]);
  const [vehicleId,   setVehicleId]   = useState('');
  const [fromDt,      setFromDt]      = useState(() => toLocalInput(new Date(Date.now() - 24 * 3600 * 1000)));
  const [toDt,        setToDt]        = useState(() => toLocalInput(new Date()));
  const [positions,   setPositions]   = useState([]);
  const [enriched,    setEnriched]    = useState([]);
  const [loadingVeh,  setLoadingVeh]  = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error,       setError]       = useState(null);
  const [ran,         setRan]         = useState(false); // true after first load

  // ── Load vehicle list ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchVehicles();
        setVehicles(all);
        if (all.length > 0) setVehicleId(String(all[0].id));
      } catch {
        setError('Failed to load vehicles.');
      } finally {
        setLoadingVeh(false);
      }
    })();
  }, []);

  // ── Set quick preset ──────────────────────────────────────────────────────
  const setPreset = (hours) => {
    setFromDt(toLocalInput(new Date(Date.now() - hours * 3600 * 1000)));
    setToDt(toLocalInput(new Date()));
  };

  // ── Run report ────────────────────────────────────────────────────────────
  const runReport = useCallback(async () => {
    if (!vehicleId) return;
    setLoadingData(true);
    setError(null);
    setRan(true);
    try {
      const fromIso = new Date(fromDt).toISOString();
      const toIso   = new Date(toDt).toISOString();
      const data = await fetchVehicleHistory(vehicleId, 168, 2000, fromIso, toIso);
      setPositions(data);
      setEnriched(enrichPositions(data));
    } catch {
      setError('Failed to fetch history. Please try again.');
      setPositions([]);
      setEnriched([]);
    } finally {
      setLoadingData(false);
    }
  }, [vehicleId, fromDt, toDt]);

  // ── CSV download ──────────────────────────────────────────────────────────
  const downloadCsv = () => {
    if (!enriched.length) return;
    const veh = vehicles.find((v) => String(v.id) === vehicleId);
    const header = 'Timestamp,Latitude,Longitude,Speed_kmh,CumDist_km\n';
    const rows = enriched.map((p) =>
      `${p.timestamp},${p.latitude},${p.longitude},${(p.speed ?? 0).toFixed(2)},${p.cumDist.toFixed(3)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fleet_report_${veh?.license_plate ?? vehicleId}_${fromDt.replace('T', '_').replace(/:/g, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF download ──────────────────────────────────────────────────
  const downloadPdf = () => {
    if (!enriched.length) return;
    const veh = selectedVehicle;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // ─ Header bar ────────────────────────────────────────
    doc.setFillColor(21, 101, 192);
    doc.rect(0, 0, 297, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('Fleet Manager — Movement Report', 10, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 210, 12);

    // ─ Vehicle info ─────────────────────────────────────
    doc.setTextColor(33, 33, 33);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${veh?.name ?? ''} (${veh?.license_plate ?? ''}) — ${veh?.model ?? ''}`, 10, 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${fromDt.replace('T', ' ')} → ${toDt.replace('T', ' ')}`, 10, 32);

    // ─ KPI summary table ───────────────────────────────
    autoTable(doc, {
      startY: 36,
      head:   [['Total Distance', 'Positions', 'Max Speed', 'Avg Speed']],
      body:   [[`${totalDistance.toFixed(2)} km`, positions.length, `${maxSpeed.toFixed(1)} km/h`, `${avgSpeed.toFixed(1)} km/h`]],
      theme:  'grid',
      styles: { fontSize: 9, halign: 'center' },
      headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: 'bold' },
      margin: { left: 10, right: 10 },
      tableWidth: 120,
    });

    // ─ Position log table (max 500 rows) ─────────────────────
    const rows = enriched.slice(0, 500);
    const tableRows = rows.map((p, i) => {
      const delta = i === 0 ? '—' : `+${((p.cumDist - rows[i - 1].cumDist) * 1000).toFixed(0)} m`;
      return [
        i + 1,
        new Date(p.timestamp).toLocaleString(),
        Number(p.latitude).toFixed(5),
        Number(p.longitude).toFixed(5),
        `${(p.speed ?? 0).toFixed(1)} km/h`,
        delta,
        `${p.cumDist.toFixed(3)} km`,
      ];
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY ?? 48) + 6,
      head:   [['#', 'Timestamp', 'Latitude', 'Longitude', 'Speed', 'Δ Distance', 'Cumulative']],
      body:   tableRows,
      theme:  'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 37, 41], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { halign: 'right', cellWidth: 10 },
        1: { cellWidth: 42 },
        2: { halign: 'right', cellWidth: 24 },
        3: { halign: 'right', cellWidth: 24 },
        4: { halign: 'right', cellWidth: 22 },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'right', cellWidth: 26 },
      },
      margin: { left: 10, right: 10 },
    });
    if (enriched.length > 500) {
      const finalY = doc.lastAutoTable?.finalY ?? 200;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Note: table limited to first 500 of ${enriched.length} records. Use CSV export for full data.`, 10, finalY + 6);
    }

    // ─ Footer ───────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(160, 160, 160);
      doc.text(`Fleet Manager Demo — Page ${i} of ${pageCount}`, 10, 205);
    }

    const filename = `fleet_report_${veh?.license_plate ?? vehicleId}_${fromDt.replace('T', '_').replace(/:/g, '')}.pdf`;
    doc.save(filename);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalDistance = enriched.length > 0 ? enriched[enriched.length - 1].cumDist : 0;
  const maxSpeed      = enriched.length > 0 ? Math.max(...enriched.map((p) => p.speed ?? 0)) : 0;
  const avgSpeed      = enriched.length > 0
    ? enriched.reduce((s, p) => s + (p.speed ?? 0), 0) / enriched.length
    : 0;

  const selectedVehicle = vehicles.find((v) => String(v.id) === vehicleId) || null;

  // ── Chart data: thin to max 200 points for performance ───────────────────
  const chartData = (() => {
    if (!enriched.length) return [];
    const step = Math.max(1, Math.floor(enriched.length / 200));
    return enriched
      .filter((_, i) => i % step === 0)
      .map((p) => ({
        time:  new Date(p.timestamp).toLocaleTimeString(),
        speed: Number((p.speed ?? 0).toFixed(1)),
      }));
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1200, mx: 'auto' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Tooltip title="Back to Dashboard">
          <IconButton size="small" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <AssessmentIcon color="primary" />
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          Fleet Reports
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Filter controls ── */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>

          {/* Vehicle select */}
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Vehicle</InputLabel>
            <Select
              value={vehicleId}
              label="Vehicle"
              onChange={(e) => setVehicleId(e.target.value)}
              startAdornment={<DirectionsBusIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />}
            >
              {loadingVeh
                ? <MenuItem disabled><CircularProgress size={14} /></MenuItem>
                : vehicles.map((v) => (
                    <MenuItem key={v.id} value={String(v.id)}>
                      {v.name} — {v.license_plate}
                    </MenuItem>
                  ))
              }
            </Select>
          </FormControl>

          {/* From datetime */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="caption" color="text.secondary">From</Typography>
            <input
              type="datetime-local"
              value={fromDt}
              onChange={(e) => setFromDt(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #aaa',
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'transparent',
                color: 'inherit',
              }}
            />
          </Box>

          {/* To datetime */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="caption" color="text.secondary">To</Typography>
            <input
              type="datetime-local"
              value={toDt}
              onChange={(e) => setToDt(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #aaa',
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'transparent',
                color: 'inherit',
              }}
            />
          </Box>

          {/* Quick presets */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { label: 'Last 1h',  hours: 1  },
              { label: 'Last 6h',  hours: 6  },
              { label: 'Last 24h', hours: 24 },
              { label: 'Last 7d',  hours: 168 },
            ].map(({ label, hours }) => (
              <Chip
                key={label}
                label={label}
                size="small"
                variant="outlined"
                onClick={() => setPreset(hours)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={runReport}
            disabled={loadingData || !vehicleId}
            startIcon={loadingData ? <CircularProgress size={14} color="inherit" /> : <AssessmentIcon fontSize="small" />}
            sx={{ ml: 'auto' }}
          >
            {loadingData ? 'Loading…' : 'Run Report'}
          </Button>
        </Box>
      </Paper>

      {/* ── Results ── */}
      {ran && !loadingData && (
        <>
          {/* KPI cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Distance', value: `${totalDistance.toFixed(2)} km`, color: 'primary.main' },
              { label: 'Positions', value: positions.length, color: 'text.primary' },
              { label: 'Max Speed',  value: `${maxSpeed.toFixed(1)} km/h`,  color: 'error.main' },
              { label: 'Avg Speed',  value: `${avgSpeed.toFixed(1)} km/h`,  color: 'warning.main' },
            ].map(({ label, value, color }) => (
              <Paper
                key={label}
                elevation={2}
                sx={{ p: 1.5, borderRadius: 2, minWidth: 140, flex: '1 1 140px' }}
              >
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1.3 }}>
                  {value}
                </Typography>
              </Paper>
            ))}
          </Box>

          {positions.length === 0 ? (
            <Alert severity="info">No position data found for the selected range.</Alert>
          ) : (
            <>
              {/* Speed timeline chart */}
              <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
                    Speed Timeline — {selectedVehicle?.name}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon fontSize="small" />}
                    onClick={downloadCsv}
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DownloadIcon fontSize="small" />}
                    onClick={downloadPdf}
                    sx={{ ml: 1 }}
                  >
                    Export PDF
                  </Button>
                </Box>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1976d2" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      unit=" km/h"
                      width={60}
                    />
                    <RTooltip content={<SpeedTooltip />} />
                    <ReferenceLine y={60} stroke="#e53935" strokeDasharray="4 4" label={{ value: '60', fontSize: 10, fill: '#e53935' }} />
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
              </Paper>

              {/* Position table */}
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
                    Position Log ({positions.length} records)
                  </Typography>
                </Box>
                <Divider />
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['#', 'Timestamp', 'Latitude', 'Longitude', 'Speed', 'Δ Distance', 'Cumulative'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enriched.map((p, i) => {
                        const delta = i === 0 ? 0 : p.cumDist - enriched[i - 1].cumDist;
                        return (
                          <TableRow
                            key={p.id ?? i}
                            sx={{
                              bgcolor: i % 2 === 0 ? 'background.paper' : 'action.hover',
                              '&:hover': { bgcolor: 'action.selected' },
                            }}
                          >
                            <TableCell sx={{ color: 'text.secondary', fontSize: 11 }}>{i + 1}</TableCell>
                            <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(p.timestamp)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{Number(p.latitude).toFixed(5)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{Number(p.longitude).toFixed(5)}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${(p.speed ?? 0).toFixed(1)} km/h`}
                                size="small"
                                sx={{ fontSize: 10, height: 18 }}
                                color={((p.speed ?? 0) > 60) ? 'error' : ((p.speed ?? 0) > 30) ? 'warning' : 'default'}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                              {i === 0 ? '—' : `+${(delta * 1000).toFixed(0)} m`}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{p.cumDist.toFixed(3)} km</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </>
      )}

      {ran && loadingData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {!ran && (
        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
          <AssessmentIcon sx={{ fontSize: 64, mb: 1, color: 'text.secondary' }} />
          <Typography color="text.secondary">
            Select a vehicle and date range, then click <strong>Run Report</strong>.
          </Typography>
        </Box>
      )}

    </Box>
  );
}
