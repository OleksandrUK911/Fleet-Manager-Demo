// components/KpiBar.js — Fleet KPI summary cards shown below the AppBar
//
// Shows 6 stat cards:
//   Total / Active / Inactive / Maintenance / Today's Distance / Overspeed
// Auto-refreshes together with the main vehicle list.

import React from 'react';
import { Box, Paper, Typography, Skeleton, Tooltip } from '@mui/material';
import DirectionsBusIcon       from '@mui/icons-material/DirectionsBus';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon  from '@mui/icons-material/PauseCircleOutline';
import BuildOutlinedIcon       from '@mui/icons-material/BuildOutlined';
import RouteIcon               from '@mui/icons-material/Route';
import SpeedIcon               from '@mui/icons-material/Speed';
import ActivityChart from './ActivityChart';

// ── KPI card definition ───────────────────────────────────────────────────────
const CARDS = [
  {
    key: 'total',
    label: 'Total Fleet',
    icon: <DirectionsBusIcon fontSize="small" />,
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    key: 'active',
    label: 'Active',
    icon: <CheckCircleOutlineIcon fontSize="small" />,
    color: '#388e3c',
    bg: '#e8f5e9',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    icon: <PauseCircleOutlineIcon fontSize="small" />,
    color: '#757575',
    bg: '#f5f5f5',
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <BuildOutlinedIcon fontSize="small" />,
    color: '#f57c00',
    bg: '#fff3e0',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function KpiBar({ stats, loading, distanceKm, overspeedCount }) {
  const speeding = overspeedCount ?? 0;
  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
      {/* ── KPI cards row ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          px: 2,
          py: 1.5,
          overflowX: 'auto',
        }}
      >
      {CARDS.map((card) => (
        <Paper
          key={card.key}
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: card.bg,
            border: `1px solid ${card.color}22`,
            minWidth: 130,
            flex: '1 1 130px',
          }}
        >
          {/* Icon */}
          <Box sx={{ color: card.color, display: 'flex', alignItems: 'center' }}>
            {card.icon}
          </Box>

          {/* Value + label */}
          <Box>
            {loading ? (
              <Skeleton variant="text" width={32} height={28} />
            ) : (
              <Typography
                variant="h6"
                fontWeight={700}
                lineHeight={1}
                sx={{ color: card.color }}
              >
                {stats?.[card.key] ?? 0}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              {card.label}
            </Typography>
          </Box>
        </Paper>
      ))}

      {/* ── Distance today card ── */}
      <Tooltip title="Total km driven today (UTC) across all active vehicles">
        <Paper
          elevation={0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 1, borderRadius: 2,
            bgcolor: '#f3e5f5', border: '1px solid #7b1fa222',
            minWidth: 130, flex: '1 1 130px',
          }}
        >
          <Box sx={{ color: '#7b1fa2', display: 'flex', alignItems: 'center' }}>
            <RouteIcon fontSize="small" />
          </Box>
          <Box>
            {loading || distanceKm === undefined ? (
              <Skeleton variant="text" width={40} height={28} />
            ) : (
              <Typography variant="h6" fontWeight={700} lineHeight={1} sx={{ color: '#7b1fa2' }}>
                {Number(distanceKm).toFixed(1)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              km today
            </Typography>
          </Box>
        </Paper>
      </Tooltip>

      {/* ── Overspeed card ── */}
      <Tooltip title={`Vehicles currently above 80 km/h${speeding > 0 ? ' — attention required' : ''}`}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 1, borderRadius: 2,
            bgcolor: speeding > 0 ? '#ffebee' : '#f5f5f5',
            border: speeding > 0 ? '1px solid #d32f2f44' : '1px solid #bdbdbd22',
            minWidth: 130, flex: '1 1 130px',
          }}
        >
          <Box sx={{ color: speeding > 0 ? '#d32f2f' : '#9e9e9e', display: 'flex', alignItems: 'center' }}>
            <SpeedIcon fontSize="small" />
          </Box>
          <Box>
            {loading || overspeedCount === undefined ? (
              <Skeleton variant="text" width={32} height={28} />
            ) : (
              <Typography
                variant="h6" fontWeight={700} lineHeight={1}
                sx={{ color: speeding > 0 ? '#d32f2f' : '#9e9e9e' }}
              >
                {speeding}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              overspeed
            </Typography>
          </Box>
        </Paper>
      </Tooltip>
      </Box>

      {/* ── Activity chart ── */}
      <ActivityChart />
    </Box>
  );
}
