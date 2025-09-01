import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';


export default function ApplicationsPage() {
const [apps, setApps] = useState([]);


useEffect(() => {
api.get('/apps').then(({ data }) => setApps(data));
}, []);


return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h1 className="text-2xl font-semibold">Applications</h1>
<button
className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
onClick={async () => {
const { data } = await api.post('/apps', { college: 'New College', status: 'drafting' });
setApps((a) => [data, ...a]);
}}
>Add</button>
</div>
<ul className="grid sm:grid-cols-2 gap-3">
{apps.map(a => (
<li key={a.id} className="border rounded-xl p-4 bg-white">
<div className="font-medium">{a.college || 'Untitled'}</div>
<div className="text-xs text-gray-500">{a.status}</div>
<Link to={`/applications/${a.id}`} className="inline-block mt-3 text-sm text-blue-600">Open</Link>
</li>
))}
</ul>
</div>
);
}