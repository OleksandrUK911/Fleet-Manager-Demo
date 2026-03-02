// components/FleetActivityChart.js — GPS ping count per hour, last 24h
//
// Shown in the dashboard info row as a compact AreaChart (Recharts).
// Auto-refreshes every 5 minutes.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchFleetActivity } from '../api/vehicles';

// ─── Custom recharts tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        px: 1.5,
        py: 0.75,
        boxShadow: 3,
        fontSize: 12,
      }}
    >
      <Typography variant="caption" fontWeight={700} display="block">{label}</Typography>
      <Typography variant="caption" color="primary.main">{payload[0].value} pings</Typography>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FleetActivityChart() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await fetchFleetActivity();
      setData(rows);
    } catch {
      // silently fail — non-critical widget
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // 5 min
    return () => clearInterval(id);
  }, [load]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Show every 4th label to avoid crowding (e.g. 00:00, 04:00, 08:00 …)
  const tickFormatter = (val, idx) => (idx % 4 === 0 ? val : '');

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderColor: 'divider',
        px: { xs: 1.5, sm: 2 },
        pt: 1,
        pb: 0.5,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', flexGrow: 1 }}>
          Fleet Activity · 24 h
        </Typography>
        {!loading && (
          <Tooltip title={`Peak: ${maxCount} pings/h`} placement="left">
            <Typography variant="caption" sx={{ fontSize: 10, color: 'primary.main', fontWeight: 700, cursor: 'default' }}>
              ↑{maxCount}
            </Typography>
          </Tooltip>
        )}
      </Box>

      {loading ? (
        <Box sx={{ px: 0.5 }}>
          <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 1 }} />
        </Box>
      ) : data.length === 0 || data.every((d) => d.count === 0) ? (
        <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
            No GPS data yet — generator accumulating…
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={68}>
          <AreaChart data={data} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1565c0" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#1565c0" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9 }}
              tickFormatter={tickFormatter}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9 }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <RTooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1565c0"
              strokeWidth={1.5}
              fill="url(#activityGrad)"
              dot={false}
              activeDot={{ r: 3, fill: '#1565c0' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
