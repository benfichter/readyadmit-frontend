import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';


const Ctx = createContext(null);


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
const token = localStorage.getItem('token');
if (!token) return setLoading(false);
api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => {
localStorage.removeItem('token');
}).finally(() => setLoading(false));
}, []);


const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);
return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}


export function useAuth() {
return useContext(Ctx);
}