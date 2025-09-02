import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'


const cal = d => {
const start = new Date(d.getFullYear(), d.getMonth(), 1)
const end = new Date(d.getFullYear(), d.getMonth()+1, 0)
const w=[]; let row=new Array(start.getDay()).fill(null)
for(let i=1;i<=end.getDate();i++){ row.push(new Date(d.getFullYear(),d.getMonth(),i)); if(row.length===7){ w.push(row); row=[] } }
if(row.length){ while(row.length<7) row.push(null); w.push(row) }
return w
}


export default function ApplicationsPage(){
const [apps,setApps]=useState([])
const [when,setWhen]=useState(()=>new Date())
useEffect(()=>{ api.get('/apps').then(({data})=>setApps(data||[])) },[])


const weeks = useMemo(()=>cal(when),[when])


async function add(){ const {data}=await api.post('/apps',{ college:'New College', status:'drafting' }); setApps(x=>[data,...x]) }


return (
<div className="grid lg:grid-cols-[1fr_320px] gap-6">
<div className="bg-white rounded-2xl border p-4">
<div className="flex items-center justify-between">
<div className="text-xl font-semibold">{when.toLocaleString('default',{ month:'long' })} {when.getFullYear()}</div>
<div className="flex items-center gap-2 text-sm">
<button onClick={()=>setWhen(new Date(when.getFullYear(), when.getMonth()-1, 1))} className="px-3 py-1.5 rounded-xl border">← Prev</button>
<button onClick={()=>setWhen(new Date())} className="px-3 py-1.5 rounded-xl border">Today</button>
<button onClick={()=>setWhen(new Date(when.getFullYear(), when.getMonth()+1, 1))} className="px-3 py-1.5 rounded-xl border">Next →</button>
</div>
</div>
<div className="grid grid-cols-7 gap-2 mt-3">
{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(<div key={d} className="text-xs text-gray-500 text-center">{d}</div>))}
{weeks.flat().map((d,i)=> (
<div key={i} className="h-24 rounded-xl border bg-gray-50 p-2 text-xs">
{d && <div className="font-medium">{d.getDate()}</div>}
</div>
))}
</div>
</div>


<div>
<button onClick={add} className="mb-3 px-4 py-2 rounded-xl bg-blue-600 text-white shadow">+ Add Application</button>
<div className="space-y-3">
{apps.map(a => (
<div key={a.id} className="bg-white rounded-2xl border p-4">
<div className="font-medium">{a.college||'Untitled'}</div>
<div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
<span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">{a.status}</span>
{a.deadline && <span>• {new Date(a.deadline).toDateString()}</span>}
</div>
<div className="mt-3 flex gap-2 text-sm">
<a href={`/applications/${a.id}`} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white">Edit Supplementals</a>
<button className="px-3 py-1.5 rounded-xl border text-red-600">Delete</button>
</div>
</div>
))}
{!apps.length && <div className="text-sm text-gray-500">No applications yet.</div>}
</div>
</div>
</div>
)
}