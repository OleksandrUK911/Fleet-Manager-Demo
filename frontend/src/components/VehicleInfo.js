// components/VehicleInfo.js — Detail panel for the selected vehicle
//
// Shows vehicle metadata, GPS coords, history range selector
// and CSV route download button.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCoord(val) {
  return val !== null && val !== undefined ? Number(val).toFixed(5) : '—';
}
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString();
}

// ── CSV download ─────────────────────────────────────────────────────────────
function downloadCsv(vehicle, history) {
  const rows = [
    ['timestamp', 'latitude', 'longitude', 'speed_kmh'],
    ...history.map((p) => [
      p.timestamp || '',
      p.latitude  || '',
      p.longitude || '',
      p.speed     || 0,
    ]),
  ];
  const csv  = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `route_${vehicle.license_plate.replace(/\s/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VehicleInfo({
  vehicle, history, historyCount, historyHours, onHistoryHoursChange, onClearSelection, onClearRoute,
}) {
  const navigate = useNavigate();
  if (!vehicle) return null;

  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        p: 1.5,
        overflowY: 'auto',
        maxHeight: 300,
      }}
    >
      {/* Back + Download + Details row */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={onClearSelection}
          sx={{ textTransform: 'none', fontSize: 12, flex: 1 }}
        >
          Back to fleet
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<OpenInNewIcon fontSize="small" />}
          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
          sx={{ textTransform: 'none', fontSize: 11 }}
        >
          Details
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon fontSize="small" />}
          disabled={!history || history.length === 0}
          onClick={() => downloadCsv(vehicle, history)}
          sx={{ textTransform: 'none', fontSize: 11 }}
        >
          CSV
        </Button>
        {onClearRoute && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<ClearIcon fontSize="small" />}
            disabled={!history || history.length === 0}
            onClick={onClearRoute}
            sx={{ textTransform: 'none', fontSize: 11 }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <InfoOutlinedIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>
          Vehicle Details
        </Typography>
      </Box>

      {/* Details table */}
      <Table size="small" sx={{ '& td': { border: 'none', py: 0.3, px: 0.5 } }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: 12, width: 90 }}>Name</TableCell>
            <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{vehicle.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>Plate</TableCell>
            <TableCell sx={{ fontSize: 12 }}>{vehicle.license_plate}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>Model</TableCell>
            <TableCell sx={{ fontSize: 12 }}>{vehicle.model || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>Status</TableCell>
            <TableCell>
              <Chip
                label={vehicle.status || 'active'}
                size="small"
                color={vehicle.status === 'active' ? 'success' : 'default'}
                sx={{ height: 18, fontSize: 11 }}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Divider sx={{ my: 1 }} />

      {/* GPS coordinates */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <TimelineIcon fontSize="small" color="secondary" />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Current Position
        </Typography>
      </Box>
      <Typography variant="caption" display="block" color="text.secondary">
        Lat: <strong>{formatCoord(vehicle.current_lat)}</strong> &nbsp;
        Lng: <strong>{formatCoord(vehicle.current_lng)}</strong>
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary">
        Last seen: {formatDate(vehicle.last_seen)}
      </Typography>

      <Divider sx={{ my: 1 }} />

      {/* History time range */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          History range:
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={historyHours}
          onChange={(_, val) => val && onHistoryHoursChange(val)}
          sx={{ '& .MuiToggleButton-root': { py: 0.2, px: 1, fontSize: 11 } }}
        >
          <ToggleButton value={1}>1h</ToggleButton>
          <ToggleButton value={6}>6h</ToggleButton>
          <ToggleButton value={24}>24h</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography variant="caption" display="block" color="text.secondary">
        History points loaded: <strong>{historyCount}</strong> (last {historyHours}h)
      </Typography>
    </Box>
  );
}
