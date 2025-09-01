import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api';


export default function Dashboard() {
const [health, setHealth] = useState(null);
const [err, setErr] = useState('');


useEffect(() => {
getHealth().then(setHealth).catch(() => setErr('API unreachable'));
}, []);


return (
<div className="space-y-3">
<h1 className="text-2xl font-semibold">Welcome back 👋</h1>
<p className="text-sm text-gray-600">Quick check that the Railway backend is online:</p>
{health ? (
<pre className="p-3 rounded-lg bg-gray-900 text-gray-100 text-xs">{JSON.stringify(health, null, 2)}</pre>
) : (
<div className="text-sm text-gray-700">{err || 'Checking...'}</div>
)}
</div>
);
}