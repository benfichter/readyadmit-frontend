import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import MenuSelect from '../components/ui/MenuSelect.jsx';

const LEVELS = ['School', 'Regional', 'State', 'National', 'International'];
const KIND_OPTIONS = ['Award','Scholarship','Competition','Honor','Volunteering','Certification','Research','Service Project'];
const LEVEL_ITEMS = LEVELS.map(l => ({ value: l, label: l }));
const KIND_ITEMS = KIND_OPTIONS.map(k => ({ value: k, label: k }));

export default function Honors() {
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    organization: '',
    kind: 'Award',
    level: 'School',
    gradeYear: 11,
    notes: '',
    // removed location fields per request
  });

  // Discovery controls (geolocate + simple inputs)
  const [userLoc, setUserLoc] = useState(null); // { lat, lng }
  const [locError, setLocError] = useState('');
  const [interests, setInterests] = useState('');
  const [radiusMi, setRadiusMi] = useState(25); // miles
  const [results, setResults] = useState([]);
  const [genBusy, setGenBusy] = useState(false);

  useEffect(() => {
    api.get('/honors').then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => [x.title, x.organization, x.level, x.notes]
      .some((t) => String(t || '').toLowerCase().includes(q)));
  }, [items, search]);

  async function add() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        organization: form.organization?.trim() || null,
        kind: form.kind || null,
        level: form.level || null,
        gradeYear: form.gradeYear == null ? null : Number(form.gradeYear),
        notes: form.notes?.trim() || null,
      };
      const { data } = await api.post('/honors', payload);
      setItems((xs) => [data, ...xs]);
      setForm({ title: '', organization: '', kind: 'Award', level: 'School', gradeYear: 11, notes: '' });
    } finally {
      setSaving(false);
    }
  }

  async function del(id) {
    await api.delete(`/honors/${id}`);
    setItems((xs) => xs.filter((x) => x.id !== id));
  }

  async function saveEdit(id, patch) {
    const prev = items.find((x) => x.id === id);
    if (!prev) return;
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    try {
      await api.patch(`/honors/${id}`, patch);
    } catch (e) {
      // revert on failure
      setItems((xs) => xs.map((x) => (x.id === id ? prev : x)));
    }
  }

  // Prefill from generated item
  function useGenerated(r) {
    setForm((f) => ({
      ...f,
      title: r.name || f.title,
      kind: (KIND_OPTIONS.find(k => k.toLowerCase().startsWith(String(r.category||'').toLowerCase().slice(0,4))) || 'Honor'),
      notes: r.description || f.notes,
    }));
  }

  async function detectLocation() {
    setLocError('');
    try {
      await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords || {};
            setUserLoc({ lat: latitude, lng: longitude });
            resolve();
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });
    } catch (e) {
      setLocError('Location permission denied or unavailable');
    }
  }

  async function generateOpportunities() {
    setGenBusy(true);
    try {
      const { data } = await api.post('/honors/opportunities', {
        lat: userLoc?.lat ?? null,
        lng: userLoc?.lng ?? null,
        interests,
        radiusMi,
        n: 6,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      setResults(items);
    } finally {
      setGenBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="page-wrap">
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="kicker-sm">Profile</div>
            <h1 className="page-title">Honors & Awards</h1>
          </div>
          <div className="text-sm subtle">Track recognition and discover opportunities</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_.3fr]">
          {/* Composer */}
          <section className="card editor-card card-soft">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <button className="btn btn-primary" onClick={add} disabled={saving}>
                  + Add Honor
                </button>
              </div>
            </div>
            <div className="card-body grid gap-4">
              <L label="Title">
                <input
                  className="input"
                  placeholder="e.g., National Merit Semifinalist"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </L>
              <L label="Organization / Awarding body">
                <input
                  className="input"
                  placeholder="e.g., NMSC"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                />
              </L>
              <L label="Kind">
                <MenuSelect
                  key={`kind-${form.kind}`}
                  value={form.kind}
                  onChange={(v) => setForm({ ...form, kind: v })}
                  items={KIND_ITEMS}
                  className="ms-flat w-full"
                />
              </L>
              <L label="Level">
                <MenuSelect
                  key={`level-${form.level}`}
                  value={form.level}
                  onChange={(v) => setForm({ ...form, level: v })}
                  items={LEVEL_ITEMS}
                  className="ms-flat w-full"
                />
              </L>
              <L label="Grade Year">
                <MenuSelect
                  key={`grade-${form.gradeYear}`}
                  value={String(form.gradeYear)}
                  onChange={(v) => setForm({ ...form, gradeYear: Number(v) })}
                  items={[
                    { value: '9', label: '9th' },
                    { value: '10', label: '10th' },
                    { value: '11', label: '11th' },
                    { value: '12', label: '12th' },
                  ]}
                  className="ms-flat w-full"
                />
              </L>
              <L label="Notes" className="md:col-span-2">
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Brief description or context"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </L>
              {/* Location fields removed per request */}
            </div>
          </section>

          {/* Discover opportunities (Maps) */}
          <section className="card card-soft">
            <div className="card-header flex items-center justify-between">
              <div className="font-semibold">Opportunity Ideas</div>
              <div className="flex items-center gap-2">
                <button className="btn btn-outline" onClick={detectLocation}>Use My Location</button>
                {userLoc && <span className="text-xs subtle">Location set ✓</span>}
                {locError && <span className="text-xs text-red-400">{locError}</span>}
              </div>
            </div>
            <div className="card-body space-y-3">

              <div className="grid gap-2 md:grid-cols-[minmax(180px,1fr)_110px_auto] items-center">
                <input
                  className="input"
                  placeholder="Interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
                <div style={{ width: 110 }}>
                  <MenuSelect
                    key={`rad-${radiusMi}`}
                    value={String(radiusMi)}
                    onChange={(v) => setRadiusMi(Number(v))}
                    items={[
                      { value: '5', label: '5 mi' },
                      { value: '10', label: '10 mi' },
                      { value: '25', label: '25 mi' },
                      { value: '50', label: '50 mi' },
                    ]}
                    className="ms-flat w-full"
                  />
                </div>
                <button className="btn btn-primary" onClick={generateOpportunities} disabled={genBusy || !userLoc}>{genBusy ? 'Generating…' : 'Generate'}</button>
              </div>

              {!!results.length && (
                <div className="space-y-2 max-h-[480px] overflow-auto border rounded-xl p-2" style={{ borderColor: 'var(--border)' }}>
                  {results.map((r, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,.03)' }}>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {r.category && <span className="badge">{r.category}</span>}
                          <span>{r.name}</span>
                        </div>
                        {r.description && <div className="text-xs subtle mt-0.5">{r.description}</div>}
                        {r.whyItFits && <div className="text-xs text-[#9fb0d8]">Why: {r.whyItFits}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-outline" onClick={() => useGenerated(r)}>Use</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* List */}
        <section className="card mt-4">
          <div className="card-header flex items-center justify-between gap-3">
            <div className="font-semibold">Your Honors</div>
            <input className="input input--inline" placeholder="Search honors" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
          </div>
          <div className="card-body">
            {!filtered.length ? (
              <div className="text-sm subtle">No honors yet.</div>
            ) : (
              <div className="grid gap-1">
                {/* header row */}
                <div className="grid grid-cols-[1.4fr_1fr_120px_120px_120px_auto] text-xs subtle px-2 py-1">
                  <div>Title</div>
                  <div>Organization</div>
                  <div>Kind</div>
                  <div>Level</div>
                  <div>Grade</div>
                  <div></div>
                </div>
                {filtered.map((h) => (
                  <div key={h.id} className="grid grid-cols-[1.4fr_1fr_120px_120px_120px_auto] items-center px-2 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    {editingId === h.id ? (
                      <>
                        <input className="input" value={h.title || ''} onChange={(e) => saveEdit(h.id, { title: e.target.value })} />
                        <input className="input" value={h.organization || ''} onChange={(e) => saveEdit(h.id, { organization: e.target.value })} />
                        <MenuSelect key={`row-kind-${h.id}-${h.kind || ''}`} value={h.kind || ''} onChange={(v) => saveEdit(h.id, { kind: v })} items={KIND_ITEMS} className="ms-flat" />
                        <MenuSelect key={`row-level-${h.id}-${h.level || ''}`} value={h.level || ''} onChange={(v) => saveEdit(h.id, { level: v })} items={LEVEL_ITEMS} className="ms-flat" />
                        <MenuSelect
                          key={`row-grade-${h.id}-${h.gradeYear ?? ''}`}
                          value={String(h.gradeYear ?? '')}
                          onChange={(v) => saveEdit(h.id, { gradeYear: Number(v) })}
                          items={[{value:'9',label:'9th'},{value:'10',label:'10th'},{value:'11',label:'11th'},{value:'12',label:'12th'}]}
                          className="ms-flat"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button className="btn btn-outline" onClick={() => setEditingId(null)}>Done</button>
                          <button className="btn btn-danger" onClick={() => del(h.id)}>Delete</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium">{h.title}</div>
                        <div className="text-sm subtle">{h.organization || '-'}</div>
                        <div className="text-sm">{h.kind || '-'}</div>
                        <div className="text-sm">{h.level || '-'}</div>
                        <div className="text-sm">{gradeLabel(h.gradeYear)}</div>
                        <div className="flex items-center gap-2 justify-end">
                          <button className="btn btn-outline" onClick={() => setEditingId(h.id)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => del(h.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function L({ label, className = '', children }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label-text">{label}</span>
      {children}
    </label>
  );
}

function gradeLabel(g) {
  const n = Number(g);
  if (!n) return '-';
  if (n === 9) return '9th';
  if (n === 10) return '10th';
  if (n === 11) return '11th';
  if (n === 12) return '12th';
  return String(n);
}
