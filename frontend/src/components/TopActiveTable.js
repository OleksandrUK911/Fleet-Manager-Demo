// components/TopActiveTable.js — Top-5 most active vehicles by GPS pings (last 24 h)
//
// Fetches GET /api/vehicles/stats/top-active and renders a compact ranked list.
// Shown inside the KpiBar below the activity chart.

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { fetchTopActive } from '../api/vehicles';

// ── Helpers ──────────────────────────────────────────────────────────────────
const VEHICLE_EMOJIS = { truck: '🚛', van: '🚐', car: '🚗' };

function vehicleEmoji(name = '') {
  const n = name.toLowerCase();
  if (n.includes('truck')) return VEHICLE_EMOJIS.truck;
  if (n.includes('van'))   return VEHICLE_EMOJIS.van;
  return VEHICLE_EMOJIS.car;
}

function statusColor(status) {
  if (status === 'active')      return 'success';
  if (status === 'maintenance') return 'warning';
  return 'default';
}

const TROPHY = ['🥇', '🥈', '🥉', '4', '5'];

// ── Component ─────────────────────────────────────────────────────────────────
export default function TopActiveTable() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchTopActive(5, 24);
        if (!cancelled) { setRows(data); setLoading(false); }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 60_000); // refresh every minute
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const maxCount = rows.length ? rows[0].position_count : 1;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.8 }}>
        <EmojiEventsIcon sx={{ fontSize: 15, color: 'warning.main' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.6, textTransform: 'uppercase' }}>
          Top Active · Last 24 h
        </Typography>
      </Box>

      {/* Ranked rows */}
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Skeleton variant="text" width={18} height={16} />
              <Skeleton variant="text" width="55%" height={16} />
              <Skeleton variant="text" width="20%" height={16} sx={{ ml: 'auto' }} />
            </Box>
          ))
        : rows.length === 0
          ? <Typography variant="caption" color="text.secondary">No data yet — GPS pings accumulate over time.</Typography>
          : rows.map((row, i) => (
              <Box key={row.id} sx={{ mb: 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  {/* Rank trophy */}
                  <Typography sx={{ fontSize: 13, minWidth: 18, textAlign: 'center', lineHeight: 1 }}>
                    {TROPHY[i] ?? i + 1}
                  </Typography>

                  {/* Emoji + name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, overflow: 'hidden' }}>
                    <span style={{ fontSize: 13 }}>{vehicleEmoji(row.name)}</span>
                    <Typography noWrap variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>
                      {row.name}
                    </Typography>
                    <Typography noWrap variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: 10 }}>
                      {row.license_plate}
                    </Typography>
                  </Box>

                  {/* Status chip */}
                  <Chip label={row.status} size="small" color={statusColor(row.status)}
                    sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.7 } }} />

                  {/* Ping count */}
                  <Tooltip title={`${row.position_count} GPS pings in last 24 h`} placement="left">
                    <Typography variant="caption" sx={{ minWidth: 38, textAlign: 'right', fontWeight: 700, color: 'text.secondary', fontSize: 11 }}>
                      {row.position_count} pts
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Progress bar relative to #1 */}
                <LinearProgress
                  variant="determinate"
                  value={(row.position_count / maxCount) * 100}
                  sx={{
                    height: 3, borderRadius: 2, mt: 0.3, ml: '26px',
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: i === 0 ? '#ffa000' : i === 1 ? '#90a4ae' : i === 2 ? '#af7c4e' : 'primary.light',
                    },
                  }}
                />
              </Box>
            ))
      }
    </Box>
  );
}
