// src/pages/Onboarding.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListChecks, Award, GraduationCap, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import AppShell from '../components/AppShell';
import MenuSelect from '../components/ui/MenuSelect';
import CalendarSelect from '../components/ui/CalendarSelect';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { key: 'activities', label: 'Activities' },
  { key: 'honors', label: 'Honors' },
  { key: 'apps', label: 'Applications' },
  { key: 'essays', label: 'Essays' },
];

const HONOR_GRADE_ITEMS = [
  { value: '', label: 'Grade' },
  { value: '9', label: '9th' },
  { value: '10', label: '10th' },
  { value: '11', label: '11th' },
  { value: '12', label: '12th' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const { user, setUser } = useAuth();
  const [celebrate, setCelebrate] = useState(false);

  async function next() {
    if (step === STEPS.length - 1) {
      try {
        await api.patch('/users/me', { onboarded: true });
        if (user) setUser({ ...user, onboarded: true });
      } catch {}
      setCelebrate(true);
      setTimeout(() => { setCelebrate(false); nav('/dashboard'); }, 700);
      return;
    }
    setCelebrate(true);
    setTimeout(() => { setCelebrate(false); setStep((s) => s + 1); }, 600);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <AppShell>
      {celebrate && (
        <div className="fixed inset-0 z-[9999] grid place-items-center" style={{ background: 'rgba(0,255,153,0.08)', backdropFilter: 'blur(2px)' }}>
          <div className="flex flex-col items-center gap-3" style={{ transform: 'scale(1)', animation: 'pop .6s ease-out' }}>
            <div className="rounded-full" style={{ background: 'rgba(16,185,129,.18)', border: '2px solid rgba(16,185,129,.45)', padding: 28 }}>
              <CheckCircle2 size={88} color="#34d399" />
            </div>
            <div className="text-lg font-semibold" style={{ color: '#bbf7d0' }}>Completed</div>
          </div>
          <style>{`@keyframes pop { 0%{ transform: scale(.85); opacity:.2 } 60%{ transform: scale(1.04); opacity:1 } 100%{ transform: scale(1); } }`}</style>
        </div>
      )}
      <div className="container max-w-4xl">
        <Header step={step} />
        <div className="card p-6 mt-4">
          {STEPS[step].key !== 'essays' ? (
            <ImportSection key={STEPS[step].key} type={STEPS[step].key} onNext={next} />
          ) : (
            <EssaySection key="essays" onNext={next} />
          )}
          <div className="mt-6 flex items-center justify-between text-sm">
            <button className="link" onClick={back} disabled={step === 0}>Back</button>
            <button className="link" onClick={async () => {
              if (step === STEPS.length - 1) {
                try {
                  await api.patch('/users/me', { onboarded: true });
                  if (user) setUser({ ...user, onboarded: true });
                } catch {}
              }
              next();
            }}>Skip</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Header({ step }) {
  return (
    <div>
      <div className="text-2xl font-semibold flex items-center gap-2">
        {step === 0 && <ListChecks size={22} className="text-indigo-400" />}
        {step === 1 && <Award size={22} className="text-amber-400" />}
        {step === 2 && <GraduationCap size={22} className="text-emerald-400" />}
        {step === 3 && <FileText size={22} className="text-sky-400" />}
        <span>Let’s set you up</span>
      </div>
      <div className="text-sm text-gray-400">Import your info in a few quick steps</div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`h-2 rounded ${i <= step ? 'bg-indigo-500' : 'bg-[#2a3348]'}`} />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">Step {step + 1} of {STEPS.length}: {STEPS[step].label}</div>
    </div>
  );
}

function ImportSection({ type, onNext }) {
  const [rows, setRows] = useState(() => [emptyRow(type)]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [paste, setPaste] = useState('');
  const [globalRound, setGlobalRound] = useState('');

  function emptyRow(t) {
    if (t === 'activities') return { title: '', organization: '', impact: '', hoursPerWeek: '', weeksPerYear: '' };
    if (t === 'honors') return { title: '', organization: '', kind: '', level: '', gradeYear: '', date: '', notes: '' };
    if (t === 'apps') return { college: '', status: 'drafting', round: '', deadline: '' };
    return {};
  }

  function setField(i, k, v) {
    setRows((xs) => xs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  }
  function addRow() { setRows((xs) => [...xs, emptyRow(type)]); }
  function removeRow(i) { setRows((xs) => xs.filter((_, idx) => idx !== i)); }

  // ---- deadline auto-fill helper
  async function fetchDeadlineFor(i, college, round) {
    const c = (college || '').trim();
    const r = (round || '').trim();
    if (!c || !r) return;
    try {
      const { data } = await api.get('/import/resolve-one', { params: { college: c, round: r } });
      const iso = data?.item?.deadline || '';
      if (iso) setRows(xs => xs.map((row, idx) => (idx === i ? { ...row, deadline: iso } : row)));
    } catch { /* ignore */ }
  }

  async function populateFromPaste() {
    const names = String(paste || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return;
    try {
      setBusy(true); setErr('');
      const { data } = await api.post('/import/resolve-colleges', { names, round: globalRound });
      const items = Array.isArray(data?.items) ? data.items : [];
      setRows(items.map((it) => ({ college: it.college, status: 'drafting', round: it.round || '', deadline: it.deadline || '' })));
    } catch (e) {
      setErr(e?.response?.data?.error || 'Could not resolve colleges');
    } finally { setBusy(false); }
  }

  async function doPreview() {
    setErr(''); setBusy(true); setResult(null);
    try {
      const clean = rows.filter((r) => Object.values(r).some((v) => String(v || '').trim()))
        .map((r) => ({ ...r }));
      const { data } = await api.post('/import/preview', { type, rows: clean });
      setPreview(data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Preview failed');
    } finally { setBusy(false); }
  }

  async function doImport() {
    if (!preview || !Array.isArray(preview.items)) return;
    setErr(''); setBusy(true);
    try {
      const items = preview.items.filter((i) => !i.isDuplicate);
      const { data } = await api.post('/import/commit', { type, items });
      setResult(data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Import failed');
    } finally { setBusy(false); }
  }

  const title = type === 'activities' ? 'Add Activities'
    : type === 'honors' ? 'Add Honors'
    : type === 'apps' ? 'Add Applications'
    : 'Add';

  const STATUSES = ['drafting', 'editing', 'submitted'];
  const ROUNDS = [
    { value: '', label: '—' },
    { value: 'rd', label: 'Regular Decision' },
    { value: 'ed', label: 'Early Decision' },
    { value: 'ed2', label: 'Early Decision II' },
    { value: 'ea', label: 'Early Action' },
    { value: 'rea', label: 'Restrictive EA' },
    { value: 'rolling', label: 'Rolling' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div>
      <div className="card-title flex items-center gap-2">
        {type === 'activities' && <ListChecks size={18} className="text-indigo-400" />}
        {type === 'honors' && <Award size={18} className="text-amber-400" />}
        {type === 'apps' && <GraduationCap size={18} className="text-emerald-400" />}
        <span>{title}</span>
      </div>
      <div className="text-sm text-gray-400">Enter a few items. You can add more later.</div>

      {type === 'apps' && (
        <div className="mt-3 rounded border border-[#2a3348] p-3">
          <div className="text-sm text-gray-300 mb-2">Quick add: paste a list of colleges (one per line) and pick a decision plan. We’ll autocomplete deadlines when possible.</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <textarea className="input h-28" placeholder={'e.g.\nMIT\nUCLA\nCarnegie Mellon'} value={paste} onChange={(e) => setPaste(e.target.value)} />
            <div className="grid gap-2 content-start">
              <label className="text-xs subtle">Decision Plan</label>
              <select className="input" value={globalRound} onChange={(e) => setGlobalRound(e.target.value)}>
                {ROUNDS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex gap-2 text-sm mt-2">
                <button type="button" className="btn btn-outline" onClick={populateFromPaste} disabled={busy}>Populate</button>
                <button type="button" className="btn btn-outline" onClick={() => { setPaste(''); setRows([emptyRow(type)]); }}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded border border-[#2a3348] p-3 grid gap-2">
            {type === 'activities' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="input" placeholder="Title *" value={r.title} onChange={(e) => setField(i, 'title', e.target.value)} />
                <input className="input" placeholder="Organization" value={r.organization} onChange={(e) => setField(i, 'organization', e.target.value)} />
                <input className="input sm:col-span-2" placeholder="Impact / Description" value={r.impact} onChange={(e) => setField(i, 'impact', e.target.value)} />
                <input className="input" type="number" placeholder="Hours/Week" value={r.hoursPerWeek} onChange={(e) => setField(i, 'hoursPerWeek', e.target.value)} />
                <input className="input" type="number" placeholder="Weeks/Year" value={r.weeksPerYear} onChange={(e) => setField(i, 'weeksPerYear', e.target.value)} />
              </div>
            )}

            {type === 'honors' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="input" placeholder="Title *" value={r.title} onChange={(e) => setField(i, 'title', e.target.value)} />
                <input className="input" placeholder="Organization" value={r.organization} onChange={(e) => setField(i, 'organization', e.target.value)} />
                <input className="input" placeholder="Type (e.g., Award)" value={r.kind} onChange={(e) => setField(i, 'kind', e.target.value)} />
                <input className="input" placeholder="Level (e.g., National)" value={r.level} onChange={(e) => setField(i, 'level', e.target.value)} />
                <MenuSelect
                  value={String(r.gradeYear ?? '')}
                  onChange={(val) => setField(i, 'gradeYear', val)}
                  items={HONOR_GRADE_ITEMS}
                  className="ms-flat w-full"
                />
              </div>
            )}

            {type === 'apps' && (
              <div className="grid gap-2 sm:grid-cols-2">
                <CollegeAutocomplete
                  value={r.college}
                  onChange={(val) => setField(i, 'college', val)}
                  onSelect={(name, plans) => {
                    const code = r.round;
                    if (code && plans && plans[code]) {
                      setField(i, 'deadline', plans[code]);
                    } else if (code) {
                      fetchDeadlineFor(i, name, code);
                    }
                    setField(i, 'college', name); // store normalized pick
                  }}
                />
                <div>
                  <MenuSelect
                    value={r.status}
                    onChange={(val) => setField(i, 'status', val)}
                    items={STATUSES.map(s => ({ value: s, label: s[0].toUpperCase()+s.slice(1) }))}
                    className="ms-flat w-full"
                  />
                </div>
                <div>
                  <MenuSelect
                    value={r.round}
                    onChange={(val) => {
                      setField(i, 'round', val);
                      if ((r.college || '').trim() && val) fetchDeadlineFor(i, r.college, val);
                    }}
                    items={ROUNDS}
                    className="ms-flat w-full"
                  />
                </div>
                <div>
                  <CalendarSelect
                    value={r.deadline}
                    onChange={(v) => setField(i, 'deadline', v)}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <button type="button" className="link" onClick={() => removeRow(i)}>Remove</button>
              {i === rows.length - 1 && (
                <button type="button" className="link" onClick={addRow}>+ Add another</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 text-sm">
        <button className="btn btn-primary" onClick={doPreview} disabled={busy}>{busy ? 'Working…' : 'Preview'}</button>
        {preview?.items?.length ? (
          <button className="btn btn-outline" onClick={doImport} disabled={busy}>Import {preview.items.length - (preview.summary?.duplicates || 0)}</button>
        ) : null}
      </div>

      {err && <div className="mt-2 text-sm text-rose-300">{err}</div>}

      {preview && (
        <div className="mt-4">
          <div className="text-sm text-gray-300">
            Ready to import {preview.summary?.valid || 0} item(s). Duplicates: {preview.summary?.duplicates || 0}.
          </div>
          <div className="mt-2 max-h-60 overflow-auto rounded border border-[#2a3348]">
            <table className="w-full text-sm">
              <thead className="bg-[#1f2535] text-gray-300">
                <tr>
                  {type === 'activities' && (<>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Organization</th>
                    <th className="text-left p-2">Impact</th>
                    <th className="text-right p-2">H/W</th>
                    <th className="text-right p-2">W/Y</th>
                    <th className="text-left p-2">State</th>
                  </>)}
                  {type === 'honors' && (<>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Organization</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Level</th>
                    <th className="text-right p-2">Grade</th>
                    <th className="text-left p-2">State</th>
                  </>)}
                  {type === 'apps' && (<>
                    <th className="text-left p-2">College</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Deadline</th>
                    <th className="text-left p-2">State</th>
                  </>)}
                </tr>
              </thead>
              <tbody>
                {(preview.items || []).map((it, idx) => (
                  <tr key={idx} className="border-t border-[#2a3348]">
                    {type === 'activities' && (<>
                      <td className="p-2">{it.title}</td>
                      <td className="p-2">{it.organization || '-'}</td>
                      <td className="p-2">{it.impact || '-'}</td>
                      <td className="p-2 text-right">{it.hoursPerWeek ?? '-'}</td>
                      <td className="p-2 text-right">{it.weeksPerYear ?? '-'}</td>
                      <td className="p-2">{it.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-amber-300"><AlertTriangle size={14} /> Duplicate</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 size={14} /> New</span>
                      )}</td>
                    </>)}
                    {type === 'honors' && (<>
                      <td className="p-2">{it.title}</td>
                      <td className="p-2">{it.organization || '-'}</td>
                      <td className="p-2">{it.kind || '-'}</td>
                      <td className="p-2">{it.level || '-'}</td>
                      <td className="p-2 text-right">{it.gradeYear ?? '-'}</td>
                      <td className="p-2">{it.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-amber-300"><AlertTriangle size={14} /> Duplicate</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 size={14} /> New</span>
                      )}</td>
                    </>)}
                    {type === 'apps' && (<>
                      <td className="p-2">{it.college}</td>
                      <td className="p-2">{it.status || '-'}</td>
                      <td className="p-2">{(it.round || '').toUpperCase() || '-'}</td>
                      <td className="p-2">{it.deadline || '-'}</td>
                      <td className="p-2">{it.isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-amber-300"><AlertTriangle size={14} /> Duplicate</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-300"><CheckCircle2 size={14} /> New</span>
                      )}</td>
                    </>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="note mt-4">
          Imported {result.inserted} item(s). Skipped {result.skipped} duplicate(s).
          <div className="mt-3"><button className="btn btn-primary" onClick={onNext}>Next</button></div>
        </div>
      )}
    </div>
  );
}

function CollegeAutocomplete({ value, onChange, onSelect, inputRef }) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Minimal, editable fallback list
  const FALLBACK_COLLEGES = useMemo(() => [
    'Massachusetts Institute of Technology',
    'University of California Los Angeles',
    'University of California Berkeley',
    'Carnegie Mellon University',
    'Stanford University',
    'University of Maryland College Park',
    'University of Michigan Ann Arbor',
    'Harvard University',
    'Princeton University',
    'Georgia Institute of Technology',
  ], []);

  useEffect(() => { setQ(value || ''); }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const term = q.trim();
      if (!term) { setItems([]); return; }

      setLoading(true);
      try {
        const { data } = await api.get(`/import/college-suggest?q=${encodeURIComponent(term)}`);
        const serverItems = Array.isArray(data?.items) ? data.items : [];

        if (serverItems.length > 0) {
          setItems(serverItems);
        } else {
          const t = term.toLowerCase();
          const hits = FALLBACK_COLLEGES
            .filter(name => name.toLowerCase().includes(t))
            .map(name => ({ name, score: 1, plans: {} }))
            .slice(0, 10);
          setItems(hits);
        }
      } catch {
        const t = q.trim().toLowerCase();
        const hits = FALLBACK_COLLEGES
          .filter(name => name.toLowerCase().includes(t))
          .map(name => ({ name, score: 1, plans: {} }))
          .slice(0, 10);
        setItems(hits);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [q, FALLBACK_COLLEGES]);

  function choose(it) {
    onChange?.(it.name);
    onSelect?.(it.name, it.plans || {});
    setOpen(false);
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 120);
  }

  const showMenu = open && q.trim().length > 0;

  return (
    <div className="ms relative">
      <input
        ref={inputRef}
        className="input w-full"
        placeholder="College *"
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange?.(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        autoComplete="off"
      />

      {showMenu && (
        <div className="ms-menu absolute z-20 mt-1" style={{ width: '100%', minWidth: '100%' }}>
          {loading && <div className="ms-item">Searching…</div>}
          {!loading && items.length === 0 && (
            <div className="ms-item subtle">No matches</div>
          )}
          {!loading && items.length > 0 && items.map((it) => (
            <button
              key={it.name}
              className="ms-item"
              onMouseDown={(e) => { e.preventDefault(); choose(it); }}
            >
              <span className="truncate">{it.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EssaySection({ onNext }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [parsing, setParsing] = useState(false);

  async function save() {
    setErr(''); setBusy(true);
    try {
      const { data } = await api.post('/import/commit', { type: 'essays', items: [{ text }] });
      if (data?.ok) {
        try { await api.patch('/users/me', { onboarded: true }); } catch {}
        onNext();
      }
    } catch (e) {
      setErr(e?.response?.data?.error || 'Save failed');
    } finally { setBusy(false); }
  }

  async function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setErr(''); setParsing(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const { data } = await api.post('/import/essay-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.text) setText(data.text);
    } catch (e2) {
      setErr(e2?.response?.data?.error || 'Could not parse file');
    } finally { setParsing(false); }
  }

  return (
    <div>
      <div className="card-title">Import Essay</div>
      <div className="text-sm text-gray-400">Paste your Common App draft or upload DOCX/PDF. We’ll score it after saving.</div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <label className="btn btn-outline cursor-pointer">
          <input type="file" accept=".docx,.pdf,.txt" className="hidden" onChange={onFile} />
          {parsing ? 'Reading…' : 'Upload DOCX/PDF'}
        </label>
      </div>
      <textarea className="input h-64 mt-3" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your essay text…" />
      <div className="mt-2 flex gap-2 text-sm">
        <button className="btn btn-primary" onClick={save} disabled={busy || !text.trim()}>{busy ? 'Saving…' : 'Save Essay'}</button>
        <Link className="btn btn-outline" to="/essays">Open Essay Workspace</Link>
      </div>
      {err && <div className="mt-2 text-sm text-rose-300">{err}</div>}
      {done && (
        <div className="note mt-3">
          Essay saved. You can refine it in the workspace.
          <div className="mt-3"><button className="btn btn-primary" onClick={onNext}>Next</button></div>
        </div>
      )}
    </div>
  );
}
