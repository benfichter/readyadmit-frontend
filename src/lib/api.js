import axios from "axios";
const API = import.meta.env.VITE_API_URL;        // e.g. https://<railway-app>.up.railway.app
export const api = axios.create({ baseURL: `${API}/api` });