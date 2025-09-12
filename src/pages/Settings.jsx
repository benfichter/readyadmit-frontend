import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Settings(){
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async()=>{
    const { data } = await api.get('/me');
    setMe(data);
  })(); }, []);

  const save = async () => {
    setSaving(true); await api.put('/me', me); setSaving(false);
  };

  return (
    <div className="page-wrap space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      {me && (
        <div className="card p-4 grid grid-cols-2 gap-3 text-sm">
          <input className="border rounded p-2 bg-transparent" value={me.name||''} onChange={e=>setMe({...me,name:e.target.value})} placeholder="Name"/>
          <input className="border rounded p-2 bg-transparent" value={me.email||''} readOnly />
          <button onClick={save} className="border rounded px-3 py-2">{saving? 'Saving…':'Save'}</button>
        </div>
      )}

      <div className="card p-4 text-sm">
        <div className="font-medium">Exports</div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={()=> window.open('/api/export/zip','_blank')} className="border rounded px-3 py-2">Download ZIP</button>
          <button onClick={()=> window.open('/api/export/google','_blank')} className="border rounded px-3 py-2">Export to Google Docs</button>
        </div>
      </div>
    </div>
  );
}
