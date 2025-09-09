// src/pages/Dashboard.jsx
import AppShell from '../components/AppShell';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import Gauge from '../components/ui/Gauge';

export default function Dashboard() {
  const [ov, setOv] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/overview');
        setOv(data);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Failed to load overview');
      }
    })();
  }, []);

  if (err) {
    return (
      <AppShell>
        <div className="page-wrap">
          <div className="card p-6 text-rose-300">{err}</div>
        </div>
      </AppShell>
    );
  }
  if (!ov) {
    return (
      <AppShell>
        <div className="page-wrap">
          <div className="card p-6 text-sm text-gray-400">Loading…</div>
        </div>
      </AppShell>
    );
  }

  const s = ov.applications?.statuses || {};
  const avgScoreText = Number.isFinite(ov?.essays?.avgScore)
    ? Number(ov.essays.avgScore).toFixed(1)
    : '—';

  // Derive rawScore for the gauge from whatever your API returns
  const rawScore =
    Number.isFinite(ov?.essays?.latest?.score) ? ov.essays.latest.score :
    Number.isFinite(ov?.essays?.avgScore)      ? ov.essays.avgScore :
    Number.isFinite(ov?.essays?.lastScore)     ? ov.essays.lastScore :
    null;

  return (
    <AppShell>
      <div className="container space-y-8">
        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-4">
          <Stat title="Essay Score" value={avgScoreText} helper="Latest AI preview" />
          <Stat
            title="Extracurriculars"
            value={`${ov.extracurriculars?.count ?? 0}`}
            helper={`Target ${ov.extracurriculars?.target ?? 6}`}
          />
          <Stat
            title="Applications"
            value={`${ov.applications?.total ?? 0}`}
            helper={`Drafting ${s.drafting || 0} • Submitted ${s.submitted || 0}`}
          />
          <Stat title="Wins" value={`${s.accepted || 0}`} helper="Accepted so far" />
        </div>

        {/* SUGGESTIONS + GAUGE */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="card-title">Suggestions</div>
            <ul className="mt-2 text-sm text-white/90 space-y-2">
              {(ov.suggestions || []).map((t, i) => (
                <li key={i}>⚠️ {t}</li>
              ))}
              {(!ov.suggestions || !ov.suggestions.length) && (
                <li className="text-gray-500">No suggestions right now.</li>
              )}
            </ul>
            <div className="mt-3 flex gap-2 text-sm">
              <Link to="/essays" className="btn btn-primary">Improve Essay</Link>
              <Link to="/extracurriculars" className="btn btn-outline">Add EC</Link>
              <Link to="/applications" className="btn btn-outline">Track Apps</Link>
            </div>
          </div>

          <div className="card p-5 flex items-center justify-center">
            <Gauge value={rawScore} />
          </div>
        </div>

        {/* DEADLINES */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="card-title">Upcoming Deadlines</div>
            <Link to="/applications" className="link">View All</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
            {(ov.deadlines || []).map((d) => (
              <div key={d.id} className="mini-card">
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(d.due).toDateString()}
                </div>
              </div>
            ))}
            {(!ov.deadlines || !ov.deadlines.length) && (
              <div className="text-sm text-gray-500">No deadlines yet.</div>
            )}
          </div>
        </div>

        {/* QUICK AI */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickPolish />
          <QuickEC />
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ title, value, helper }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1 text-white">{value}</div>
      {helper && <div className="text-xs text-gray-500 mt-1">{helper}</div>}
    </div>
  );
}

function QuickPolish() {
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    setBusy(true);
    try {
      const { data } = await api.post('/quickai/polish-paragraph', { text });
      setOut(data.output);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to run polish');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="card-title">⚡ Quick AI: Polish a Paragraph</div>
      <textarea
        className="input h-28 mt-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your paragraph..."
      />
      <div className="mt-2 flex gap-2 text-sm">
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? 'Working…' : 'Preview & Improve'}
        </button>
      </div>
      {err && <div className="mt-2 text-sm text-rose-300">{err}</div>}
      {out && <div className="note mt-3">{out}</div>}
    </div>
  );
}

function QuickEC() {
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    setBusy(true);
    try {
      const { data } = await api.post('/quickai/strengthen-ec', { description: text });
      setOut(data.output);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to run EC builder');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="card-title">⚡ Quick AI: Strengthen an EC</div>
      <textarea
        className="input h-28 mt-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Led robotics club…"
      />
      <div className="mt-2 flex gap-2 text-sm">
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? 'Working…' : 'Preview & Improve'}
        </button>
      </div>
      {err && <div className="mt-2 text-sm text-rose-300">{err}</div>}
      {out && <div className="note mt-3">{out}</div>}
    </div>
  );
}
