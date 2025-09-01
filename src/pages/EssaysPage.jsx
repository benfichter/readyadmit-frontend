import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { PrettyAIButton } from './ApplicationWorkspace';
import '../styles/essay-highlights.css';


function splitSentences(txt = '') {
const parts = String(txt).replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z0-9“"(\[])/);
return parts.filter(Boolean);
}


function gaugeColor(score) {
if (score >= 90) return '#16a34a';
if (score >= 75) return '#22c55e';
if (score >= 50) return '#f59e0b';
return '#dc2626';
}


export default function EssaysPage() {
const [draft, setDraft] = useState('');
const [score, setScore] = useState(null);
const [saving, setSaving] = useState(false);


// Load latest draft
useEffect(() => {
api.get('/essays/draft').then(({ data }) => {
setDraft(data?.text || '');
setScore(data?.score ?? null);
});
}, []);


// Autosave
useEffect(() => {
const t = setTimeout(async () => {
if (draft == null) return;
setSaving(true);
await api.post('/essays/draft', { text: draft });
setSaving(false);
}, 600);
return () => clearTimeout(t);
}, [draft]);


const sentences = useMemo(() => splitSentences(draft), [draft]);


async function grade() {
const { data } = await api.post('/essays/grade', { text: draft });
setScore(data.score);
}


return (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h1 className="text-2xl font-semibold">Essays</h1>
<div className="flex items-center gap-3 text-sm">
<div className="text-gray-600">{saving ? 'Saving…' : 'Saved'}</div>
<PrettyAIButton onClick={grade}>Score (0–100)</PrettyAIButton>
</div>
</div>


{score != null && (
<div className="rounded-xl border bg-white p-4 flex items-center gap-4">
<div className="text-3xl font-bold" style={{ color: gaugeColor(score) }}>{score}</div>
<div className="text-sm text-gray-600">higher is better</div>
</div>
)}


<div className="grid md:grid-cols-2 gap-4">
<textarea
value={draft}
onChange={(e) => setDraft(e.target.value)}
className="w-full h-80 border rounded-xl p-3 bg-white"
placeholder="Paste your draft here…"
/>


<div className="bg-white border rounded-xl p-3">
<h2 className="font-medium mb-2">Sentence view</h2>
<div className="space-y-2 text-sm">
{sentences.map((s, i) => (
<div key={i} className="p-2 rounded bg-gray-50 border">{s}</div>
))}
</div>
</div>
</div>
</div>
);
}