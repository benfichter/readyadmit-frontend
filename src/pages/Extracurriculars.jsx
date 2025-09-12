import AppShell from '../components/AppShell';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import MenuSelect from '../components/ui/MenuSelect.jsx';
export default function Extracurriculars() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '',
    organization: '',
    impact: '',
    hoursPerWeek: '',
    weeksPerYear: '',
  });
  const [ai, setAi] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiOptions, setAiOptions] = useState([]);
  const [sfOpen, setSfOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rank'); // rank | hours | title | recent
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [orderedIds, setOrderedIds] = useState([]); // for draggable rank order
  const [dragId, setDragId] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef(null);
  useEffect(() => {
    api.get('/extracurriculars').then(({ data }) => setItems(data || []));
  }, []);
  function hoursYear(r) {
    return (Number(r.hoursPerWeek) || 0) * (Number(r.weeksPerYear) || 0);
  }
  function quantifiedPreview(r) {
    const hrs = hoursYear(r);
    const org = r.organization ? ` @ ${r.organization}` : '';
    const imp = r.impact ? ` – ${String(r.impact).replace(/\.$/, '')}` : '';
    return `${r.title || 'Role'}${org}${imp}${hrs ? ` (≈${hrs} hrs/yr)` : ''}`;
  }
  function rankScore(r) {
    const t = String(r.title || '').toLowerCase();
    const impact = String(r.impact || '');
    let s = 0;
    if (/captain|president|founder|lead|leader|chair|head/.test(t)) s += 3;
    if (/\d/.test(impact)) s += 2; // quantified impact
    const hrs = hoursYear(r);
    s += Math.min(4, Math.floor(hrs / 100));
    if (r.organization) s += 1;
    return s;
  }
  function rankLabel(r) {
    const s = rankScore(r);
    return s >= 7 ? 'Gold' : s >= 4 ? 'Silver' : 'Bronze';
  }
  function rankClass(r) {
    const l = rankLabel(r);
    return l === 'Gold' ? 'rank-gold' : l === 'Silver' ? 'rank-silver' : 'rank-bronze';
  }
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...items];
    if (q) {
      list = list.filter((x) =>
        [x.title, x.organization, x.impact].some((t) =>
          String(t || '').toLowerCase().includes(q)
        )
      );
    }
    if (sort === 'hours') {
      list.sort((a, b) => hoursYear(b) - hoursYear(a));
    } else if (sort === 'rank') {
      if (orderedIds.length) {
        const idx = new Map(orderedIds.map((id, i) => [id, i]));
        list.sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0));
      } else {
        list.sort((a, b) => rankScore(b) - rankScore(a));
      }
    } else if (sort === 'title') {
      list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      );
    }
    return list;
  }, [items, search, sort, orderedIds]);

  // When switching to rank, initialize the drag order
  useEffect(() => {
    if (sort === 'rank') setOrderedIds(filtered.map(x => x.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  function onDragStart(id) {
    return (e) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; };
  }
  function onDragOver() {
    return (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  }
  function onDrop(id) {
    return (e) => {
      e.preventDefault();
      if (!dragId || dragId === id) return;
      const order = orderedIds.length ? [...orderedIds] : filtered.map(x => x.id);
      const from = order.indexOf(dragId);
      const to = order.indexOf(id);
      if (from === -1 || to === -1) return;
      order.splice(to, 0, ...order.splice(from, 1));
      setOrderedIds(order);
      setDragId(null);
    };
  }
  const totalHours = useMemo(
    () => items.reduce((s, x) => s + hoursYear(x), 0),
    [items]
  );
  async function improve() {
    if (!form.impact.trim() && !form.title) return;
    setSfOpen(true);
    setAiBusy(true); setAiOptions([]); setAi('');
    try {
      const { data } = await api.post('/quickai/strengthen-ec', {
        title: form.title,
        organization: form.organization,
        description: form.impact,
        n: 3,
        temperature: 0.9,
      });
      const opts = Array.isArray(data.options) && data.options.length ? data.options : [data.output];
      const trimmed = opts.filter(Boolean).map(t => String(t).slice(0,150));
      setAiOptions(trimmed);
      setAi(trimmed[0] || '');
    } finally {
      setAiBusy(false);
    }
  }
  async function add() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        impact: String(form.impact || '').slice(0, 150),
        hoursPerWeek: Number(form.hoursPerWeek) || null,
        weeksPerYear: Number(form.weeksPerYear) || null,
      };
      const { data } = await api.post('/extracurriculars', payload);
      setItems((v) => [data, ...v]);
      setForm({
        title: '',
        organization: '',
        impact: '',
        hoursPerWeek: '',
        weeksPerYear: '',
      });
      setAi('');
    } finally {
      setSaving(false);
    }
  }
  async function del(id) {
    await api.delete(`/extracurriculars/${id}`);
    setItems((v) => v.filter((x) => x.id !== id));
    setConfirmDel(null);
  }
  async function saveEdit() {
    if (!editing) return;
    // no-op: edits autosave via debounce
  }
  // Autosave on form changes while editing
  useEffect(() => {
    if (!editing) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        const payload = {
          ...form,
          impact: String(form.impact || '').slice(0, 150),
          hoursPerWeek: Number(form.hoursPerWeek) || null,
          weeksPerYear: Number(form.weeksPerYear) || null,
        };
        const { data } = await api.patch(`/extracurriculars/${editing.id}`, payload);
        setItems((v) => v.map((x) => (x.id === data.id ? data : x)));
      } catch (e) {
        console.warn('EC autosave failed', e?.response?.data || e.message);
      } finally {
        setSaving(false);
      }
    }, 700);
    return () => saveTimerRef.current && clearTimeout(saveTimerRef.current);
  }, [editing, form.title, form.organization, form.impact, form.hoursPerWeek, form.weeksPerYear]);
  function copy150(text) {
    const t = String(text || '').slice(0, 150);
    navigator.clipboard?.writeText(t);
  }
  return (
    <AppShell>
      <div className="page-wrap">
        {/* header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="kicker-sm">Profile</div>
            <h1 className="page-title">Extracurriculars</h1>
          </div>
          <div className="text-sm subtle">
            Estimated commitment: <b className="text-white">{totalHours}</b> hrs/yr
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
          {/* Composer */}
          <section className="card editor-card card-soft">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <button className="btn btn-secondary" onClick={improve}>
                  SmartFrame™
                </button>
                <button className="btn btn-primary" onClick={add} disabled={saving} style={{ display: editing ? 'none' : undefined }}>
                  + Add Activity
                </button>
                {editing && (
                  <button className="btn btn-outline" onClick={() => { setEditing(null); setForm({ title:'', organization:'', impact:'', hoursPerWeek:'', weeksPerYear:'' }); }}>
                    Done
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {saving ? (
                  <>
                    <span className="spinner" />
                    <span className="text-xs">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="save-dot pulse" />
                    <span className="text-xs text-[#9fb0d8]">Saved</span>
                  </>
                )}
              </div>
            </div>
            <div className="card-body grid gap-4 md:grid-cols-2">
              <div className="space-y-3 md:col-span-2">
                <L label="Title">
                  <div className="input-group">
                    <span className="input-icon">🏷️</span>
                    <input
                      className="input input-with-icon"
                      placeholder="e.g., Robotics Club Captain"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                </L>
                <L label="Organization">
                  <div className="input-group">
                    <span className="input-icon">🏫</span>
                    <input
                      className="input input-with-icon"
                      placeholder="School / Nonprofit / Company"
                      value={form.organization}
                      onChange={(e) =>
                        setForm({ ...form, organization: e.target.value })
                      }
                    />
                  </div>
                </L>
                <div className="grid grid-cols-2 gap-3">
                  <L label="Hours/week">
                    <input
                      className="input"
                      value={form.hoursPerWeek}
                      onChange={(e) =>
                        setForm({ ...form, hoursPerWeek: e.target.value })
                      }
                      inputMode="numeric"
                      placeholder="e.g., 5"
                    />
                  </L>
                  <L label="Weeks/year">
                    <input
                      className="input"
                      value={form.weeksPerYear}
                      onChange={(e) =>
                        setForm({ ...form, weeksPerYear: e.target.value })
                      }
                      inputMode="numeric"
                      placeholder="e.g., 40"
                    />
                  </L>
                </div>
              </div>
              <div className="space-y-3 md:col-span-2">
                <L
                  label={
                    <div className="flex items-center justify-between">
                      Impact (how you’ll frame it)
                      <span className="badge">Guided</span>
                    </div>
                  }
                >
                  <textarea
                    className="input"
                    style={{ minHeight: 180 }}
                    placeholder="Quantify outcomes, show initiative, leadership, scope, reflection… (max 150)"
                    value={form.impact}
                    maxLength={150}
                    onChange={(e) => setForm({ ...form, impact: e.target.value.slice(0,150) })}
                  />
                  <div className="text-xs subtle mt-1">{(form.impact || '').length}/150</div>
                </L>
                {/* SmartFrame suggestions are shown in a modal now */}
                {(form.title ||
                  form.impact ||
                  form.hoursPerWeek ||
                  form.weeksPerYear) && (
                  <div className="meta-bar">
                    <span className="chip">Preview</span>
                    <span className="subtle">{quantifiedPreview(form)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* List & Controls */}
          <section className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <div className="kicker-sm">Your activities</div>
                <span className="badge">{items.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 200 }}
                />
                <div style={{ width: 200 }}>
                  <MenuSelect
                    value={sort}
                    onChange={setSort}
                    items={[
                      { value: 'rank', label: 'Sort: Rank' },
                      { value: 'recent', label: 'Sort: Recent' },
                      { value: 'hours', label: 'Sort: Hours/yr' },
                      { value: 'title', label: 'Sort: Title' },
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 space-y-2.5">
              {filtered.map((x) => (
                <article
                  key={x.id}
                  className={`card p-3 ec-item ${rankClass(x)} ${dragId===x.id ? 'is-dragging' : ''}`}
                  draggable={sort==='rank'}
                  onDragStart={onDragStart(x.id)}
                  onDragOver={onDragOver(x.id)}
                  onDrop={onDrop(x.id)}
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] items-start">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">

{sort === 'rank' && (
  <span className="drag-handle" title="Drag to reorder" aria-hidden>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="7" cy="7" r="1.2" fill="currentColor"/><circle cx="12" cy="7" r="1.2" fill="currentColor"/><circle cx="17" cy="7" r="1.2" fill="currentColor"/>
      <circle cx="7" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="17" cy="12" r="1.2" fill="currentColor"/>
      <circle cx="7" cy="17" r="1.2" fill="currentColor"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/><circle cx="17" cy="17" r="1.2" fill="currentColor"/>
    </svg>
  </span>
)}


                        <h3 className="font-semibold text-white break-words">{x.title}</h3>
                        {x.organization && (
                          <span className="badge">{x.organization}</span>
                        )}
                        <span className={`badge ${rankLabel(x) === 'Gold' ? 'text-emerald-300' : rankLabel(x) === 'Silver' ? 'text-sky-300' : 'text-amber-300'}`}>
                          {rankLabel(x)}
                        </span>
                      </div>
                      {(x.hoursPerWeek || x.weeksPerYear) && (
                        <div className="mt-2 text-xs subtle">
                          {x.hoursPerWeek || '?'} hrs/week • {x.weeksPerYear || '?'} weeks/yr •
                          <b className="text-white"> {hoursYear(x)} hrs/yr</b>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                      <button className="btn btn-outline" onClick={() => { setEditing(x); setForm({ title: x.title || '', organization: x.organization || '', impact: (x.impact || '').slice(0,150), hoursPerWeek: x.hoursPerWeek ?? '', weeksPerYear: x.weeksPerYear ?? '' }); }}>
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => copy150(x.impact || x.title || '')}
                      >
                        Copy 150-char
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ color: '#f8b4b4' }}
                        onClick={() => setConfirmDel(x)}
                      >
                        Delete
                      </button>
                    </div>
                    {x.impact && (
                      <p className="mt-1 text-xs sm:text-sm md:col-span-2" style={{ color: '#cfe2ff', overflowWrap: 'anywhere' }}>
                        {x.impact}
                      </p>
                    )}
                  </div>
                </article>
              ))}
              {!filtered.length && (
                <div className="subtle text-sm">No activities match this view.</div>
              )}
            </div>
          </section>
        </div>
        {/* SmartFrame Modal */}
        {sfOpen && (
          <Modal onClose={() => { setSfOpen(false); setAiOptions([]); setAiBusy(false); }} title="SmartFrame™ Suggestions">
            {aiBusy && (
              <div className="flex items-center gap-2 text-sm text-[#cbd3ea]">
                <div className="spinner" /> Generating options…
              </div>
            )}
            {!!aiOptions.length && (
              <div className="grid gap-2">
                {aiOptions.map((opt, i) => (
                  <div key={i} className="mini-card">
                    <div className="text-sm" style={{ color: '#cfe2ff' }}>{opt}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="btn btn-primary" onClick={() => { setForm({ ...form, impact: opt }); setSfOpen(false); }}>Use this</button>
                      <button className="btn btn-outline" onClick={() => navigator.clipboard?.writeText(opt)}>Copy</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!aiBusy && !aiOptions.length && (
              <div className="text-sm subtle">No suggestions yet.</div>
            )}
          </Modal>
        )}

        {/* Edit Modal removed: editing now populates left editor */}
        {/* Delete confirm */}
        {confirmDel && (
          <Modal onClose={() => setConfirmDel(null)} title="Delete activity?">
            <p className="subtle">
              This will permanently remove{' '}
              <b className="text-white">{confirmDel.title}</b>.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }}
                onClick={() => del(confirmDel.id)}
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
function L({ label, children }) {
  return (
    <label className="block">
      <div className="form-label">{label}</div>
      {children}
    </label>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 p-4 grid place-items-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div className="card auth-panel relative w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="page-title" style={{ fontSize: '1.15rem' }}>
            {title}
          </div>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
