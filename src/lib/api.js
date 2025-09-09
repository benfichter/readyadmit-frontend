// src/lib/api.js
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''); // e.g. http://localhost:3000

export const api = axios.create({
  baseURL: BASE || '', // API origin root
});

// Attach token + normalize URLs
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${t}` };

  let url = cfg.url ?? '';

  // Absolute URLs: leave as-is
  if (/^https?:\/\//i.test(url)) return cfg;

  // Normalize to start with slash
  if (url && url[0] !== '/') url = `/${url}`;

  // Guard: empty or '/' → treat as '/api/health' (or throw in dev)
  if (!url || url === '/') {
    if (import.meta.env.DEV) {
      console.warn('[api] Empty request path – coercing to /api/health');
    }
    url = '/api/health'; // harmless ping instead of hitting '/'
  }

  // Auto-prefix: leave /auth/* and /api/* alone; prefix everything else with /api
  if (!url.startsWith('/auth') && !url.startsWith('/api')) {
    url = `/api${url}`;
  }

  cfg.url = url;
  return cfg;
});
