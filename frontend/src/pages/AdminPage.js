// pages/AdminPage.js — Fleet Vehicle Admin Panel (redesigned)
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TableSortLabel, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
  Checkbox, Toolbar, Divider, Tab, Tabs, Skeleton, Avatar, LinearProgress,
} from '@mui/material';
import AddIcon              from '@mui/icons-material/Add';
import EditIcon             from '@mui/icons-material/Edit';
import DeleteIcon           from '@mui/icons-material/Delete';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import SearchIcon           from '@mui/icons-material/Search';
import CheckBoxIcon         from '@mui/icons-material/CheckBox';
import DeleteSweepIcon      from '@mui/icons-material/DeleteSweep';
import RefreshIcon          from '@mui/icons-material/Refresh';
import DirectionsBusIcon    from '@mui/icons-material/DirectionsBus';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import PauseCircleIcon      from '@mui/icons-material/PauseCircle';
import BuildIcon            from '@mui/icons-material/Build';
import RouteIcon            from '@mui/icons-material/Route';
import SpeedIcon            from '@mui/icons-material/Speed';
import EmojiEventsIcon      from '@mui/icons-material/EmojiEvents';
import TableChartIcon       from '@mui/icons-material/TableChart';
import DashboardIcon        from '@mui/icons-material/Dashboard';
import { useNavigate }      from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import {
  fetchVehicles, createVehicle, updateVehicle, deleteVehicle,
  fetchFleetStats, fetchFleetDistance, fetchOverspeedVehicles,
  fetchFleetActivity, fetchTopActive,
} from '../api/vehicles';
import { useSnackbar } from '../context/SnackbarContext';
import { useAuth }     from '../contexts/AuthContext';

function statusColor(s) {
  switch ((s||'').toLowerCase()) {
    case 'active':      return 'success';
    case 'inactive':    return 'default';
    case 'maintenance': return 'warning';
    default:            return 'default';
  }
}
function statusHex(s) {
  switch ((s||'').toLowerCase()) {
    case 'active':      return '#388e3c';
    case 'inactive':    return '#9e9e9e';
    case 'maintenance': return '#f57c00';
    default:            return '#9e9e9e';
  }
}

const EMPTY_FORM = { name:'', license_plate:'', model:'', status:'active', notes:'' };

const KPI_CARDS = [
  { key:'total',       label:'Total Fleet',  Icon:DirectionsBusIcon, color:'#1976d2', bg:'#e3f2fd' },
  { key:'active',      label:'Active',       Icon:CheckCircleIcon,   color:'#388e3c', bg:'#e8f5e9' },
  { key:'inactive',    label:'Inactive',     Icon:PauseCircleIcon,   color:'#757575', bg:'#f5f5f5' },
  { key:'maintenance', label:'Maintenance',  Icon:BuildIcon,         color:'#f57c00', bg:'#fff3e0' },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={4} sx={{ px:1.5, py:0.75, borderRadius:1.5, fontSize:12 }}>
      <Typography variant="caption" fontWeight={700} display="block">{label}</Typography>
      <Typography variant="caption" color="primary.main">{payload[0].value} pings</Typography>
    </Paper>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState(0);

  const [vehicles,   setVehicles]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [overspeed,  setOverspeed]  = useState(null);
  const [activity,   setActivity]   = useState([]);
  const [topActive,  setTopActive]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [search,   setSearch]   = useState('');
  const [orderBy,  setOrderBy]  = useState('name');
  const [orderDir, setOrderDir] = useState('asc');

  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [bulkWorking,  setBulkWorking]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [active, inactive, maintenance, statsData, distData, speedData, actData, topData] =
        await Promise.all([
          fetchVehicles('active'), fetchVehicles('inactive'), fetchVehicles('maintenance'),
          fetchFleetStats(), fetchFleetDistance(), fetchOverspeedVehicles(80),
          fetchFleetActivity(), fetchTopActive(5, 24),
        ]);
      const all = [...active, ...inactive, ...maintenance]
        .filter((v,i,arr) => arr.findIndex(x => x.id===v.id)===i);
      setVehicles(all);
      setStats(statsData);
      setDistanceKm(distData.total_km);
      setOverspeed(speedData.count);
      setActivity(actData);
      setTopActive(Array.isArray(topData) ? topData : (topData?.vehicles || []));
      setError(null);
    } catch { setError('Failed to load fleet data. Check backend connection.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSort = (col) => {
    if (orderBy===col) setOrderDir(d => d==='asc'?'desc':'asc');
    else { setOrderBy(col); setOrderDir('asc'); }
  };

  const sortedFiltered = [...vehicles]
    .filter(v => {
      if (!search) return true;
      const q = search.toLowerCase();
      return v.name.toLowerCase().includes(q) ||
             v.license_plate.toLowerCase().includes(q) ||
             (v.model||'').toLowerCase().includes(q);
    })
    .sort((a,b) => {
      const va=(a[orderBy]||'').toString().toLowerCase();
      const vb=(b[orderBy]||'').toString().toLowerCase();
      return orderDir==='asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const allVisibleIds   = sortedFiltered.map(v=>v.id);
  const allSelected     = allVisibleIds.length>0 && allVisibleIds.every(id=>selectedIds.has(id));
  const someSelected    = allVisibleIds.some(id=>selectedIds.has(id)) && !allSelected;
  const toggleSelectAll = () => setSelectedIds(allSelected ? new Set() : new Set(allVisibleIds));
  const toggleSelect    = (id) => setSelectedIds(prev => {
    const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n;
  });

  const handleBulkStatus = async (st) => {
    if (!selectedIds.size) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selectedIds].map(id=>updateVehicle(id,{status:st})));
      showSuccess(`${selectedIds.size} vehicle(s) set to "${st}".`);
      setSelectedIds(new Set()); await load();
    } catch { showError('Bulk update failed.'); } finally { setBulkWorking(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selectedIds].map(id=>deleteVehicle(id)));
      showSuccess(`${selectedIds.size} vehicle(s) removed.`);
      setSelectedIds(new Set()); await load();
    } catch { showError('Bulk delete failed.'); } finally { setBulkWorking(false); }
  };

  const openAdd  = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (v) => {
    setEditTarget(v);
    setForm({ name:v.name||'', license_plate:v.license_plate||'',
              model:v.model||'', status:v.status||'active', notes:v.notes||'' });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()||!form.license_plate.trim()) { showError('Name and plate are required.'); return; }
    setSaving(true);
    try {
      if (editTarget) { await updateVehicle(editTarget.id, form); showSuccess(`${form.name} updated.`); }
      else            { await createVehicle(form);                showSuccess(`${form.name} added.`); }
      setDialogOpen(false); await load();
    } catch (e) { showError(e.response?.data?.detail||'Save failed.'); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVehicle(deleteTarget.id);
      showSuccess(`${deleteTarget.name} removed.`); setDeleteTarget(null); await load();
    } catch { showError('Delete failed.'); } finally { setDeleting(false); }
  };

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'background.default' }}>

      {/* ── HEADER ── */}
      <Box sx={{
        background: t => t.palette.mode==='dark'
          ? 'linear-gradient(135deg,#0d1b2a 0%,#1b2d45 100%)'
          : 'linear-gradient(135deg,#1565c0 0%,#1976d2 60%,#42a5f5 100%)',
        color:'#fff', px:{xs:2,md:4}, py:{xs:2,md:2.5},
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, maxWidth:1200, mx:'auto' }}>
          <Tooltip title="Back to Dashboard">
            <IconButton size="small" onClick={()=>navigate('/')}
              sx={{ color:'rgba(255,255,255,0.85)', '&:hover':{bgcolor:'rgba(255,255,255,0.15)'} }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ bgcolor:'rgba(255,255,255,0.2)', width:36, height:36 }}>
            <DirectionsBusIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow:1 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>Fleet Admin Panel</Typography>
            <Typography variant="caption" sx={{ opacity:0.8 }}>
              {user?.display_name||user?.username} · {isAdmin?'Full admin access':'View only'}
            </Typography>
          </Box>
          {!isAdmin && (
            <Chip label="View Only" size="small"
              sx={{ bgcolor:'rgba(255,193,7,0.25)', color:'#ffe082',
                    border:'1px solid rgba(255,193,7,0.5)', fontWeight:700 }} />
          )}
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={load} disabled={loading}
              sx={{ color:'rgba(255,255,255,0.85)', '&:hover':{bgcolor:'rgba(255,255,255,0.15)'} }}>
              {loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ bgcolor:'rgba(255,255,255,0.2)', '&:hover':{bgcolor:'rgba(255,255,255,0.3)'},
                    color:'#fff', fontWeight:700 }}>
              Add Vehicle
            </Button>
          )}
        </Box>
      </Box>

      {/* ── KPI ROW ── */}
      <Box sx={{ bgcolor:'background.paper', borderBottom:'1px solid', borderColor:'divider',
                 px:{xs:2,md:4}, py:1.5 }}>
        <Box sx={{ display:'flex', gap:1.5, maxWidth:1200, mx:'auto', overflowX:'auto', pb:0.5 }}>
          {KPI_CARDS.map(({ key, label, Icon, color, bg }) => (
            <Paper key={key} elevation={0} sx={{
              display:'flex', alignItems:'center', gap:1.5,
              px:2, py:1.25, borderRadius:2, bgcolor:bg, border:`1px solid ${color}30`,
              minWidth:110, flex:'1 1 110px',
            }}>
              <Box sx={{ bgcolor:color, borderRadius:'50%', width:32, height:32,
                         display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon sx={{ fontSize:18, color:'#fff' }} />
              </Box>
              <Box>
                {loading ? <Skeleton width={28} height={26} /> : (
                  <Typography variant="h6" fontWeight={800} lineHeight={1} sx={{ color }}>
                    {stats?.[key]??0}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            </Paper>
          ))}

          <Paper elevation={0} sx={{ display:'flex', alignItems:'center', gap:1.5,
            px:2, py:1.25, borderRadius:2, bgcolor:'#f3e5f5', border:'1px solid #7b1fa230',
            minWidth:110, flex:'1 1 110px' }}>
            <Box sx={{ bgcolor:'#7b1fa2', borderRadius:'50%', width:32, height:32,
                       display:'flex', alignItems:'center', justifyContent:'center' }}>
              <RouteIcon sx={{ fontSize:18, color:'#fff' }} />
            </Box>
            <Box>
              {loading||distanceKm===null ? <Skeleton width={36} height={26} /> : (
                <Typography variant="h6" fontWeight={800} lineHeight={1} sx={{ color:'#7b1fa2' }}>
                  {Number(distanceKm).toFixed(1)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">km today</Typography>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ display:'flex', alignItems:'center', gap:1.5,
            px:2, py:1.25, borderRadius:2, bgcolor:'#fce4ec', border:'1px solid #c6282830',
            minWidth:110, flex:'1 1 110px' }}>
            <Box sx={{ bgcolor:overspeed>0?'#c62828':'#757575', borderRadius:'50%', width:32, height:32,
                       display:'flex', alignItems:'center', justifyContent:'center' }}>
              <SpeedIcon sx={{ fontSize:18, color:'#fff' }} />
            </Box>
            <Box>
              {loading||overspeed===null ? <Skeleton width={24} height={26} /> : (
                <Typography variant="h6" fontWeight={800} lineHeight={1} sx={{ color:overspeed>0?'#c62828':'#757575' }}>
                  {overspeed}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">overspeed</Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ── TABS ── */}
      <Box sx={{ bgcolor:'background.paper', borderBottom:'1px solid', borderColor:'divider' }}>
        <Box sx={{ maxWidth:1200, mx:'auto', px:{xs:1,md:3} }}>
          <Tabs value={tab} onChange={(_,v)=>setTab(v)} textColor="primary" indicatorColor="primary">
            <Tab icon={<DashboardIcon sx={{ fontSize:18 }} />} iconPosition="start"
                 label="Overview" sx={{ fontWeight:600, minHeight:48 }} />
            <Tab icon={<TableChartIcon sx={{ fontSize:18 }} />} iconPosition="start"
                 label="Fleet Management" sx={{ fontWeight:600, minHeight:48 }} />
          </Tabs>
        </Box>
      </Box>

      {error && (
        <Box sx={{ maxWidth:1200, mx:'auto', px:{xs:2,md:4}, pt:2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box sx={{ maxWidth:1200, mx:'auto', px:{xs:2,md:4}, py:3 }}>

        {/* ══ TAB 0: OVERVIEW ══ */}
        {tab===0 && (
          <Box sx={{ display:'flex', flexDirection:'column', gap:3 }}>

            <Box sx={{ display:'grid', gridTemplateColumns:{xs:'1fr',md:'1fr 1fr'}, gap:3 }}>

              {/* Status breakdown */}
              <Paper elevation={2} sx={{ p:2.5, borderRadius:2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Fleet Status Breakdown
                </Typography>
                <Divider sx={{ mb:2 }} />
                {['active','inactive','maintenance'].map(s => {
                  const count  = stats?.[s]??0;
                  const total  = stats?.total||1;
                  const pct    = Math.round((count/total)*100);
                  const clr    = {active:'#388e3c',inactive:'#757575',maintenance:'#f57c00'}[s];
                  const bg     = {active:'#e8f5e9',inactive:'#f5f5f5',maintenance:'#fff3e0'}[s];
                  return (
                    <Box key={s} sx={{ mb:2 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:clr }} />
                          <Typography variant="body2" fontWeight={600} sx={{ textTransform:'capitalize' }}>{s}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {loading?'—':`${count} vehicle${count!==1?'s':''} (${pct}%)`}
                        </Typography>
                      </Box>
                      {loading ? <Skeleton height={8} sx={{ borderRadius:4 }} /> : (
                        <LinearProgress variant="determinate" value={pct}
                          sx={{ height:8, borderRadius:4, bgcolor:bg,
                                '& .MuiLinearProgress-bar':{ bgcolor:clr, borderRadius:4 } }} />
                      )}
                    </Box>
                  );
                })}
                {!loading && stats && (
                  <Box sx={{ mt:2, height:120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {name:'Active',      value:stats.active??0,      fill:'#388e3c'},
                          {name:'Inactive',    value:stats.inactive??0,    fill:'#757575'},
                          {name:'Maintenance', value:stats.maintenance??0, fill:'#f57c00'},
                        ]}
                        margin={{top:4,right:4,left:-28,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" tick={{fontSize:11}} />
                        <YAxis tick={{fontSize:11}} allowDecimals={false} />
                        <RTooltip />
                        <Bar dataKey="value" radius={[4,4,0,0]}>
                          {[
                            {name:'Active',fill:'#388e3c'},
                            {name:'Inactive',fill:'#757575'},
                            {name:'Maintenance',fill:'#f57c00'},
                          ].map(e=><Cell key={e.name} fill={e.fill}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>

              {/* Top 5 active */}
              <Paper elevation={2} sx={{ p:2.5, borderRadius:2 }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:1 }}>
                  <EmojiEventsIcon sx={{ color:'#f57c00', fontSize:20 }} />
                  <Typography variant="subtitle1" fontWeight={700}>Top 5 Most Active (24h)</Typography>
                </Box>
                <Divider sx={{ mb:2 }} />
                {loading ? (
                  [...Array(5)].map((_,i)=><Skeleton key={i} height={40} sx={{mb:0.5}}/>)
                ) : topActive.length===0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py:2, textAlign:'center' }}>
                    No activity data yet.
                  </Typography>
                ) : topActive.map((v,idx)=>(
                  <Box key={v.id} sx={{ display:'flex', alignItems:'center', gap:1.5, py:0.85,
                    borderBottom:idx<topActive.length-1?'1px solid':'none', borderColor:'divider' }}>
                    <Typography variant="caption" fontWeight={800} sx={{
                      width:22, height:22, borderRadius:'50%', flexShrink:0,
                      bgcolor:idx===0?'#ffd700':idx===1?'#c0c0c0':idx===2?'#cd7f32':'action.hover',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:idx<3?'#000':'text.secondary',
                    }}>{idx+1}</Typography>
                    <Box sx={{ flexGrow:1, minWidth:0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{v.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {v.license_plate} · {v.model||'Unknown model'}
                      </Typography>
                    </Box>
                    <Chip size="small" label={`${v.ping_count??v.position_count??'—'} pings`}
                      sx={{ fontSize:11, bgcolor:'#e3f2fd', color:'#1565c0', fontWeight:700 }} />
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Activity chart */}
            <Paper elevation={2} sx={{ p:2.5, borderRadius:2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                GPS Activity — Last 24 Hours
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Position pings received per hour across all vehicles
              </Typography>
              <Divider sx={{ my:1.5 }} />
              {loading ? <Skeleton height={200} sx={{ borderRadius:1 }} /> : (
                <Box sx={{ height:200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activity} margin={{top:4,right:8,left:-20,bottom:0}}>
                      <defs>
                        <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1976d2" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                      <XAxis dataKey="hour" tick={{fontSize:11}}/>
                      <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                      <RTooltip content={<ChartTooltip/>}/>
                      <Area type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2}
                        fill="url(#actGrad)" dot={false} activeDot={{r:4}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>

            {/* Quick stats grid */}
            <Box sx={{ display:'grid', gridTemplateColumns:{xs:'1fr 1fr',md:'repeat(4,1fr)'}, gap:2 }}>
              {[
                { label:'Total distance today',   value:distanceKm!==null?`${Number(distanceKm).toFixed(1)} km`:'—', color:'#7b1fa2' },
                { label:'Overspeed alerts >80 km/h', value:overspeed!==null?overspeed:'—',           color:overspeed>0?'#c62828':'#388e3c' },
                { label:'Fleet utilisation',       value:stats?`${Math.round(((stats.active||0)/(stats.total||1))*100)}%`:'—', color:'#1976d2' },
                { label:'Total registered vehicles', value:stats?.total??'—',                        color:'#1976d2' },
              ].map(item=>(
                <Paper key={item.label} elevation={1} sx={{ p:2, borderRadius:2, textAlign:'center' }}>
                  {loading ? <Skeleton height={40}/> : (
                    <Typography variant="h5" fontWeight={800} sx={{ color:item.color }}>{item.value}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt:0.5 }}>
                    {item.label}
                  </Typography>
                </Paper>
              ))}
            </Box>

          </Box>
        )}

        {/* ══ TAB 1: FLEET MANAGEMENT ══ */}
        {tab===1 && (
          <Box>
            {!isAdmin && (
              <Alert severity="info" sx={{ mb:2 }} icon={false}>
                <strong>View-only mode.</strong> Sign in as <em>admin</em> to add, edit or delete vehicles.
              </Alert>
            )}
            <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2, flexWrap:'wrap' }}>
              <TextField size="small" placeholder="Search by name, plate or model…"
                value={search} onChange={e=>setSearch(e.target.value)}
                InputProps={{ startAdornment:(
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{color:'text.disabled'}}/>
                  </InputAdornment>
                )}} sx={{ width:{xs:'100%',sm:320} }}/>
              <Typography variant="caption" color="text.secondary" sx={{ml:'auto'}}>
                {sortedFiltered.length} of {vehicles.length} vehicles
                {selectedIds.size>0?` · ${selectedIds.size} selected`:''}
              </Typography>
            </Box>

            {isAdmin && selectedIds.size>0 && (
              <Paper elevation={3} sx={{ mb:2, borderRadius:2, bgcolor:'primary.dark', color:'#fff' }}>
                <Toolbar variant="dense" sx={{ gap:1, flexWrap:'wrap', minHeight:48 }}>
                  <CheckBoxIcon fontSize="small"/>
                  <Typography variant="body2" sx={{ flexGrow:1, fontWeight:600 }}>
                    {selectedIds.size} selected
                  </Typography>
                  {bulkWorking && <CircularProgress size={18} color="inherit" sx={{mr:1}}/>}
                  <Button size="small" color="inherit" disabled={bulkWorking} onClick={()=>handleBulkStatus('active')}>Set Active</Button>
                  <Button size="small" color="inherit" disabled={bulkWorking} onClick={()=>handleBulkStatus('inactive')}>Set Inactive</Button>
                  <Button size="small" color="inherit" disabled={bulkWorking} onClick={()=>handleBulkStatus('maintenance')}>Maintenance</Button>
                  <Divider orientation="vertical" flexItem sx={{bgcolor:'primary.light',mx:0.5}}/>
                  <Button size="small" color="error" variant="contained" disabled={bulkWorking}
                    startIcon={<DeleteSweepIcon/>} onClick={handleBulkDelete}
                    sx={{bgcolor:'#d32f2f','&:hover':{bgcolor:'#b71c1c'}}}>
                    Delete
                  </Button>
                  <Button size="small" color="inherit" disabled={bulkWorking} onClick={()=>setSelectedIds(new Set())}>Clear</Button>
                </Toolbar>
              </Paper>
            )}

            <Paper elevation={2} sx={{ borderRadius:2, overflow:'hidden' }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor:'primary.main' }}>
                      <TableCell padding="checkbox" sx={{py:1}}>
                        {isAdmin && (
                          <Checkbox size="small" checked={allSelected} indeterminate={someSelected}
                            onChange={toggleSelectAll}
                            sx={{ color:'primary.contrastText','&.Mui-checked':{color:'primary.contrastText'},
                                  '&.MuiCheckbox-indeterminate':{color:'primary.contrastText'} }}/>
                        )}
                      </TableCell>
                      <TableCell sx={{color:'#fff',fontWeight:700,py:1,width:36}}>#</TableCell>
                      {[
                        {id:'name',label:'Name'},
                        {id:'license_plate',label:'Plate'},
                        {id:'model',label:'Model'},
                        {id:'status',label:'Status'},
                        {id:'last_seen',label:'Last Seen'},
                        {id:'notes',label:'Notes',noSort:true},
                      ].map(col=>(
                        <TableCell key={col.id}
                          sx={{color:'primary.contrastText',fontWeight:700,py:1}}
                          sortDirection={orderBy===col.id?orderDir:false}>
                          {col.noSort?col.label:(
                            <TableSortLabel active={orderBy===col.id} direction={orderBy===col.id?orderDir:'asc'}
                              onClick={()=>handleSort(col.id)}
                              sx={{color:'primary.contrastText !important',
                                   '& .MuiTableSortLabel-icon':{color:'primary.contrastText !important'}}}>
                              {col.label}
                            </TableSortLabel>
                          )}
                        </TableCell>
                      ))}
                      <TableCell sx={{color:'primary.contrastText',fontWeight:700,py:1,width:90}}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow><TableCell colSpan={9} align="center" sx={{py:4}}>
                        <CircularProgress size={28}/>
                      </TableCell></TableRow>
                    )}
                    {!loading && sortedFiltered.length===0 && (
                      <TableRow><TableCell colSpan={9} align="center" sx={{py:4,color:'text.secondary'}}>
                        {search?'No vehicles match your search.':'No vehicles found.'}
                      </TableCell></TableRow>
                    )}
                    {!loading && sortedFiltered.map((v,i)=>(
                      <TableRow key={v.id} selected={selectedIds.has(v.id)}
                        sx={{ bgcolor:i%2===0?'background.paper':'action.hover',
                              '&:hover':{bgcolor:'action.selected'},
                              '&.Mui-selected':{bgcolor:'action.selected'},
                              opacity:v.is_active===false?0.55:1 }}>
                        <TableCell padding="checkbox">
                          {isAdmin && <Checkbox size="small" checked={selectedIds.has(v.id)} onChange={()=>toggleSelect(v.id)}/>}
                        </TableCell>
                        <TableCell sx={{color:'text.disabled',fontSize:12}}>{i+1}</TableCell>
                        <TableCell>
                          <Box sx={{display:'flex',alignItems:'center',gap:1}}>
                            <Box sx={{width:8,height:8,borderRadius:'50%',flexShrink:0,bgcolor:statusHex(v.status)}}/>
                            <Typography variant="body2" fontWeight={600}>{v.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{fontFamily:'monospace',fontSize:13}}>{v.license_plate}</TableCell>
                        <TableCell sx={{color:'text.secondary',fontSize:13}}>{v.model||'—'}</TableCell>
                        <TableCell>
                          <Chip label={v.status} size="small" color={statusColor(v.status)} sx={{fontSize:11}}/>
                        </TableCell>
                        <TableCell sx={{fontSize:12,color:'text.secondary'}}>
                          {v.last_seen?new Date(v.last_seen).toLocaleString():'—'}
                        </TableCell>
                        <TableCell sx={{maxWidth:160}}>
                          {v.notes?(
                            <Tooltip title={v.notes} placement="top-start">
                              <Typography variant="caption" sx={{color:'text.secondary',
                                display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                                {v.notes}
                              </Typography>
                            </Tooltip>
                          ):<Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                        <TableCell sx={{whiteSpace:'nowrap'}}>
                          {isAdmin?(
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={()=>openEdit(v)} color="primary">
                                  <EditIcon fontSize="small"/>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={()=>setDeleteTarget(v)} color="error">
                                  <DeleteIcon fontSize="small"/>
                                </IconButton>
                              </Tooltip>
                            </>
                          ):<Typography variant="caption" sx={{color:'text.disabled',px:1}}>—</Typography>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {!loading && (
                <Box sx={{px:2,py:1,borderTop:'1px solid',borderColor:'divider',bgcolor:'action.hover'}}>
                  <Typography variant="caption" color="text.secondary">
                    {sortedFiltered.length} vehicle{sortedFiltered.length!==1?'s':''}
                    {search?` (filtered from ${vehicles.length})`:''}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

      </Box>

      {/* ── ADD/EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editTarget?`Edit — ${editTarget.name}`:'Add New Vehicle'}</DialogTitle>
        <DialogContent sx={{display:'flex',flexDirection:'column',gap:2,pt:'12px !important'}}>
          <TextField label="Name" value={form.name} size="small" required fullWidth
            onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Truck-06"/>
          <TextField label="License Plate" value={form.license_plate} size="small" required fullWidth
            onChange={e=>setForm(f=>({...f,license_plate:e.target.value.toUpperCase()}))} placeholder="e.g. AB12 CDE"/>
          <TextField label="Model" value={form.model} size="small" fullWidth
            onChange={e=>setForm(f=>({...f,model:e.target.value}))} placeholder="e.g. Mercedes Actros 1845"/>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <MenuItem value="active"><Chip label="active" color="success" size="small" sx={{mr:1}}/>Active</MenuItem>
              <MenuItem value="inactive"><Chip label="inactive" size="small" sx={{mr:1}}/>Inactive</MenuItem>
              <MenuItem value="maintenance"><Chip label="maintenance" color="warning" size="small" sx={{mr:1}}/>Maintenance</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Operator Notes" value={form.notes} size="small" fullWidth
            multiline minRows={2} maxRows={4}
            onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="e.g. scheduled service 15 Mar"
            inputProps={{maxLength:500}} helperText={`${(form.notes||'').length}/500`}/>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2}}>
          <Button onClick={()=>setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}
            startIcon={saving?<CircularProgress size={14} color="inherit"/>:null}>
            {editTarget?'Save Changes':'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE DIALOG ── */}
      <Dialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Vehicle?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>{deleteTarget?.name}</strong> ({deleteTarget?.license_plate}) will be removed from the fleet.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{px:3,pb:2}}>
          <Button onClick={()=>setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}
            startIcon={deleting?<CircularProgress size={14} color="inherit"/>:null}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
