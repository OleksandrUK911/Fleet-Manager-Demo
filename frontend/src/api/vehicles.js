// api/vehicles.js — Axios API client for Fleet Manager backend

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT Bearer token to every request when the user is logged in
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('fleet_auth');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch { /* ignore parse errors */ }
  return config;
});

// ─── Vehicle API calls ────────────────────────────────────────────────────────

/** GET /api/vehicles/ — list all active vehicles */
export async function fetchVehicles(status = null) {
  const params = status ? { status } : {};
  const response = await api.get('/api/vehicles/', { params });
  return response.data;
}

/** GET /api/vehicles/stats — fleet KPI counts */
export async function fetchFleetStats() {
  const response = await api.get('/api/vehicles/stats');
  return response.data;
}

/** GET /api/vehicles/{vehicleId} — single vehicle details */
export async function fetchVehicleDetail(vehicleId) {
  const response = await api.get(`/api/vehicles/${vehicleId}`);
  return response.data;
}

/**
 * GET /api/vehicles/{vehicleId}/history
 * @param {number} vehicleId
 * @param {number} hours - Rolling window in hours (default 24, used when fromDt is null)
 * @param {number} limit - Max records (default 500)
 * @param {string|null} fromDt - ISO datetime start (overrides hours when provided)
 * @param {string|null} toDt   - ISO datetime end (default: now)
 */
export async function fetchVehicleHistory(vehicleId, hours = 24, limit = 500, fromDt = null, toDt = null) {
  const params = { hours, limit };
  if (fromDt) params.from_dt = fromDt;
  if (toDt)   params.to_dt   = toDt;
  const response = await api.get(`/api/vehicles/${vehicleId}/history`, { params });
  return response.data;
}

/** GET /api/vehicles/stats/activity — hourly position counts for last 24 h */
export async function fetchFleetActivity() {
  const response = await api.get('/api/vehicles/stats/activity');
  return response.data;
}

/**
 * GET /api/vehicles/stats/top-active
 * Returns top N vehicles by GPS position count in the last `hours` hours.
 */
export async function fetchTopActive(limit = 5, hours = 24) {
  const response = await api.get('/api/vehicles/stats/top-active', { params: { limit, hours } });
  return response.data;
}

/**
 * POST /api/vehicles/ — create a new vehicle
 * @param {{ name, license_plate, model, status }} data
 */
export async function createVehicle(data) {
  const response = await api.post('/api/vehicles/', data);
  return response.data;
}

/**
 * PATCH /api/vehicles/{vehicleId} — partially update a vehicle
 * @param {number} vehicleId
 * @param {object} data - Fields to update
 */
export async function updateVehicle(vehicleId, data) {
  const response = await api.patch(`/api/vehicles/${vehicleId}`, data);
  return response.data;
}

/**
 * DELETE /api/vehicles/{vehicleId} — soft-delete a vehicle
 * @param {number} vehicleId
 */
export async function deleteVehicle(vehicleId) {
  await api.delete(`/api/vehicles/${vehicleId}`);
}

// ─── Geofence Zone API calls ────────────────────────────────────────────────────────────

/** GET /api/geofence — list all geofence zones */
export async function fetchGeofences() {
  const response = await api.get('/api/geofence');
  return response.data;
}

/** POST /api/geofence — create a new zone (admin) */
export async function createGeofence(data) {
  const response = await api.post('/api/geofence', data);
  return response.data;
}

/** PATCH /api/geofence/{id} — update a zone (admin) */
export async function updateGeofence(zoneId, data) {
  const response = await api.patch(`/api/geofence/${zoneId}`, data);
  return response.data;
}

/** DELETE /api/geofence/{id} — delete a zone (admin) */
export async function deleteGeofence(zoneId) {
  await api.delete(`/api/geofence/${zoneId}`);
}

// ─── Heatmap ───────────────────────────────────────────────────────────────────────────

/**
 * GET /api/vehicles/heatmap
 * Returns an array of [lat, lng, intensity] triples for the Leaflet.heat overlay.
 * @param {number} hours  - History window in hours (default 24)
 * @param {number} limit  - Max records (default 3000)
 */
export async function fetchHeatmapData(hours = 24, limit = 3000) {
  const response = await api.get('/api/vehicles/heatmap', { params: { hours, limit } });
  return response.data; // Array<[number, number, number]>
}

// ─── Fleet distance today ──────────────────────────────────────────────────────────────

/**
 * GET /api/vehicles/stats/distance
 * Returns total km driven today (UTC) + number of active vehicles with data.
 * @returns {{ total_km: number, vehicle_count: number }}
 */
export async function fetchFleetDistance() {
  const response = await api.get('/api/vehicles/stats/distance');
  return response.data;
}

// ─── Overspeed monitoring ──────────────────────────────────────────────────────────────

/**
 * GET /api/vehicles/stats/overspeed
 * Returns vehicles whose current_speed exceeds the given threshold.
 * @param {number} threshold - km/h threshold (default 80)
 * @returns {{ count: number, threshold: number, vehicles: object[] }}
 */
export async function fetchOverspeedVehicles(threshold = 80) {
  const response = await api.get('/api/vehicles/stats/overspeed', {
    params: { threshold },
  });
  return response.data;
}

export default api;

