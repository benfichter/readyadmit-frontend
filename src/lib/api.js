import axios from 'axios';

const API = import.meta.env.VITE_API_URL;        // e.g. https://<railway-app>.up.railway.app
export const api = axios.create({ baseURL: `${API}/api` });


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