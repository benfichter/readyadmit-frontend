import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const [ov, setOv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/overview');
        setOv(data);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-500 p-4">Loading…</div>;
  if (err) return <div className="text-sm text-red-600 p-4">{err}</div>;
  if (!ov) return null;

  const s = ov.applications?.statuses || {};

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Stat title="Essays" value={(ov.essays?.avgScore ?? 0).toFixed(1)} helper="Based on latest AI preview" />
        <Stat title="Extracurriculars" value={`${ov.extracurriculars?.count ?? 0}`} helper={`Aim for ${ov.extracurriculars?.target ?? 6} strong ECs`} />
        <Stat title="Applications" value={`${ov.applications?.total ?? 0} total`} helper={`Drafting ${s.drafting||0} • Submitted ${s.submitted||0}`} />
        <Stat title="Wins" value={`${s.accepted || 0}`} helper={`Submitted ${s.submitted||0} • Drafting ${s.drafting||0}`} />
      </div>

      {/* Suggestions + Gauge */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl border p-4">
          <div className="font-medium mb-2">Suggestions</div>
          <ul className="text-sm text-gray-700 space-y-2">
            {(ov.suggestions || []).map((t, i) => <li key={i}>⚠️ {t}</li>)}
            {(!ov.suggestions || !ov.suggestions.length) && <li className="text-gray-500">No suggestions right now.</li>}
          </ul>
          <div className="mt-3 flex gap-2 text-sm">
            <Link to="/essays" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white">Improve Essay</Link>
            <Link to="/extracurriculars" className="px-3 py-1.5 rounded-xl border">Add EC</Link>
            <Link to="/applications" className="px-3 py-1.5 rounded-xl border">Track Apps</Link>
          </div>
        </div>
        <Gauge value={ov.essays?.avgScore ?? 0} />
      </div>

      {/* Upcoming deadlines */}
      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Upcoming Deadlines</div>
          <Link to="/applications" className="text-sm">View All</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {(ov.deadlines || []).map(d => (
            <div key={d.id} className="rounded-xl border p-3">
              <div className="text-sm font-medium">{d.title}</div>
              <div className="text-xs text-gray-500">{new Date(d.due).toDateString()}</div>
            </div>
          ))}
          {(!ov.deadlines || !ov.deadlines.length) && (
            <div className="text-sm text-gray-500">No deadlines on file.</div>
          )}
        </div>
      </div>

      {/* Quick AI panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <QuickPolish />
        <QuickEC />
      </div>
    </div>
  );
}

function Stat({ title, value, helper }) {
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {helper && <div className="text-xs text-gray-500 mt-1">{helper}</div>}
    </div>
  );
}

function Gauge({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value)));
  const angle = (v / 100) * 180;
  const color = v >= 90 ? '#16a34a' : v >= 75 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#dc2626';
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="text-sm text-gray-600 mb-2">Raw Essay Score</div>
      <div className="relative w-full" style={{ height: 120 }}>
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <path d="M10 110 A 90 90 0 0 1 190 110" fill="none" stroke="#e5e7eb" strokeWidth="16" />
          <path d={`M10 110 A 90 90 0 ${angle > 90 ? 1 : 0} 1 ${10 + 180 * (v / 100)} 110`} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
          <text x="100" y="100" textAnchor="middle" fontSize="28" fill="#111827">{v}</text>
          <text x="100" y="115" textAnchor="middle" fontSize="10" fill="#6b7280">/ 100</text>
        </svg>
      </div>
    </div>
  );
}

function QuickPolish(){
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  async function run(){
    setLoading(true);
    try {
      const { data } = await api.post('/quickai/polish-paragraph', { text });
      setOut(data.output);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="font-medium">⚡ Quick AI: Polish a Paragraph</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-2 border rounded-xl p-2 h-28" placeholder="Paste your paragraph..." />
      <div className="mt-2 flex gap-2 text-sm">
        <button onClick={run} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white" disabled={loading}>
          {loading ? 'Working…' : 'Preview & Improve'}
        </button>
        <Link to="/essays" className="px-3 py-1.5 rounded-xl border">Open Essays</Link>
      </div>
      {out && <div className="mt-3 text-sm bg-blue-50 border rounded-xl p-3 whitespace-pre-wrap">{out}</div>}
    </div>
  );
}

function QuickEC(){
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [loading, setLoading] = useState(false);
  async function run(){
    setLoading(true);
    try {
      const { data } = await api.post('/quickai/strengthen-ec', { description: text });
      setOut(data.output);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className="font-medium">⚡ Quick AI: Strengthen an EC</div>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full mt-2 border rounded-xl p-2 h-28" placeholder="e.g., Led robotics club..." />
      <div className="mt-2 flex gap-2 text-sm">
        <button onClick={run} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white" disabled={loading}>
          {loading ? 'Working…' : 'Preview & Improve'}
        </button>
        <Link to="/extracurriculars" className="px-3 py-1.5 rounded-xl border">Open ECs</Link>
      </div>
      {out && <div className="mt-3 text-sm bg-green-50 border rounded-xl p-3 whitespace-pre-wrap">{out}</div>}
    </div>
  );
}
