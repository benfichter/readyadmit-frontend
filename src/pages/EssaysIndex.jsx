// src/pages/EssaysIndex.jsx
import AppShell from '../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';



export default function EssaysIndex(){
  // ---- top of EssaysIndex.jsx (imports stay the same) ----
const [main, setMain] = useState(null);   // { text, score, updatedAt }
const [apps, setApps] = useState([]);
const [err, setErr] = useState('');

useEffect(() => {
  (async () => {
    try {
      const [{ data: m }, { data: a }] = await Promise.all([
        api.get('/essays/draft'),  // <-- was /essays/main
        api.get('/apps'),          // includes supplementals[] now
      ]);
      setMain(m || { text: '', score: null });
      setApps(a || []);
      setErr('');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load essays');
    }
  })();
}, []);


  const words = (t) => String(t||'').trim().split(/\s+/).filter(Boolean).length;

  return (
    <AppShell>
      <div className="page-wrap space-y-6">
        <div>
          <div className="kicker-sm">Essays</div>
          <h1 className="page-title">All Essays</h1>
        </div>

        {/* Common App */}
        <section className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <div className="font-semibold">Common App Personal Essay</div>
              <span className="badge">Main</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/essaysworkspace" className="btn btn-primary">Open Editor</Link>
            </div>
          </div>
          <div className="card-body">
            <div className="text-sm subtle">
              Words: <b className="text-white">{words(main?.text)}</b> • Score: <b className="text-white">{Number.isFinite(main?.score) ? main.score : '—'}</b>
            </div>
            {main?.text ? (
              <div className="note mt-2 text-sm line-clamp-4">{main.text}</div>
            ) : (
              <div className="subtle text-sm mt-2">No draft yet.</div>
            )}
          </div>
        </section>

        {/* Per-application supplementals */}
        <section className="grid md:grid-cols-2 gap-4">
          {apps.map(app => (
            <article key={app.id} className="card">
              <div className="card-header">
                <div className="font-semibold">{app.college || 'Untitled'}</div>
                <Link to={`/applications/${app.id}`} className="btn btn-outline">Open Application</Link>
              </div>
              <div className="card-body space-y-3">
                {(app.supplementals||[]).length ? (
                  app.supplementals.map(s => (
                    <div key={s.id} className="kpanel">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/90">{s.title || 'Prompt'}</div>
                        <div className="flex items-center gap-2">
                          <span className="badge">{s.status}</span>
                          <Link to={`/essaysworkspace/s/${s.id}`} className="btn btn-outline">Edit</Link>
                        </div>
                      </div>
                      <div className="text-xs subtle mt-1">
                        Limit: {s.wordLimit ?? '—'} • Words: {String(s.response||'').trim().split(/\s+/).filter(Boolean).length}
                      </div>
                      {s.prompt && <div className="text-xs subtle mt-1 line-clamp-2">{s.prompt}</div>}
                    </div>
                  ))
                ) : (
                  <div className="subtle text-sm">No supplementals yet.</div>
                )}
              </div>
            </article>
          ))}
          {!apps.length && <div className="subtle text-sm">No applications yet.</div>}
        </section>
      </div>
    </AppShell>
  );
}
