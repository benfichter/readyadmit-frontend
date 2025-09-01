import axios from 'axios';


// In code: always call relative "/api/...". Dev proxy sends to VITE_API_URL, prod hits same-origin if you reverse-proxy.
export const api = axios.create({ baseURL: '/api' });


export function authHeader() {
const token = localStorage.getItem('token');
return token ? { Authorization: `Bearer ${token}` } : {};
}


api.interceptors.request.use(cfg => {
const token = localStorage.getItem('token');
if (token) cfg.headers.Authorization = `Bearer ${token}`;
return cfg;
});


export async function getHealth() {
const { data } = await api.get('/health');
return data;
}