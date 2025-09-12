// src/pages/ApplicationWorkspace.jsx
import AppShell from '../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useParams, Link } from 'react-router-dom';

function normStatus(s=''){ return ['drafting','editing','submitted','accepted','rejected'].includes(s) ? s : 'drafting'; }

export default function ApplicationWorkspace(){
  const { appId } = useParams();
  const [app, setApp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newSup, setNewSup] = useState({ title:'', prompt:'', wordLimit:'', status:'drafting' });

  useEffect(()=>{
    api.get(`/apps/${appId}`).then(({data})=>setApp(data));
  },[appId]);

  async function save(patch){
    setSaving(true);
    const { data } = await api.patch(`/apps/${appId}`, patch);
    setApp(a => ({...a, ...data}));
    setSaving(false);
  }

  async function addSup(){
    if(!newSup.title && !newSup.prompt) return;
    const body = {
      title: newSup.title || 'Prompt',
      prompt: newSup.prompt || '',
      wordLimit: newSup.wordLimit ? Number(newSup.wordLimit) : null,
      status: newSup.status || 'drafting',
    };
    const { data } = await api.post(`/apps/${appId}/supplementals`, body);
    setApp(a => ({...a, supplementals:[...(a.supplementals||[]), data]}));
    setNewSup({ title:'', prompt:'', wordLimit:'', status:'drafting' });
  }

  async function updateSup(sid, patch){
    const { data } = await api.put(`/apps/${appId}/supplementals/${sid}`, patch);
    setApp(a => ({...a, supplementals: a.supplementals.map(s => s.id===sid ? data : s)}));
  }

  async function delSup(sid){
    await api.delete(`/apps/${appId}/supplementals/${sid}`);
    setApp(a => ({...a, supplementals: a.supplementals.filter(s=>s.id!==sid)}));
  }

  if(!app) return <AppShell><div className="page-wrap"><div className="card p-6 text-sm subtle">Loading…</div></div></AppShell>;

  return (
    <AppShell>
      <div className="page-wrap space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="kicker-sm">Application</div>
            <h1 className="page-title">{app.college || 'Untitled App'}</h1>
            <div className="subtle text-sm mt-1">{saving ? 'Saving…' : 'Saved'}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="input"
              value={app.status}
              onChange={e=>save({ status: normStatus(e.target.value) })}
            >
              {['drafting','editing','submitted','accepted','rejected'].map(s=>(
                <option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
            <input
              type="date"
              className="input"
              defaultValue={app.deadline || ''}
              onBlur={e=>save({ deadline: e.target.value })}
              title="Deadline"
            />
          </div>
        </div>

        {/* Notes */}
        <section className="card">
          <div className="card-header"><div className="kicker-sm">Notes</div></div>
          <div className="card-body">
            <textarea
              className="input"
              style={{minHeight:180}}
              defaultValue={app.notes || ''}
              onBlur={e=>save({ notes: e.target.value })}
              placeholder="App-specific notes…"
            />
          </div>
        </section>

        {/* Supplementals */}
        <section className="grid lg:grid-cols-2 gap-4">
          {/* Composer */}
          <div className="card card-soft">
            <div className="card-header">
              <div className="kicker-sm">Add Supplemental</div>
              <button className="btn btn-primary" onClick={addSup}>+ Add</button>
            </div>
            <div className="card-body grid gap-3">
              <input className="input" placeholder="Title (e.g., Community Essay)" value={newSup.title} onChange={e=>setNewSup({...newSup, title:e.target.value})}/>
              <textarea className="input" style={{minHeight:120}} placeholder="Prompt…" value={newSup.prompt} onChange={e=>setNewSup({...newSup, prompt:e.target.value})}/>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Word limit" value={newSup.wordLimit} onChange={e=>setNewSup({...newSup, wordLimit:e.target.value})}/>
                <select className="input" value={newSup.status} onChange={e=>setNewSup({...newSup, status:e.target.value})}>
                  {['drafting','editing','final'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {(app.supplementals||[]).map(s => (
              <article key={s.id} className="card">
                <div className="card-body space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-white">{s.title || 'Prompt'}</div>
                    <div className="flex items-center gap-2">
                      <Link to={`/essaysworkspace/s/${s.id}`} className="btn btn-outline">Open in Editor</Link>
                      <button className="btn btn-outline" onClick={()=>delSup(s.id)} style={{color:'#f8b4b4'}}>Delete</button>
                    </div>
                  </div>
                  <div className="text-xs subtle">Word limit: {s.wordLimit ?? '—'} • Status: {s.status}</div>
                  {s.prompt && <div className="note text-sm">{s.prompt}</div>}
                  <textarea
                    className="input"
                    style={{minHeight:140}}
                    defaultValue={s.response || ''}
                    onBlur={e=>updateSup(s.id, { response: e.target.value })}
                    placeholder="Draft response…"
                  />
                </div>
              </article>
            ))}
            {!app.supplementals?.length && <div className="subtle text-sm">No supplementals yet.</div>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
