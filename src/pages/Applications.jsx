// src/pages/ApplicationsPage.jsx
import AppShell from '../components/AppShell';
import { useEffect, useMemo, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import MenuSelect from '../components/ui/MenuSelect';
import CalendarSelect from '../components/ui/CalendarSelect';


const cal = (d) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const w = [];
  let row = new Array(start.getDay()).fill(null);
  for (let i = 1; i <= end.getDate(); i++) {
    row.push(new Date(d.getFullYear(), d.getMonth(), i));
    if (row.length === 7) { w.push(row); row = []; }
  }
  if (row.length) { while (row.length < 7) row.push(null); w.push(row); }
  return w;
};

const STATUSES = ['drafting', 'editing', 'submitted'];
const cap = (s='') => s.charAt(0).toUpperCase() + s.slice(1);
const STATUS_ITEMS = STATUSES.map(s => ({ value: s, label: cap(s) }));

// helpers for <input type="date">
const toInputDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const fromInputDateToISO = (dateStr) =>
  dateStr ? new Date(dateStr + 'T00:00:00').toISOString() : null;

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [when, setWhen] = useState(() => new Date());
  const [filter, setFilter] = useState('all');

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ college: '', deadline: '', status: 'drafting' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const firstInputRef = useRef(null);

  const [rowSaving, setRowSaving] = useState({}); // { [id]: boolean }

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/apps').then(({ data }) => setApps(data || []));
  }, []);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const weeks = useMemo(() => cal(when), [when]);

  function openAddModal() {
    setErr('');
    setForm({ college: '', deadline: '', status: 'drafting' });
    setIsOpen(true);
  }

  async function submitNewApp(e) {
    e?.preventDefault?.();
    setErr('');

    if (!form.college.trim()) { setErr('College is required.'); return; }
    if (form.deadline && Number.isNaN(new Date(form.deadline).getTime())) {
      setErr('Deadline must be a valid date.'); return;
    }
    if (!STATUSES.includes(form.status)) { setErr('Status is invalid.'); return; }

    try {
      setSaving(true);
      const payload = {
        college: form.college.trim(),
        status: form.status,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      };
      const { data } = await api.post('/apps', payload);
      setApps((x) => [data, ...x]);
      setIsOpen(false);
      if (data?.id) navigate(`/applications/${data.id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2?.message || 'Failed to create application.');
    } finally {
      setSaving(false);
    }
  }

  // optimistic row update
  async function updateAppField(id, field, value) {
    const prev = apps.find((a) => a.id === id);
    if (!prev) return;

    let patch = { [field]: value };
    if (field === 'deadline') patch.deadline = fromInputDateToISO(value);

    setApps((xs) => xs.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setRowSaving((m) => ({ ...m, [id]: true }));
    try {
      await api.patch(`/apps/${id}`, patch);
    } catch (e) {
      setApps((xs) => xs.map((a) => (a.id === id ? { ...a, [field]: prev[field] } : a)));
      console.error('Failed to update app', e);
    } finally {
      setRowSaving((m) => ({ ...m, [id]: false }));
    }
  }

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const dayBadges = (d) => {
    if (!d) return [];
    return apps.filter((a) => a.deadline && sameDay(new Date(a.deadline), d));
  };

  const shown = apps.filter((a) => (filter === 'all' ? true : a.status === filter));

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="kicker-sm">Planning</div>
            <h1 className="page-title">Applications</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openAddModal} className="btn btn-primary">+ Add Application</button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
              style={{ width: 160 }}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{cap(s)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Calendar */}
          <div className="card">
            <div className="card-header">
              <div className="text-xl font-semibold">
                {when.toLocaleString('default', { month: 'long' })} {when.getFullYear()}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth() - 1, 1))}
                  className="btn btn-outline"
                >
                  ← Prev
                </button>
                <button onClick={() => setWhen(new Date())} className="btn btn-outline">
                  Today
                </button>
                <button
                  onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth() + 1, 1))}
                  className="btn btn-outline"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-xs subtle text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weeks.flat().map((d, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl border"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'rgba(255,255,255,.03)',
                      padding: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    {d && <div className="font-medium">{d.getDate()}</div>}
                    <div className="mt-1 space-y-1">
                      {dayBadges(d).map((a) => (
                        <div
                          key={a.id}
                          className="px-1.5 py-0.5 rounded-md truncate"
                          title={`${a.college} deadline`}
                          style={{
                            background: 'rgba(124,58,237,.18)',
                            border: '1px solid rgba(124,58,237,.45)',
                            color: '#EAE3FF',
                            fontSize: 12,
                          }}
                        >
                          {a.college}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List: only Status (editable), Due date (editable), Open */}
          <div className="space-y-3">
            {shown.map((a) => (
              <article key={a.id} className="card">
                <div className="card-body">
                  <div className="font-medium text-white text-lg">{a.college || 'Untitled'}</div>

                  
                  {/* REPLACE the old 3-column controls with this 2-row layout */}
<div className="mt-3 space-y-2">
  {/* Row 1: Status dropdown + Open */}
  <div className="flex items-center gap-3">
    <span className="text-xs subtle">Status</span>
    <div className="w-44">
      <MenuSelect
        value={a.status || 'drafting'}
        onChange={(val) => updateAppField(a.id, 'status', val)}
        items={STATUS_ITEMS}
        className="ms-flat w-full"   // <- non-pill look
      />
    </div>
    <div className="ml-auto">
      <Link to={`/applications/${a.id}`} className="btn btn-primary">
        {rowSaving[a.id] ? 'Saving…' : 'Open'}
      </Link>
    </div>
  </div>

{/* Row 2: Due date (NOWRAP) */}
<div className="flex items-center gap-1 whitespace">
  <CalendarSelect
    value={toInputDate(a.deadline)}                 // 'YYYY-MM-DD' or ''
    onChange={(dateStr) => updateAppField(a.id, 'deadline', dateStr)}
    className="!w-45 shrink-1"                      // keeps it compact, matches dropdown style
  />
</div>



</div>

                </div>
              </article>
            ))}
            {!shown.length && (
              <div className="subtle text-sm">No applications match this filter.</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          style={{ background: 'rgba(0,0,0,.5)' }}
        >
          <form
            onSubmit={submitNewApp}
            className="card w-full max-w-lg"
            onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
          >
            <div className="card-header">
              <div className="text-lg font-semibold">Add Application</div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm mb-1">College *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Carnegie Mellon University"
                  value={form.college}
                  onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Deadline</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    className="input w-full"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!!err && <div className="text-sm text-red-400">{err}</div>}
            </div>
            <div className="card-footer flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create & Open'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
