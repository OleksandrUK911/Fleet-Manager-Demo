// components/RecentUpdates.js — Mini-table: top 5 vehicles sorted by last GPS update
//
// Shows: emoji + name, plate, status chip, "X min ago" timestamp
// Auto-refreshes every 30 s (in sync with main vehicle list).
// Clicking a row calls the optional onSelect(vehicle) callback.

import React, { useMemo } from 'react';
import {
  Box,
  Chip,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Skeleton,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// ── Helpers ─────────────────────────────────────────────────────────────────

const VEHICLE_EMOJIS = { truck: '🚛', van: '🚐', car: '🚗', bus: '🚌' };

function vehicleEmoji(name = '') {
  const n = name.toLowerCase();
  if (n.includes('truck')) return VEHICLE_EMOJIS.truck;
  if (n.includes('van'))   return VEHICLE_EMOJIS.van;
  if (n.includes('bus'))   return VEHICLE_EMOJIS.bus;
  return VEHICLE_EMOJIS.car;
}

function timeAgo(isoString) {
  if (!isoString) return '—';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 5)    return 'just now';
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_CHIP = {
  active:      { label: 'Active',   color: 'success' },
  inactive:    { label: 'Inactive', color: 'default' },
  maintenance: { label: 'Service',  color: 'warning' },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function RecentUpdates({ vehicles = [], loading = false, onSelect }) {
  // Sort by last_seen desc, take top 5
  const rows = useMemo(() => {
    const sorted = [...vehicles].sort((a, b) => {
      const ta = a.last_seen ? new Date(a.last_seen).getTime() : 0;
      const tb = b.last_seen ? new Date(b.last_seen).getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 5);
  }, [vehicles]);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderColor: 'divider',
        px: { xs: 1.5, sm: 2 },
        py: 1,
        flexShrink: 0,
      }}
    >
      {/* ── Section header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.8 }}>
        <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Recent Updates
        </Typography>
      </Box>

      {/* ── Table ── */}
      <Table size="small" sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow sx={{ '& th': { py: 0.3, fontSize: 11, fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
            <TableCell sx={{ width: '32%' }}>Vehicle</TableCell>
            <TableCell sx={{ width: '22%' }}>Plate</TableCell>
            <TableCell sx={{ width: '24%' }}>Status</TableCell>
            <TableCell sx={{ width: '22%', textAlign: 'right' }}>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((v) => {
                const chip = STATUS_CHIP[v.status] ?? STATUS_CHIP.active;
                return (
                  <TableRow
                    key={v.id}
                    hover
                    onClick={() => onSelect && onSelect(v)}
                    sx={{ cursor: onSelect ? 'pointer' : 'default', '& td': { py: 0.4, fontSize: 12, borderBottom: 'none' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden' }}>
                        <span style={{ fontSize: 14 }}>{vehicleEmoji(v.name)}</span>
                        <Typography noWrap variant="body2" sx={{ fontSize: 12, fontWeight: 500 }}>
                          {v.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: 12, fontFamily: 'monospace' }}>
                        {v.license_plate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={chip.label}
                        color={chip.color}
                        size="small"
                        sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.8 } }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Tooltip title={v.last_seen ? new Date(v.last_seen).toLocaleString() : 'Unknown'} placement="left">
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                          {timeAgo(v.last_seen)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
          }
        </TableBody>
      </Table>
    </Box>
  );
}
