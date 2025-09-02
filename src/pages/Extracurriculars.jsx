import { useEffect, useState } from 'react'
import { api } from '../lib/api'


export default function Extracurriculars(){
const [items,setItems]=useState([])
const [form,setForm]=useState({ title:'', organization:'', impact:'', hoursPerWeek:'', weeksPerYear:'' })
const [ai,setAi]=useState('')


useEffect(()=>{ api.get('/extracurriculars').then(({data})=>setItems(data||[])) },[])


async function add(){
const payload = { ...form, hoursPerWeek: Number(form.hoursPerWeek)||null, weeksPerYear: Number(form.weeksPerYear)||null }
const { data } = await api.post('/extracurriculars', payload)
setItems(v=>[data,...v]); setForm({ title:'', organization:'', impact:'', hoursPerWeek:'', weeksPerYear:'' })
}
async function del(id){ await api.delete(`/extracurriculars/${id}`); setItems(v=>v.filter(x=>x.id!==id)) }
async function improve(){ if(!form.impact.trim() && !form.title) return; const {data}=await api.post('/quickai/strengthen-ec',{ title:form.title, organization:form.organization, description: form.impact }); setAi(data.output) }


return (
<div className="grid md:grid-cols-2 gap-6">
<div className="bg-white rounded-2xl border p-4">
<div className="text-2xl font-semibold">Extracurriculars</div>
<div className="mt-4 space-y-3">
<L label="Title"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border rounded-xl px-3 py-2" placeholder="e.g., Robotics Club Captain"/></L>
<L label="Organization"><input value={form.organization} onChange={e=>setForm({...form,organization:e.target.value})} className="w-full border rounded-xl px-3 py-2" placeholder="School / Nonprofit / Company"/></L>
<L label={<div className="flex items-center justify-between">Impact (how you'll frame it) <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-xl">SmartFrame™</span></div>}>
<textarea value={form.impact} onChange={e=>setForm({...form,impact:e.target.value})} className="w-full border rounded-xl p-2 h-28" placeholder="Quantify outcomes, show initiative, leadership, scope, and reflection..."/>
</L>
<div className="flex gap-2 text-sm">
<button onClick={improve} className="px-3 py-1.5 rounded-xl border">Preview & Improve</button>
<button onClick={()=> setForm({...form, impact: ai||form.impact})} className="px-3 py-1.5 rounded-xl border">Use AI Result</button>
</div>
{ai && <div className="text-sm bg-blue-50 border rounded-xl p-3">{ai}</div>}
<div className="grid grid-cols-2 gap-3">
<L label="Hours/week"><input value={form.hoursPerWeek} onChange={e=>setForm({...form,hoursPerWeek:e.target.value})} className="w-full border rounded-xl px-3 py-2"/></L>
<L label="Weeks/year"><input value={form.weeksPerYear} onChange={e=>setForm({...form,weeksPerYear:e.target.value})} className="w-full border rounded-xl px-3 py-2"/></L>
</div>
<button onClick={add} className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white">Add</button>
</div>
</div>


<div>
<div className="text-sm text-gray-500 mb-2">{items.length} total</div>
<div className="space-y-3">
{items.map(x => (
<div key={x.id} className="bg-white rounded-2xl border p-4">
<div className="font-medium">{x.title}</div>
<div className="text-xs text-gray-500">{x.organization}</div>
{x.impact && <div className="mt-2 text-sm">{x.impact}</div>}
{(x.hoursPerWeek||x.weeksPerYear) && <div className="mt-2 text-xs text-gray-600">{x.hoursPerWeek||'?' } hrs/week, {x.weeksPerYear||'?'} weeks/year</div>}
<div className="mt-3 flex gap-2 text-sm">
<button onClick={()=>del(x.id)} className="px-3 py-1.5 rounded-xl border text-red-600">Delete</button>
</div>
</div>
))}
{!items.length && <div className="text-sm text-gray-500">No activities yet.</div>}
</div>
</div>
</div>
)
}


function L({ label, children }){
return <label className="block text-sm">{label}<div className="mt-1"/>{children}</label>
}