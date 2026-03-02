// pages/AdminPage.js — Fleet Vehicle Admin Panel
//
// Features:
//   - Full table of ALL vehicles (active + inactive)
//   - Add new vehicle via dialog form
//   - Edit vehicle (name, plate, model, status) via dialog form
//   - Delete vehicle with confirmation dialog (soft-delete)
//   - Status badge chips with colour coding
//   - Search / filter in table header

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox,
  Toolbar,
  Divider,
} from '@mui/material';
import AddIcon              from '@mui/icons-material/Add';
import EditIcon             from '@mui/icons-material/Edit';
import DeleteIcon           from '@mui/icons-material/Delete';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import SearchIcon           from '@mui/icons-material/Search';
import CheckBoxIcon         from '@mui/icons-material/CheckBox';
import DeleteSweepIcon      from '@mui/icons-material/DeleteSweep';
import { useNavigate } from 'react-router-dom';

import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';
import { useSnackbar } from '../context/SnackbarContext';
import { useAuth } from '../contexts/AuthContext';

// ─── Status colour helper ─────────────────────────────────────────────────────
function statusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':      return 'success';
    case 'inactive':    return 'default';
    case 'maintenance': return 'warning';
    default:            return 'default';
  }
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', license_plate: '', model: '', status: 'active', notes: '' };

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate  = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Data state
  const [vehicles, setVehicles]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState(null);

  // ── Table controls
  const [search,   setSearch]       = useState('');
  const [orderBy,  setOrderBy]      = useState('name');
  const [orderDir, setOrderDir]     = useState('asc');

  // ── Add / Edit dialog
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);   // null = add, object = edit
  const [form,       setForm]         = useState(EMPTY_FORM);
  const [saving,     setSaving]       = useState(false);

  // ── Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selectedIds].map((id) => updateVehicle(id, { status: newStatus })));
      showSuccess(`${selectedIds.size} vehicle(s) set to "${newStatus}".`);
      setSelectedIds(new Set());
      await load();
    } catch {
      showError('Bulk update failed.');
    } finally {
      setBulkWorking(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selectedIds].map((id) => deleteVehicle(id)));
      showSuccess(`${selectedIds.size} vehicle(s) removed from fleet.`);
      setSelectedIds(new Set());
      await load();
    } catch {
      showError('Bulk delete failed.');
    } finally {
      setBulkWorking(false);
    }
  };

  // ── Load all vehicles (including inactive) ────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch active + inactive by calling twice, then merge
      const [active, inactive] = await Promise.all([
        fetchVehicles('active'),
        fetchVehicles('inactive'),
      ]);
      const maintenance = await fetchVehicles('maintenance');
      const all = [...active, ...inactive, ...maintenance]
        .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i); // dedupe
      setVehicles(all);
      setError(null);
    } catch (e) {
      setError('Failed to load vehicles. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Sorting ───────────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (orderBy === col) {
      setOrderDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(col);
      setOrderDir('asc');
    }
  };

  const sortedFiltered = [...vehicles]
    .filter((v) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.license_plate.toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const va = (a[orderBy] || '').toString().toLowerCase();
      const vb = (b[orderBy] || '').toString().toLowerCase();
      return orderDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  // ── Bulk selection derived state (depends on sortedFiltered)
  const allVisibleIds = sortedFiltered.map((v) => v.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = allVisibleIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allVisibleIds));
    }
  };

  // ── Open Add dialog ───────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  // ── Open Edit dialog ──────────────────────────────────────────────────────
  const openEdit = (vehicle) => {
    setEditTarget(vehicle);
    setForm({
      name:            vehicle.name          || '',
      license_plate:   vehicle.license_plate || '',
      model:           vehicle.model         || '',
      status:          vehicle.status        || 'active',
      notes:           vehicle.notes         || '',
    });
    setDialogOpen(true);
  };

  // ── Save (Add or Edit) ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.license_plate.trim()) {
      showError('Name and license plate are required.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateVehicle(editTarget.id, form);
        showSuccess(`${form.name} updated successfully.`);
      } else {
        await createVehicle(form);
        showSuccess(`${form.name} added to fleet.`);
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      const msg = e.response?.data?.detail || 'Save failed. Please try again.';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVehicle(deleteTarget.id);
      showSuccess(`${deleteTarget.name} removed from fleet.`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      showError('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1100, mx: 'auto' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Tooltip title="Back to Dashboard">
          <IconButton size="small" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>
          Fleet Admin
        </Typography>
        {isAdmin && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          size="small"
        >
          Add Vehicle
        </Button>
        )}
        {!isAdmin && (
          <Chip label="View Only" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
        )}
      </Box>

      {/* ── Error banner ── */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── View-only banner ── */}
      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }} icon={false}>
          <strong>View-only mode.</strong> Sign in as <em>admin</em> to add, edit or delete vehicles.
        </Alert>
      )}

      {/* ── Search ── */}
      <TextField
        size="small"
        placeholder="Search by name, plate or model…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2, width: { xs: '100%', sm: 340 } }}
      />

      {/* ── Bulk action toolbar ── */}
      {isAdmin && selectedIds.size > 0 && (
        <Paper
          elevation={3}
          sx={{
            mb: 2,
            borderRadius: 2,
            bgcolor: 'primary.dark',
            color: 'primary.contrastText',
          }}
        >
          <Toolbar variant="dense" sx={{ gap: 1, flexWrap: 'wrap', minHeight: 48 }}>
            <CheckBoxIcon fontSize="small" />
            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {selectedIds.size} selected
            </Typography>
            {bulkWorking && <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />}
            <Button size="small" color="inherit" disabled={bulkWorking} onClick={() => handleBulkStatus('active')}>
              Set Active
            </Button>
            <Button size="small" color="inherit" disabled={bulkWorking} onClick={() => handleBulkStatus('inactive')}>
              Set Inactive
            </Button>
            <Button size="small" color="inherit" disabled={bulkWorking} onClick={() => handleBulkStatus('maintenance')}>
              Maintenance
            </Button>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'primary.light', mx: 0.5 }} />
            <Button
              size="small"
              color="error"
              variant="contained"
              disabled={bulkWorking}
              startIcon={<DeleteSweepIcon />}
              onClick={handleBulkDelete}
              sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
              Delete
            </Button>
            <Button size="small" color="inherit" disabled={bulkWorking} onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </Toolbar>
        </Paper>
      )}

      {/* ── Table ── */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell padding="checkbox" sx={{ py: 1 }}>
                  {isAdmin && (
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                    sx={{ color: 'primary.contrastText', '&.Mui-checked': { color: 'primary.contrastText' }, '&.MuiCheckbox-indeterminate': { color: 'primary.contrastText' } }}
                  />
                  )}
                </TableCell>
                {[
                  { id: 'name',          label: 'Name' },
                  { id: 'license_plate', label: 'Plate' },
                  { id: 'model',         label: 'Model' },
                  { id: 'status',        label: 'Status' },
                  { id: 'last_seen',     label: 'Last Seen' },
                  { id: 'notes',         label: 'Notes', noSort: true },
                ].map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ color: 'primary.contrastText', fontWeight: 700, py: 1 }}
                    sortDirection={orderBy === col.id ? orderDir : false}
                  >
                    {col.noSort ? col.label : (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? orderDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{
                        color: 'primary.contrastText !important',
                        '& .MuiTableSortLabel-icon': { color: 'primary.contrastText !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                    )}
                  </TableCell>
                ))}
                  <TableCell sx={{ color: 'primary.contrastText', fontWeight: 700, py: 1, width: 90 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && sortedFiltered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    {search ? 'No vehicles match your search.' : 'No vehicles found.'}
                  </TableCell>
                </TableRow>
              )}

              {!loading && sortedFiltered.map((v, i) => (
                <TableRow
                  key={v.id}
                  selected={selectedIds.has(v.id)}
                  sx={{
                    bgcolor: i % 2 === 0 ? 'background.paper' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                    '&.Mui-selected': { bgcolor: 'action.selected' },
                    opacity: v.is_active === false ? 0.55 : 1,
                  }}
                >
                  <TableCell padding="checkbox">
                    {isAdmin && (
                    <Checkbox size="small" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{v.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{v.license_plate}</TableCell>
                  <TableCell>{v.model || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={v.status}
                      size="small"
                      color={statusColor(v.status)}
                      sx={{ fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {v.last_seen ? new Date(v.last_seen).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    {v.notes ? (
                      <Tooltip title={v.notes} placement="top-start">
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {v.notes}
                        </Typography>
                      </Tooltip>
                    ) : <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {isAdmin ? (
                      <>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(v)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleteTarget(v)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                      </>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.disabled', px: 1 }}>—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Row count */}
        {!loading && (
          <Box sx={{ px: 2, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {sortedFiltered.length} vehicle{sortedFiltered.length !== 1 ? 's' : ''}
              {search ? ` (filtered from ${vehicles.length})` : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════
          Add / Edit Dialog
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget ? `Edit — ${editTarget.name}` : 'Add New Vehicle'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            size="small"
            required
            placeholder="e.g. Truck-06"
          />

          <TextField
            label="License Plate"
            value={form.license_plate}
            onChange={(e) => setForm((f) => ({ ...f, license_plate: e.target.value.toUpperCase() }))}
            fullWidth
            size="small"
            required
            placeholder="e.g. AB12 CDE"
          />

          <TextField
            label="Model"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            fullWidth
            size="small"
            placeholder="e.g. Mercedes Actros 1845"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <MenuItem value="active">
                <Chip label="active" color="success" size="small" sx={{ mr: 1, fontSize: 11 }} />
                Active
              </MenuItem>
              <MenuItem value="inactive">
                <Chip label="inactive" size="small" sx={{ mr: 1, fontSize: 11 }} />
                Inactive
              </MenuItem>
              <MenuItem value="maintenance">
                <Chip label="maintenance" color="warning" size="small" sx={{ mr: 1, fontSize: 11 }} />
                Maintenance
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Operator Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            fullWidth
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            placeholder="e.g. scheduled service 15 Mar, tyres replaced"
            inputProps={{ maxLength: 500 }}
            helperText={`${(form.notes || '').length}/500`}
          />

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {editTarget ? 'Save Changes' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Confirmation Dialog
      ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Vehicle?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{deleteTarget?.name}</strong> ({deleteTarget?.license_plate}) will be soft-deleted
            and removed from the live map and fleet list. This action can be reversed via the API.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
