import axios from 'axios'


const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || ''
export const api = axios.create({ baseURL: `${base}/api` })


api.interceptors.request.use(cfg => {
const t = localStorage.getItem('token')
if (t) cfg.headers.Authorization = `Bearer ${t}`
return cfg
})


export const auth = {
async login(email, password) {
const { data } = await api.post('/auth/login', { email, password })
return data
},
async me() {
const { data } = await api.get('/auth/me')
return data
}
}