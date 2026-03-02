// components/VehicleMap.js — Leaflet map with rich visual route display
//
// Visual features:
//   - Regular vehicles  : teardrop pin with emoji (🚛🚐🚗) + name label
//   - Selected vehicle  : large circle + emoji + double-pulse CSS ring
//   - Route path        : glowing orange underlay + solid red dashed overlay
//   - Direction arrows  : rotated ▲ every ~8 history points showing travel direction
//   - Route start       : green animated "S" badge at the first history point
//   - "Fit to fleet"    : floating button fits all markers in view

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.heat'; // extends L with L.heatLayer (side-effect import)
import { Typography, Box, Chip, CircularProgress, IconButton, Tooltip, Divider, Slider } from '@mui/material';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ClearIcon from '@mui/icons-material/Clear';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { fetchHeatmapData } from '../api/vehicles';

const DEFAULT_CENTER = [51.5074, -0.1278];
const DEFAULT_ZOOM   = 12;

// ─── Demo geofence zones (London landmarks) ────────────────────────────────────
const DEMO_ZONES = [
  { id: 1, name: 'Depot — Canary Wharf',  center: [51.5055, -0.0235], radius: 600,  color: '#1565c0', fill: '#42a5f580' },
  { id: 2, name: 'Service Centre',        center: [51.524,  -0.088],  radius: 400,  color: '#e65100', fill: '#ef6c0050' },
  { id: 3, name: 'City Drop-off Zone',    center: [51.516,  -0.119],  radius: 350,  color: '#2e7d32', fill: '#66bb6a50' },
];

// ─── Emoji by vehicle name prefix ─────────────────────────────────────────────
function vehicleEmoji(name = '') {
  const n = name.toLowerCase();
  if (n.startsWith('truck')) return '🚛';
  if (n.startsWith('van'))   return '🚐';
  return '🚗';
}

// ─── Regular (idle) vehicle marker ───────────────────────────────────────────
function createIdleIcon(label, emoji, speedKmh, pulsing = false) {
  const speedLabel = (speedKmh != null && !isNaN(speedKmh))
    ? `${Number(speedKmh).toFixed(0)} km/h`
    : '';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position:relative;
        display:flex; flex-direction:column; align-items:center;
      ">
        ${pulsing ? '<div class="fm-update-ring"></div>' : ''}
        <div style="
          background:#43a047;
          border:2px solid #1b5e20;
          color:white;
          width:36px; height:36px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
        ">
          <span style="transform:rotate(45deg); font-size:16px; line-height:1;">${emoji}</span>
        </div>
        ${speedLabel ? `<div style="
          background:rgba(0,0,0,0.62);
          color:#fff;
          font-size:9px; font-weight:700;
          padding:1px 4px;
          border-radius:4px;
          margin-top:2px;
          white-space:nowrap;
          letter-spacing:0.3px;
        ">${speedLabel}</div>` : ''}
      </div>
    `,
    iconSize:    [36, speedLabel ? 52 : 36],
    iconAnchor:  [18, speedLabel ? 52 : 36],
    popupAnchor: [0, speedLabel ? -54 : -38],
  });
}

// ─── Selected vehicle marker — large circle + double pulse ring ───────────────
function createSelectedIcon(emoji, status = 'active') {
  const cfg = {
    active:      { bg: '#1565c0', shadow: 'rgba(21,101,192,0.6)',  ring: 'rgba(21,101,192,0.3)'  },
    inactive:    { bg: '#546e7a', shadow: 'rgba(84,110,122,0.55)', ring: 'rgba(84,110,122,0.25)' },
    maintenance: { bg: '#e65100', shadow: 'rgba(230,81,0,0.6)',    ring: 'rgba(230,81,0,0.28)'   },
  };
  const c   = cfg[status] || cfg.active;
  const badge = status === 'maintenance' ? '🔧' : status === 'inactive' ? '💤' : '';
  return L.divIcon({
    className: '',
    html: `
      <div class="fm-pulse-wrapper">
        <div class="fm-pulse-ring"   style="border-color:${c.ring};"></div>
        <div class="fm-pulse-ring-2" style="border-color:${c.ring};"></div>
        <div style="
          background:${c.bg};
          border:3px solid #ffffff;
          color:white;
          width:42px; height:42px;
          border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; line-height:1;
          box-shadow:0 4px 14px ${c.shadow};
          position:relative; z-index:2;
        ">${emoji}</div>
        ${badge ? `<div style="
          position:absolute; top:-5px; right:-5px;
          font-size:13px; line-height:1; z-index:3;
          filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        ">${badge}</div>` : ''}
      </div>
    `,
    iconSize:    [42, 42],
    iconAnchor:  [21, 21],
    popupAnchor: [0, -26],
  });
}

// ─── Inactive vehicle marker — grey, semi-transparent ────────────────────────
function createInactiveIcon(emoji) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        display:flex; flex-direction:column; align-items:center;
        opacity:0.62;
      ">
        <div style="
          background:#546e7a;
          border:2px solid #37474f;
          color:white;
          width:32px; height:32px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.22);
        ">
          <span style="transform:rotate(45deg); font-size:14px; line-height:1;">${emoji}</span>
        </div>
        <div style="
          background:rgba(55,71,79,0.72);
          color:#b0bec5;
          font-size:9px; font-weight:700;
          padding:1px 5px; border-radius:4px;
          margin-top:2px; white-space:nowrap; letter-spacing:0.4px;
        ">INACTIVE</div>
      </div>
    `,
    iconSize:    [32, 48],
    iconAnchor:  [16, 48],
    popupAnchor: [0, -50],
  });
}

// ─── Maintenance vehicle marker — orange with 🔧 badge ────────────────────────
function createMaintenanceIcon(emoji) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <div style="
          background:#e65100;
          border:2px solid #bf360c;
          color:white;
          width:36px; height:36px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(230,81,0,0.5);
        ">
          <span style="transform:rotate(45deg); font-size:16px; line-height:1;">${emoji}</span>
        </div>
        <div style="
          position:absolute; top:-5px; right:-7px;
          font-size:13px; line-height:1;
          filter:drop-shadow(0 1px 2px rgba(0,0,0,0.55));
        ">🔧</div>
        <div style="
          background:rgba(191,54,12,0.85);
          color:#fff;
          font-size:9px; font-weight:700;
          padding:1px 5px; border-radius:4px;
          margin-top:2px; white-space:nowrap; letter-spacing:0.4px;
        ">SERVICE</div>
      </div>
    `,
    iconSize:    [36, 52],
    iconAnchor:  [14, 52],
    popupAnchor: [4, -54],
  });
}

// ─── Route start marker ───────────────────────────────────────────────────────
function createStartIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div class="fm-start-marker" style="
        background:#00c853;
        border:2px solid #00701a;
        color:white;
        width:26px; height:26px;
        border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-size:13px; font-weight:800;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
      ">S</div>
    `,
    iconSize:    [26, 26],
    iconAnchor:  [13, 13],
    popupAnchor: [0, -18],
  });
}

// ─── Direction arrow marker ───────────────────────────────────────────────────
function createArrowIcon(angleDeg) {
  // Cap at 2 decimal places; CSS rotate takes degrees
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:0; height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:11px solid #e53935;
        opacity:0.85;
        transform:rotate(${angleDeg.toFixed(1)}deg);
        filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4));
      "></div>
    `,
    iconSize:   [10, 11],
    iconAnchor: [5, 5],
  });
}

// ─── Maths: compass bearing p1→p2 (degrees 0–360) ────────────────────────────
function bearing(p1, p2) {
  const toR  = (d) => (d * Math.PI) / 180;
  const lat1 = toR(p1[0]), lat2 = toR(p2[0]);
  const dLng = toR(p2[1] - p1[1]);
  const y    = Math.sin(dLng) * Math.cos(lat2);
  const x    = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Sample one arrow every STEP points; skip first and last few points
const ARROW_STEP = 8;
function buildArrows(positions) {
  const arrows = [];
  const end = positions.length - 2;
  for (let i = Math.floor(ARROW_STEP / 2); i < end; i += ARROW_STEP) {
    arrows.push({ pos: positions[i], angle: bearing(positions[i], positions[i + 1]) });
  }
  return arrows;
}

// ─── Speed heatmap color (km/h) ───────────────────────────────────────────────
function speedColor(kmh) {
  if (kmh === null || kmh === undefined) return '#e53935';
  if (kmh < 15)  return '#43a047'; // green  — slow / idle
  if (kmh < 35)  return '#ffb300'; // amber  — moderate
  if (kmh < 60)  return '#fb8c00'; // orange — fast
  return '#e53935';                // red    — very fast
}

// Build array of {positions: [[lat,lng],[lat,lng]], color} per segment
function buildSpeedSegments(hist) {
  const segs = [];
  const filtered = hist.filter(p => p.latitude && p.longitude);
  for (let i = 0; i < filtered.length - 1; i++) {
    const a   = filtered[i];
    const b   = filtered[i + 1];
    const avg = ((a.speed ?? 0) + (b.speed ?? 0)) / 2;
    segs.push({
      positions: [[a.latitude, a.longitude], [b.latitude, b.longitude]],
      color:     speedColor(avg),
    });
  }
  return segs;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatTime(iso) {
  return iso ? new Date(iso).toLocaleTimeString() : '—';
}

// ─── Sub-component: auto-pan to selected vehicle ──────────────────────────────
function MapController({ selectedVehicle }) {
  const map      = useMap();
  const prevRef  = useRef(null);
  useEffect(() => {
    if (
      selectedVehicle?.current_lat &&
      selectedVehicle?.current_lng &&
      selectedVehicle.id !== prevRef.current
    ) {
      map.flyTo([selectedVehicle.current_lat, selectedVehicle.current_lng], 14, { duration: 1.2 });
      prevRef.current = selectedVehicle.id;
    }
  }, [selectedVehicle, map]);
  return null;
}

// ─── Sub-component: fit-all-vehicles ref ─────────────────────────────────────
function FitBoundsController({ vehicles, fitRef }) {
  const map = useMap();
  fitRef.current = () => {
    const pts = vehicles.filter(v => v.current_lat && v.current_lng).map(v => [v.current_lat, v.current_lng]);
    if (pts.length) map.fitBounds(pts, { padding: [50, 50] });
  };
  return null;
}

// ─── Replay position marker (blue pulsing dot) ────────────────────────────────
function createReplayIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:18px; height:18px;
        background:#1565c0;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 5px rgba(21,101,192,0.35), 0 2px 8px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize:    [18, 18],
    iconAnchor:  [9, 9],
    popupAnchor: [0, -12],
  });
}

// ─── Heatmap layer (Leaflet.heat plugin wrapper) ─────────────────────────────
// Renders an intensity heat overlay. data = [[lat, lng, intensity 0-1], ...]
function HeatLayer({ data, visible }) {
  const map      = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!visible || !data.length) {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
      return;
    }
    if (layerRef.current) map.removeLayer(layerRef.current);
    // L.heatLayer is patched in by the `import 'leaflet.heat'` side-effect
    layerRef.current = L.heatLayer(data, {
      radius:   22,
      blur:     18,
      maxZoom:  17,
      max:      1.0,
      gradient: { 0.0: '#00c853', 0.35: '#ffb300', 0.7: '#ff6f00', 1.0: '#b71c1c' },
    }).addTo(map);
    return () => {
      if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    };
  }, [data, visible, map]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VehicleMap({ vehicles, selectedVehicle, history, zones = [], onSelectVehicle, onClearRoute, onOpenDetails }) {
  // Transform API zones ({latitude, longitude, radius_m, color}) into map format.
  // Fall back to DEMO_ZONES if API hasn't loaded yet.
  const mapZones = (zones.length > 0 ? zones : DEMO_ZONES).map((z) =>
    z.center
      ? z                                           // already in local DEMO_ZONES format
      : {
          id:     z.id,
          name:   z.name,
          center: [z.latitude, z.longitude],
          radius: z.radius_m,
          color:  z.color,
          fill:   z.color + '80',                   // add 50% alpha for fill
        }
  );

  const fitRef        = useRef(() => {});
  const containerRef  = useRef(null);
  const [isFullscreen, setIsFullscreen]   = useState(false);
  const [contextMenu, setContextMenu]     = useState(null); // { x, y, vehicle }
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const [heatmapEnabled,  setHeatmapEnabled]  = useState(false);
  const [heatmapData,     setHeatmapData]     = useState([]);
  const [heatmapLoading,  setHeatmapLoading]  = useState(false);

  // ── Position-update pulse: track which vehicle IDs just received new data ──
  const [pulsedIds,  setPulsedIds]  = useState(() => new Set());
  const lastSeenRef = useRef({});  // { [vehicleId]: last_seen string }

  useEffect(() => {
    const changed = [];
    vehicles.forEach((v) => {
      const prev = lastSeenRef.current[v.id];
      if (prev !== undefined && prev !== v.last_seen) changed.push(v.id);
      lastSeenRef.current[v.id] = v.last_seen;
    });
    if (!changed.length) return;
    setPulsedIds((prev) => {
      const next = new Set(prev);
      changed.forEach((id) => next.add(id));
      return next;
    });
    const t = setTimeout(() => {
      setPulsedIds((prev) => {
        const next = new Set(prev);
        changed.forEach((id) => next.delete(id));
        return next;
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [vehicles]);
  // ── Heatmap: fetch fleet-wide positions when overlay is toggled on ─────────
  useEffect(() => {
    if (!heatmapEnabled) return;
    if (heatmapData.length > 0) return; // already loaded — no re-fetch on hide/show
    setHeatmapLoading(true);
    fetchHeatmapData(24, 3000)
      .then((pts) => setHeatmapData(pts))
      .catch((err) => console.error('[HeatLayer] fetch error:', err))
      .finally(() => setHeatmapLoading(false));
  }, [heatmapEnabled]); // eslint-disable-line react-hooks/exhaustive-deps
  // ── Fullscreen API ────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Close context menu on outside click ──────────────────────────────────
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close, { once: true });
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  // History oldest→newest: pathPositions[0] = start, last = most recent
  const pathPositions = history
    .filter(p => p.latitude && p.longitude)
    .map(p => [p.latitude, p.longitude]);

  const hasPath      = pathPositions.length > 1;
  const arrows       = hasPath ? buildArrows(pathPositions) : [];
  const startPos     = hasPath ? pathPositions[0] : null;
  const speedSegments = hasPath ? buildSpeedSegments(history) : [];

  // ── Route replay state ─────────────────────────────────────────────────────
  const [replayIdx,   setReplayIdx]   = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);

  // Reset when selected vehicle / history changes
  useEffect(() => {
    setIsReplaying(false);
    setReplayIdx(0);
  }, [history]);

  // Animation ticker
  useEffect(() => {
    if (!isReplaying) return;
    const stepMs = Math.round(200 / replaySpeed);
    const len = pathPositions.length;
    const id = setInterval(() => {
      setReplayIdx(prev => {
        if (prev >= len - 1) { setIsReplaying(false); return len - 1; }
        return prev + 1;
      });
    }, stepMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplaying, replaySpeed]);

  const safeIdx    = Math.min(replayIdx, Math.max(0, pathPositions.length - 1));
  const replayPos  = pathPositions[safeIdx] || null;
  const visitedPath = pathPositions.slice(0, safeIdx + 1);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={5}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CartoDB Dark">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CartoDB Light">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapController selectedVehicle={selectedVehicle} />
        <FitBoundsController vehicles={vehicles} fitRef={fitRef} />

        {/* ── Geofence zones ── */}
        {mapZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{ color: zone.color, fillColor: zone.fill, fillOpacity: 0.18, weight: 1.5, dashArray: '6 4' }}
          >
            <Popup>
              <Typography variant="caption" fontWeight={700}>{zone.name}</Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Radius: {zone.radius} m
              </Typography>
            </Popup>
          </Circle>
        ))}

        {/* ── Heatmap overlay ── */}
        <HeatLayer data={heatmapData} visible={heatmapEnabled} />

        {/* ── Route: glowing underlay ── */}
        {hasPath && (
          <Polyline
            positions={pathPositions}
            pathOptions={{ color: '#90a4ae', weight: 5, opacity: 0.25 }}
          />
        )}

        {/* ── Route: speed-heatmap segments ── */}
        {speedSegments.map((seg, i) => (
          <Polyline
            key={`seg-${i}`}
            positions={seg.positions}
            pathOptions={{ color: seg.color, weight: 3, opacity: 0.9 }}
          />
        ))}

        {/* ── Direction arrows ── */}
        {arrows.map((a, i) => (
          <Marker
            key={`arrow-${i}`}
            position={a.pos}
            icon={createArrowIcon(a.angle)}
            interactive={false}
            zIndexOffset={-100}
          />
        ))}

        {/* ── Replay: visited portion of path ── */}
        {hasPath && replayPos && visitedPath.length > 1 && (
          <Polyline
            positions={visitedPath}
            pathOptions={{ color: '#1565c0', weight: 6, opacity: 0.75, dashArray: '10 5' }}
          />
        )}

        {/* ── Replay: animated position marker ── */}
        {replayPos && (
          <Marker position={replayPos} icon={createReplayIcon()} zIndexOffset={600} interactive={false} />
        )}

        {/* ── Route start badge ── */}
        {startPos && (
          <Marker position={startPos} icon={createStartIcon()} zIndexOffset={200}>
            <Popup>
              <Typography variant="caption" fontWeight={700}>Route start</Typography>
              {history[0]?.speed != null && (
                <Typography variant="caption" display="block" color="text.secondary">
                  ⚡ {Number(history[0].speed).toFixed(1)} km/h
                </Typography>
              )}
              <Typography variant="caption" display="block" color="text.secondary">
                🕐 {formatTime(history[0]?.timestamp)}
              </Typography>
            </Popup>
          </Marker>
        )}

        {/* ── Vehicle markers (optionally clustered) ── */}
        <MarkerClusterGroup
          maxClusterRadius={clusterEnabled ? 80 : 0}
          chunkedLoading
          showCoverageOnHover={false}
        >
        {vehicles.map((vehicle) => {
          if (!vehicle.current_lat || !vehicle.current_lng) return null;
          const isSelected = selectedVehicle?.id === vehicle.id;
          const emoji = vehicleEmoji(vehicle.name);
          const status = vehicle.status || 'active';

          const isPulsing = !isSelected && pulsedIds.has(vehicle.id);
          let icon;
          if (isSelected) {
            icon = createSelectedIcon(emoji, status);
          } else if (status === 'inactive') {
            icon = createInactiveIcon(emoji);
          } else if (status === 'maintenance') {
            icon = createMaintenanceIcon(emoji);
          } else {
            icon = createIdleIcon(vehicle.name, emoji, vehicle.current_speed, isPulsing);
          }

          return (
            <Marker
              key={`${vehicle.id}-${isPulsing}`}
              position={[vehicle.current_lat, vehicle.current_lng]}
              icon={icon}
              zIndexOffset={isSelected ? 500 : status === 'active' ? 0 : -50}
              eventHandlers={{
                click: () => onSelectVehicle(vehicle.id),
                contextmenu: (e) => {
                  L.DomEvent.stopPropagation(e);
                  // Get position relative to the container element
                  const rect = containerRef.current?.getBoundingClientRect();
                  const ex = e.originalEvent.clientX - (rect?.left ?? 0);
                  const ey = e.originalEvent.clientY - (rect?.top ?? 0);
                  setContextMenu({ x: ex, y: ey, vehicle });
                },
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 160 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>
                    {status === 'maintenance' ? '🔧' : status === 'inactive' ? '💤' : emoji} {vehicle.name}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {vehicle.license_plate} · {vehicle.model}
                  </Typography>
                  <Box sx={{ mt: 0.5, mb: 0.5 }}>
                    <Chip
                      label={vehicle.status}
                      size="small"
                      color={status === 'active' ? 'success' : status === 'maintenance' ? 'warning' : 'default'}
                      sx={{ height: 16, fontSize: 10 }}
                    />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    📍 {Number(vehicle.current_lat).toFixed(5)}, {Number(vehicle.current_lng).toFixed(5)}<br />
                    {isSelected && history.length > 0 && history[history.length - 1]?.speed != null && status === 'active' && (
                      <>⚡ {Number(history[history.length - 1].speed).toFixed(1)} km/h<br /></>
                    )}
                    {status === 'inactive' && <>💤 Off shift — parked<br /></>}
                    {status === 'maintenance' && <>🔧 Under repair / in service<br /></>}
                    🕐 Last seen: {formatTime(vehicle.last_seen)}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* ── Floating button group (top-right) ── */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Tooltip title="Fit all vehicles in view" placement="left">
          <IconButton size="small" onClick={() => fitRef.current()} sx={{ bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'action.hover' } }}>
            <FitScreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={clusterEnabled ? 'Disable marker clustering' : 'Enable marker clustering'} placement="left">
          <IconButton
            size="small"
            onClick={() => setClusterEnabled(v => !v)}
            sx={{ bgcolor: clusterEnabled ? 'primary.main' : 'background.paper', color: clusterEnabled ? 'primary.contrastText' : 'inherit', boxShadow: 3, '&:hover': { bgcolor: clusterEnabled ? 'primary.dark' : 'action.hover' } }}
          >
            <BubbleChartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={heatmapEnabled ? 'Hide traffic heatmap' : 'Show fleet heatmap (24 h)'} placement="left">
          <IconButton
            size="small"
            onClick={() => setHeatmapEnabled(v => !v)}
            sx={{ bgcolor: heatmapEnabled ? 'warning.main' : 'background.paper', color: heatmapEnabled ? 'warning.contrastText' : 'inherit', boxShadow: 3, '&:hover': { bgcolor: heatmapEnabled ? 'warning.dark' : 'action.hover' } }}
          >
            {heatmapLoading
              ? <CircularProgress size={16} color="inherit" />
              : <WhatshotIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen map'} placement="left">
          <IconButton size="small" onClick={toggleFullscreen} sx={{ bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'action.hover' } }}>
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        {hasPath && (
          <Tooltip title={isReplaying ? 'Pause replay' : 'Replay route'} placement="left">
            <IconButton
              size="small"
              onClick={() => {
                if (!isReplaying && replayIdx >= pathPositions.length - 1) setReplayIdx(0);
                setIsReplaying(v => !v);
              }}
              sx={{ bgcolor: isReplaying ? 'primary.main' : 'background.paper', color: isReplaying ? 'primary.contrastText' : 'inherit', boxShadow: 3, '&:hover': { bgcolor: isReplaying ? 'primary.dark' : 'action.hover' } }}
            >
              {isReplaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Right-click context menu ── */}
      {contextMenu && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 2000,
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            boxShadow: 6,
            minWidth: 180,
            py: 0.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Header */}
          <Box sx={{ px: 1.5, py: 0.4, borderBottom: '1px solid', borderColor: 'divider', mb: 0.3 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {contextMenu.vehicle.name}
            </Typography>
          </Box>

          {/* Centre map */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => { onSelectVehicle(contextMenu.vehicle.id); setContextMenu(null); }}
          >
            <MyLocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontSize: 13 }}>Centre on map</Typography>
          </Box>

          {/* Open details */}
          {onOpenDetails && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => { onOpenDetails(contextMenu.vehicle.id); setContextMenu(null); }}
            >
              <OpenInNewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: 13 }}>Open details</Typography>
            </Box>
          )}

          <Divider sx={{ my: 0.3 }} />

          {/* Clear route */}
          {onClearRoute && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => { onClearRoute(); setContextMenu(null); }}
            >
              <ClearIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography variant="body2" sx={{ fontSize: 13, color: 'error.main' }}>Clear route</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Route replay control bar ── */}
      {hasPath && (
        <Box sx={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 2, boxShadow: 6,
          px: 1.5, py: 0.75,
          display: 'flex', alignItems: 'center', gap: 0.75,
          maxWidth: 'calc(100% - 320px)', minWidth: 240,
          pointerEvents: 'all',
        }}>
          {/* Play / Pause */}
          <Tooltip title={isReplaying ? 'Pause' : replayIdx > 0 && replayIdx < pathPositions.length - 1 ? 'Resume' : 'Play replay'}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                if (!isReplaying && replayIdx >= pathPositions.length - 1) setReplayIdx(0);
                setIsReplaying(v => !v);
              }}
            >
              {isReplaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Stop / reset */}
          <Tooltip title="Stop & reset">
            <span>
              <IconButton size="small" onClick={() => { setIsReplaying(false); setReplayIdx(0); }} disabled={replayIdx === 0 && !isReplaying}>
                <StopIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Progress slider */}
          <Slider
            size="small"
            value={safeIdx}
            min={0}
            max={Math.max(0, pathPositions.length - 1)}
            onChange={(_, val) => { setIsReplaying(false); setReplayIdx(val); }}
            sx={{ flex: 1, mx: 0.5, color: 'primary.main' }}
          />

          {/* Position label */}
          <Typography variant="caption" sx={{ fontSize: 10, minWidth: 40, color: 'text.secondary', textAlign: 'right', whiteSpace: 'nowrap' }}>
            {safeIdx + 1}/{pathPositions.length}
          </Typography>

          {/* Speed buttons */}
          {[1, 2, 5].map(s => (
            <Box
              key={s}
              onClick={() => setReplaySpeed(s)}
              sx={{
                px: 0.6, py: 0.2,
                borderRadius: 0.75,
                fontSize: 10, fontWeight: 700,
                cursor: 'pointer',
                bgcolor: replaySpeed === s ? 'primary.main' : 'transparent',
                color: replaySpeed === s ? 'primary.contrastText' : 'text.secondary',
                border: '1px solid',
                borderColor: replaySpeed === s ? 'primary.main' : 'divider',
                lineHeight: 1.6,
                userSelect: 'none',
                '&:hover': { bgcolor: replaySpeed === s ? 'primary.dark' : 'action.hover' },
              }}
            >
              {s}×
            </Box>
          ))}
        </Box>
      )}

      {/* ── Route legend (shown when a path is displayed) ── */}
      {hasPath && (
        <Box sx={{
          position: 'absolute', bottom: 28, right: 12, zIndex: 1000,
          bgcolor: 'background.paper', borderRadius: 2, p: 1,
          boxShadow: 3, fontSize: 11, lineHeight: 1.8,
          minWidth: 142,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#00c853', borderRadius: '50%', border: '1.5px solid #00701a', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>S</Box>
            <span>Journey start</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
            <Box sx={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid #e53935', opacity: 0.85 }} />
            <span>Direction</span>
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5, pt: 0.5, opacity: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#43a047', borderRadius: 1 }} />
              <span>&lt;15 km/h</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#ffb300', borderRadius: 1 }} />
              <span>15–35 km/h</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#fb8c00', borderRadius: 1 }} />
              <span>35–60 km/h</span>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#e53935', borderRadius: 1 }} />
              <span>&gt;60 km/h</span>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Status legend (always visible) ── */}
      <Box sx={{
        position: 'absolute', bottom: 28, left: 12, zIndex: 1000,
        bgcolor: 'background.paper', borderRadius: 2, p: 1,
        boxShadow: 3, fontSize: 11, lineHeight: 1.9,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.1 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#43a047', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', flexShrink: 0 }} />
          <span>Active</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.1, opacity: 0.65 }}>
          <Box sx={{ width: 11, height: 11, bgcolor: '#546e7a', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', flexShrink: 0 }} />
          <span>Inactive</span>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#e65100', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', flexShrink: 0 }} />
          <span>Maintenance 🔧</span>
        </Box>
      </Box>
    </Box>
  );
}
