import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';

export default function Settings() {
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setMe(data);
      } catch (e) {
        console.warn('Failed to load profile', e?.response?.data || e.message);
      }
    })();
  }, []);

  async function save() {
    if (!me) return;
    setSaving(true);
    try {
      const { data } = await api.patch('/users/me', { name: me.name, avatar: me.avatar });
      setMe(data);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="page-wrap space-y-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="kicker-sm">Account</div>
            <h1 className="page-title">Settings</h1>
          </div>
          <div className="text-xs subtle">
            {saving ? 'Saving…' : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : ' '} 
          </div>
        </div>

        {/* Profile */}
        <section className="card p-5">
          <div className="grid gap-4 md:grid-cols-[160px_1fr] items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {me?.avatar ? (
                  <img src={me.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-[rgba(255,255,255,.04)] text-3xl">{(me?.name||'U').trim().charAt(0).toUpperCase()}</div>
                )}
              </div>
              <button className="btn btn-outline" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>

            <div className="grid gap-3">
              <L label="Full name">
                <input className="input" value={me?.name || ''} onChange={(e) => setMe({ ...(me||{}), name: e.target.value })} placeholder="Your name" />
              </L>
              <L label="Email">
                <input className="input" value={me?.email || ''} readOnly />
              </L>
              <L label="Avatar URL">
                <input className="input" value={me?.avatar || ''} onChange={(e) => setMe({ ...(me||{}), avatar: e.target.value })} placeholder="https://…" />
              </L>
            </div>
          </div>
        </section>

        {/* Data & Export */}
        <section className="card p-5">
          <div className="font-semibold mb-3">Data & Export</div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => window.open('/api/export/zip', '_blank')} className="btn btn-outline">Download ZIP</button>
            <button onClick={() => window.open('/api/export/google', '_blank')} className="btn btn-secondary">Export to Google Docs</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function L({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-text">{label}</span>
      {children}
    </label>
  );
}
