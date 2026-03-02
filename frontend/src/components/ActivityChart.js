// components/ActivityChart.js — Hourly fleet activity bar chart
//
// Fetches last-24h position counts from /api/vehicles/stats/activity
// and renders a compact Recharts BarChart.

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Box, Typography, Skeleton, useTheme } from '@mui/material';
import { fetchFleetActivity } from '../api/vehicles';

// Custom tooltip to keep it minimal
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        boxShadow: 3,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary">
        {payload[0].value} positions
      </Typography>
    </Box>
  );
}

export default function ActivityChart() {
  const theme = useTheme();
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchFleetActivity();
        if (!cancelled) {
          setData(result);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ px: 2, pb: 1 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (error || data.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 1, display: 'block' }}>
        No activity data available.
      </Typography>
    );
  }

  // Only label every 4 hours to avoid crowding
  const tickFormatter = (value, index) => (index % 4 === 0 ? value : '');

  return (
    <Box sx={{ px: 1, pb: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
        Fleet activity — last 24 h (position updates / hour)
      </Typography>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={data} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis
            dataKey="hour"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }} />
          <Bar dataKey="count" fill={theme.palette.primary.main} radius={[2, 2, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
