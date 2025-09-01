import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';


export default function SignIn() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [err, setErr] = useState('');
const nav = useNavigate();
const { setUser } = useAuth();


async function submit(e) {
e.preventDefault();
setErr('');
try {
const { data } = await api.post('/auth/login', { email, password });
localStorage.setItem('token', data.token);
const me = await api.get('/auth/me');
setUser(me.data);
nav('/');
} catch (e) {
setErr(e?.response?.data?.error || 'Sign-in failed');
}
}


return (
<div className="min-h-screen grid place-items-center">
<form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
<h1 className="text-xl font-semibold mb-4">Sign in</h1>
{err && <div className="mb-3 text-sm text-red-600">{err}</div>}
<label className="block text-sm mb-1">Email</label>
<input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-3" />
<label className="block text-sm mb-1">Password</label>
<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4" />
<button className="w-full bg-blue-600 text-white py-2 rounded-lg">Continue</button>
</form>
</div>
);
}