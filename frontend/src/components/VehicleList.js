// components/VehicleList.js — Sidebar list of all fleet vehicles
//
// Features:
//   - Search by name or license plate
//   - Filter by status (All / Active / Inactive / Maintenance)
//   - Scrollable list with icons, status chips, and last-seen time
//   - Stale indicator: orange dot + ⚠️ badge when no GPS update for 30+ minutes

import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Box,
  Divider,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const STALE_MINUTES = 30;
const SPEED_ALERT_KMH = 80; // highlight vehicles exceeding this speed

// ── Helper: pick an icon based on vehicle name prefix ─────────────────────────
function VehicleIcon({ name }) {
  const lower = (name || '').toLowerCase();
  if (lower.startsWith('truck')) return <LocalShippingIcon color="primary" />;
  if (lower.startsWith('van'))   return <DirectionsBusIcon color="secondary" />;
  return <DirectionsCarIcon color="action" />;
}

// ── Helper: is the vehicle’s last-seen older than STALE_MINUTES? ─────────────
function isStale(isoString) {
  if (!isoString) return true;
  return Date.now() - new Date(isoString).getTime() > STALE_MINUTES * 60 * 1000;
}

// ── Helper: format “last seen” time ────────────────────────────────
function formatLastSeen(isoString) {
  if (!isoString) return 'Unknown';
  const d = new Date(isoString);
  const minsAgo = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minsAgo >= 60) { const h = Math.floor(minsAgo / 60); return `${h}h ${minsAgo % 60}m ago`; }
  if (minsAgo >= 2) return `${minsAgo}m ago`;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Helper: status chip colour ────────────────────────────────────────────────
function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':      return 'success';
    case 'inactive':    return 'default';
    case 'maintenance': return 'warning';
    default:            return 'default';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Skeleton variant="circular" width={28} height={28} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="55%" height={16} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="40%" height={12} />
      </Box>
    </Box>
  );
}

export default function VehicleList({
  vehicles,
  allCount,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  loading = false,
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Fleet Vehicles ({vehicles.length}{vehicles.length !== allCount ? ` / ${allCount}` : ''})
        </Typography>

        {/* Search input */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search name or plate..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1, bgcolor: '#fff', borderRadius: 1 }}
        />

        {/* Status filter buttons */}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, val) => val && onStatusFilterChange(val)}
          sx={{ width: '100%', '& .MuiToggleButton-root': { flex: 1, py: 0.3, fontSize: 11 } }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active" sx={{ color: 'success.main' }}>Active</ToggleButton>
          <ToggleButton value="inactive">Inactive</ToggleButton>
          <ToggleButton value="maintenance" sx={{ color: 'warning.main' }}>Maint.</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Scrollable vehicle list */}
      <List dense disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
        {/* Skeleton loading state */}
        {loading && vehicles.length === 0 && (
          Array.from({ length: 5 }).map((_, i) => (
            <React.Fragment key={`sk-${i}`}>
              <SkeletonRow />
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
        {vehicles.length === 0 && (
          <Box
            sx={{
              p: 3, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {search || statusFilter !== 'all'
                ? 'No vehicles match your filter.'
                : 'No vehicles found.'}
            </Typography>
            {(search || statusFilter !== 'all') && (
              <Typography variant="caption" color="text.disabled">
                Try clearing the search or changing the status filter.
              </Typography>
            )}
          </Box>
        )}

        {vehicles.map((vehicle) => {
          const speedAlert = vehicle.status === 'active'
            && vehicle.current_speed != null
            && vehicle.current_speed > SPEED_ALERT_KMH;
          return (
          <React.Fragment key={vehicle.id}>
            <ListItemButton
              selected={vehicle.id === selectedId}
              onClick={() => onSelect(vehicle.id)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.light' },
                },
                ...(speedAlert && {
                  bgcolor: 'error.light',
                  opacity: 0.95,
                  '&:hover': { bgcolor: 'error.light' },
                  '&.Mui-selected': { bgcolor: 'error.light' },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <VehicleIcon name={vehicle.name} />
              </ListItemIcon>

              {/* Vehicle name, plate, last seen */}
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {vehicle.name}
                    </Typography>
                    <Chip
                      label={vehicle.status || 'active'}
                      size="small"
                      color={statusColor(vehicle.status)}
                      sx={{ height: 16, fontSize: 10 }}
                    />
                    {isStale(vehicle.last_seen) && (
                      <Tooltip title="No GPS update for 30+ minutes" arrow>
                        <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      </Tooltip>
                    )}
                    {speedAlert && (
                      <Tooltip title={`Speeding! ${Number(vehicle.current_speed).toFixed(0)} km/h`} arrow>
                        <SpeedIcon sx={{ fontSize: 14, color: 'error.dark' }} />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                    <span>{vehicle.license_plate}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      <FiberManualRecordIcon sx={{
                        fontSize: 8, mr: 0.3, verticalAlign: 'middle',
                        color: isStale(vehicle.last_seen) ? '#ff9800' : (vehicle.last_seen ? '#4caf50' : '#bbb'),
                      }} />
                      {isStale(vehicle.last_seen) ? '⚠ ' : ''}{formatLastSeen(vehicle.last_seen)}
                    </span>
                  </Box>
                }
              />
            </ListItemButton>
            <Divider component="li" />
          </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}
