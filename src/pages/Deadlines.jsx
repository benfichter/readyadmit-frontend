import AppShell from '../components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

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

const KINDS = [
  { value: 'application', label: 'Application' },
  { value: 'supplemental', label: 'Supplemental' },
  { value: 'other', label: 'Other' },
];

export default function Deadlines() {
  const [items, setItems] = useState([]);
  const [when, setWhen] = useState(() => new Date());
  const [form, setForm] = useState({ title: '', due: '', kind: 'application' });
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/deadlines').then(({ data }) => setItems((data || []).sort(sortByDue)));
  }, []);

  const weeks = useMemo(() => cal(when), [when]);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const dayBadges = (d) => {
    if (!d) return [];
    return items.filter((x) => x.due && sameDay(new Date(x.due), d));
  };

  const now = new Date();
  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === 'upcoming') list = list.filter((d) => parseDate(d.due) >= startOfDay(now));
    if (filter === 'past') list = list.filter((d) => parseDate(d.due) < startOfDay(now));
    if (kind !== 'all') list = list.filter((d) => d.kind === kind);
    if (q.trim())
      list = list.filter((d) =>
        [d.title, d.kind].some((t) => String(t || '').toLowerCase().includes(q.toLowerCase()))
      );
    return list.sort(sortByDue);
  }, [items, filter, kind, q]);

  async function add() {
    if (!form.title || !form.due) return;
    const { data } = await api.post('/deadlines', form);
    setItems((v) => [...v, data].sort(sortByDue));
    setForm({ title: '', due: '', kind: form.kind });
  }
  async function remove(id) {
    await api.delete(`/deadlines/${id}`);
    setItems((v) => v.filter((x) => x.id !== id));
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="kicker-sm">Planning</div>
            <h1 className="page-title">Deadlines</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={() => quickPick(7, setForm)}>+7d</button>
            <button className="btn btn-secondary" onClick={() => quickPick(14, setForm)}>+14d</button>
            <button className="btn btn-secondary" onClick={() => quickPick(30, setForm)}>+30d</button>
            <button className="btn btn-primary" onClick={add}>Add</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Calendar (matches Applications) */}
          <div className="card">
            <div className="card-header">
              <div className="text-xl font-semibold">
                {when.toLocaleString('default', { month: 'long' })} {when.getFullYear()}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth()-1, 1))} className="btn btn-outline">← Prev</button>
                <button onClick={() => setWhen(new Date())} className="btn btn-outline">Today</button>
                <button onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth()+1, 1))} className="btn btn-outline">Next →</button>
              </div>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="text-xs subtle text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weeks.flat().map((d, i) => (
                  <div key={i} className="h-28 rounded-xl border" style={{borderColor:'var(--border)', background:'rgba(255,255,255,.03)', padding:'8px', overflow:'hidden'}}>
                    {d && <div className="font-medium">{d.getDate()}</div>}
                    <div className="mt-1 space-y-1">
                      {dayBadges(d).map((x) => (
                        <div
                          key={x.id}
                          className="px-1.5 py-0.5 rounded-md truncate"
                          title={x.title}
                          style={{
                            background:
                              x.kind === 'application'
                                ? 'rgba(124,58,237,.18)'
                                : x.kind === 'supplemental'
                                ? 'rgba(37,99,235,.18)'
                                : 'rgba(255,255,255,.06)',
                            border:
                              x.kind === 'application'
                                ? '1px solid rgba(124,58,237,.45)'
                                : x.kind === 'supplemental'
                                ? '1px solid rgba(37,99,235,.45)'
                                : '1px solid var(--border)',
                            color: '#EAE3FF',
                            fontSize: 12,
                          }}
                        >
                          {x.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right rail: composer + list + filters */}
          <div className="space-y-3">
            <section className="card card-soft">
              <div className="card-body grid gap-3">
                <input
                  className="input"
                  placeholder="e.g., Stanford Regular Decision"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input"
                    type="date"
                    value={form.due}
                    onChange={(e) => setForm({ ...form, due: e.target.value })}
                  />
                  <select
                    className="input"
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  >
                    {KINDS.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body flex flex-wrap items-center gap-2">
                <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="upcoming">Show: Upcoming</option>
                  <option value="past">Show: Past</option>
                  <option value="all">Show: All</option>
                </select>
                <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="all">Kind: All</option>
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>Kind: {k.label}</option>
                  ))}
                </select>
                <input
                  className="input"
                  placeholder="Search…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ maxWidth: 240 }}
                />
              </div>
            </section>

            {filtered.map((d) => (
              <article key={d.id} className="card">
                <div className="card-body flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{d.title}</div>
                    <div className="text-xs subtle mt-1">
                      {new Date(d.due).toDateString()} • {d.kind}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline" onClick={() => remove(d.id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {!filtered.length && <div className="subtle text-sm">No deadlines to show.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* utils */
function sortByDue(a, b){ return parseDate(a.due) - parseDate(b.due); }
function parseDate(v){
  if (v instanceof Date) return v;
  const [y,m,d] = String(v || '').split('-').map(Number);
  return new Date(y, (m||1)-1, d||1);
}
function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function toInputDate(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function quickPick(days, setForm){ const d=new Date(); d.setDate(d.getDate()+days); setForm(f=>({...f, due: toInputDate(d)})); }
