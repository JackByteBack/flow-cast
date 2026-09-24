// API client: fetch wrapper for the FlowCast + BarrierLens backend (envelope-aware).

// On Vercel the /api prefix is rewritten (proxied) to the backend — see vercel.json.
// Set VITE_API_BASE=https://your-backend-domain/api/v1 to bypass the proxy instead.
const BASE = import.meta.env.VITE_API_BASE || '/api/v1';

// Safari throws a cryptic TypeError ("The string did not match the expected pattern.")
// when the response body isn't JSON — e.g. a gateway/proxy 404 page instead of the API.
// Translate that into a readable error so users see what actually went wrong.
async function parseJson(res, fallback) {
  try {
    return await res.json();
  } catch {
    throw new Error(
      `${fallback}: server returned a non-JSON response (HTTP ${res.status}). ` +
      'The FlowCast API is not reachable from this site.'
    );
  }
}

// FastAPI errors use { detail: string | ValidationError[] }; the app envelope uses { errors: [] }.
function messageFrom(json, res, fallback) {
  if (Array.isArray(json?.errors) && json.errors.length) return json.errors[0];
  if (typeof json?.detail === 'string') return json.detail;
  if (json?.detail) return 'Validation failed — check the form fields and try again.';
  if (!json?.success) return `${fallback} (HTTP ${res.status})`;
  return null;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await parseJson(res, 'Request failed');
  const error = messageFrom(json, res, 'Request failed');
  if (error) throw new Error(error);
  return json.data;
}

export const api = {
  calculateRoutes: (data) => request('/routes/calculate', { method: 'POST', body: JSON.stringify(data) }),
  routeHistory: () => request('/routes/history'),

  getTrafficPredictions: (lat, lng) => request(`/traffic/predictions?lat=${lat}&lng=${lng}`),
  getHotspots: () => request('/traffic/hotspots'),

  uploadPhoto: async (file, lat, lng, address) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/barrierlens/upload?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`, {
      method: 'POST',
      body: form,
    });
    const json = await parseJson(res, 'Upload failed');
    const error = messageFrom(json, res, 'Upload failed');
    if (error) throw new Error(error);
    return json.data;
  },

  getLocations: (lat, lng) => request(`/barrierlens/locations?lat=${lat}&lng=${lng}`),
  getLocationDetail: (id) => request(`/barrierlens/locations/${id}`),

  getCongestionSummary: () => request('/dashboard/congestion-summary'),
  getAccessibilityGaps: () => request('/dashboard/accessibility-gaps'),
  getStats: () => request('/dashboard/stats'),
};
