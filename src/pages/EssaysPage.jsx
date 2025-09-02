import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const PROMPTS = [
  { value: 'Common App', text: 'Common App Personal Essay: Share an essay on any topic of your choice...' },
  { value: 'UC PIQ #1', text: 'Describe an example of your leadership experience...' },
];

const splitSentences = (txt='') =>
  String(txt).replace(/\s+/g,' ').trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"(\[])/)
    .filter(Boolean);

export default function EssaysPage(){
  const [prompt, setPrompt] = useState(PROMPTS[0].value);
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [likes, setLikes] = useState([]);      // [{ index, text, why }]
  const [needs, setNeeds] = useState([]);      // [{ index, text, why }]
  const [err, setErr] = useState('');

  // Load draft
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/essays/draft');
        setText(data?.text || '');
        setScore(data?.score || 0);
      } catch (e) {
        setErr(e?.response?.data?.error || 'Failed to load draft');
      }
    })();
  }, []);

  // Autosave
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await api.post('/essays/draft', { text });
      } finally {
        setSaving(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [text]);

  const sentences = useMemo(() => splitSentences(text), [text]);

  async function runAI(){
    setErr('');
    try {
      const { data } = await api.post('/essays/grade', { text, prompt });
      setScore(data.score || 0);
      setLikes(data.likes || []);
      setNeeds(data.needsWork || []);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Scoring failed');
    }
  }

  const sentenceClass = (i) =>
    likes.find(x=>x.index===i) ? 'bg-green-100' :
    needs.find(x=>x.index===i) ? 'bg-yellow-100' : '';

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="text-sm">Prompt:</label>
          <select
            value={prompt}
            onChange={e=>setPrompt(e.target.value)}
            className="border rounded-xl px-3 py-1.5 text-sm"
          >
            {PROMPTS.map(p => <option key={p.value} value={p.value}>{p.value}</option>)}
          </select>
          <div className="text-sm text-green-600">{saving ? 'Saving…' : 'Saved'}</div>
          <button onClick={runAI} className="ml-auto px-4 py-1.5 rounded-xl bg-blue-600 text-white">
            ✦ Score (AI)
          </button>
        </div>

        <div className="bg-white rounded-2xl border p-3 text-sm text-gray-700 min-h-[64px]">
          {PROMPTS.find(p=>p.value===prompt)?.text}
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          className="w-full h-80 border rounded-2xl p-3 bg-white"
          placeholder="Write your essay here. We’ll highlight strong sentences (green) and areas to improve (yellow)."
        />

        <div className="text-xs text-gray-500">
          {sentences.length} sentences • {text.trim().split(/\s+/).filter(Boolean).length} words
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Box title="What’s working" tone="green">
            {likes.length
              ? likes.map((l,i)=>(<li key={i}><b>Sentence {l.index+1}:</b> {l.why}</li>))
              : <li className="text-gray-600">No highlights yet.</li>}
          </Box>
          <Box title="What needs work" tone="amber">
            {needs.length
              ? needs.map((l,i)=>(<li key={i}><b>Sentence {l.index+1}:</b> {l.why}</li>))
              : <li className="text-gray-600">No issues flagged yet.</li>}
          </Box>
        </div>

        <div className="bg-white border rounded-2xl p-3">
          <div className="font-medium mb-2">Sentence view</div>
          <div className="space-y-2 text-sm">
            {sentences.map((s,i)=> (
              <div key={i} className={`p-2 rounded border ${sentenceClass(i)}`}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-2xl border p-4">
          <div className="font-medium">Raw Essay Score</div>
          <div className="text-4xl font-semibold mt-2">{score}</div>
          <div className="text-xs text-gray-500">/100</div>
        </div>
        <div className="bg-white rounded-2xl border p-4">
          <div className="font-medium">Local AI Detection</div>
          <button className="mt-2 w-full border rounded-xl py-2">Re-run Detection</button>
        </div>
      </div>
    </div>
  );
}

function Box({ title, tone, children }){
  const toneCls = tone === 'green' ? 'bg-green-50' : 'bg-amber-50';
  return (
    <div className={`${toneCls} border rounded-2xl p-3`}>
      <div className="font-medium">{title}</div>
      <ul className="text-sm mt-2 space-y-2">{children}</ul>
    </div>
  );
}
