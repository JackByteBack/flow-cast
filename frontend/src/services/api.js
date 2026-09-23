const BASE = '/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!json.success) throw new Error(json.errors?.[0] || 'Request failed');
  return json.data;
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  calculateRoutes: (data) => request('/routes/calculate', { method: 'POST', body: JSON.stringify(data) }),
  routeHistory: () => request('/routes/history'),

  getTrafficPredictions: (lat, lng) => request(`/traffic/predictions?lat=${lat}&lng=${lng}`),
  getHotspots: () => request('/traffic/hotspots'),

  uploadPhoto: async (file, lat, lng, address) => {
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/barrierlens/upload?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.errors?.[0] || 'Upload failed');
    return json.data;
  },

  getLocations: (lat, lng) => request(`/barrierlens/locations?lat=${lat}&lng=${lng}`),
  getLocationDetail: (id) => request(`/barrierlens/locations/${id}`),

  getCongestionSummary: () => request('/dashboard/congestion-summary'),
  getAccessibilityGaps: () => request('/dashboard/accessibility-gaps'),
  getStats: () => request('/dashboard/stats'),
};
