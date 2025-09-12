// (top of file remains the same)
import AppShell from '../components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const PROMPTS = [
  { value: 'Common App', text: 'Common App Personal Essay: Share an essay on any topic of your choice…' },
  { value: 'UC PIQ #1',  text: 'Describe an example of your leadership experience…' },
];

const split = (txt = '') =>
  String(txt)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"(\[])/)
    .filter(Boolean);

export default function EssaysPage() {
  const [prompt, setPrompt] = useState(PROMPTS[0].value);
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [likes, setLikes] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [err, setErr] = useState('');

  // NEW: SmartFrame state
  const [apps, setApps] = useState([]);
  const [sfSchoolId, setSfSchoolId] = useState('');
  const [frames, setFrames] = useState([]);

  useEffect(() => { api.get('/apps').then(({data})=> setApps(data||[])); }, []);

  // load draft
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/essays/draft');
        setText(data?.text || '');
        setScore(data?.score ?? 0);
      } catch (e) { setErr(e?.response?.data?.error || 'Failed to load draft'); }
    })();
  }, []);

  // autosave (debounced)
  useEffect(() => {
    const t = setTimeout(async () => { try { setSaving(true); await api.post('/essays/draft', { text }); } finally { setSaving(false); } }, 600);
    return () => clearTimeout(t);
  }, [text]);

  const sentences = useMemo(() => split(text), [text]);
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  async function runAI() {
    setErr('');
    try {
      const { data } = await api.post('/essays/grade', { text, prompt });
      setScore(data.score || 0);
      setLikes(data.likes || []);
      setNeeds(data.needsWork || []);
    } catch (e) { setErr(e?.response?.data?.error || 'Scoring failed'); }
  }

  // NEW: SmartFrame
  async function runSmartFrame(){
    setErr(''); setFrames([]);
    try {
      const { data } = await api.post('/quickai/smartframe', { prompt, schoolId: sfSchoolId||null, text });
      setFrames(data.frames||[]);
    } catch (e) { setErr(e?.response?.data?.error || 'SmartFrame failed'); }
  }
  function injectOutline(f){
    const head = `\n\n# Outline: ${f.name}\n`;
    const body = (f.outline||[]).map((t,i)=> `${i+1}. ${t}`).join('\n');
    setText(t => t + head + body + '\n');
  }

  const toneFor = (i) =>
    likes.find((x) => x.index === i)
      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
      : needs.find((x) => x.index === i)
      ? 'bg-amber-500/10 border-amber-400/30 text-amber-100'
      : 'bg-white/5 border-white/10 text-white/85';

  const promptText = PROMPTS.find((p) => p.value === prompt)?.text;

  return (
    <AppShell>
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          {/* LEFT: editor & panels (unchanged) */}
          <section className="space-y-4">
            <div className="card p-4 flex flex-wrap items-center gap-3">
              <div className="text-sm text-[#cbd3ea]">Prompt</div>
              <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="select">
                {PROMPTS.map((p) => (<option key={p.value} value={p.value}>{p.value}</option>))}
              </select>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-xs text-[#9fb0d8]">{saving ? 'Saving…' : 'Saved'}</span>
                <button onClick={runAI} className="btn btn-primary" disabled={!text.trim()} title={!text.trim() ? 'Paste your draft first' : 'Score with AI'}>✦ Score (AI)</button>
              </div>
            </div>
            {promptText && (<div className="card p-4 text-sm text-[#c6cce0]">{promptText}</div>)}
            {err && (<div className="card p-4 text-sm text-rose-300 border border-rose-500/40 bg-rose-500/10">{err}</div>)}
            <div className="card p-4">
              <textarea className="input h-96" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your essay here…"/>
              <div className="mt-2 text-xs text-[#9fb0d8]">{sentences.length} sentences • {words} words</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <GuidePanel title="What’s working" color="emerald">{likes.length ? likes.map((l,i)=>(<li key={i}><b>Sentence {l.index+1}:</b> {l.why}</li>)) : (<li className="text-[#9fb0d8]">No highlights yet.</li>)}</GuidePanel>
              <GuidePanel title="What needs work" color="amber">{needs.length ? needs.map((l,i)=>(<li key={i}><b>Sentence {l.index+1}:</b> {l.why}</li>)) : (<li className="text-[#9fb0d8]">No issues flagged.</li>)}</GuidePanel>
            </div>

            <div className="card">
              <div className="p-4 border-b border-white/10 text-[#cbd3ea]">Sentence view</div>
              <div className="p-4 space-y-2 text-sm">
                {sentences.map((s, i) => (<div key={i} className={`sentence-chip ${toneFor(i)}`}>{s}</div>))}
                {!sentences.length && (<div className="sentence-chip border-white/10 bg-white/5 text-[#9fb0d8]">Paste a draft to see sentence breakdown…</div>)}
              </div>
            </div>
          </section>

          {/* RIGHT: rail (adds SmartFrame) */}
          <aside className="space-y-4 lg:sticky lg:top-4 self-start">
            <div className="card p-5">
              <div className="text-sm text-[#cbd3ea]">Raw Essay Score</div>
              <div className="mt-2 inline-flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white leading-none">{score}</span>
                <span className="text-xs text-[#8ea0c9]">/100</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10 border border-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, score))}%`, background:'linear-gradient(90deg,#34d399,#60a5fa)' }} />
              </div>
            </div>

            {/* NEW: SmartFrame */}
            <div className="card p-5">
              <div className="text-sm text-[#cbd3ea]">SmartFrame™ Ideation</div>
              <select className="select mt-2 w-full" value={sfSchoolId} onChange={e=>setSfSchoolId(e.target.value)}>
                <option value="">Optional: choose a school</option>
                {apps.map(a=> (<option key={a.id} value={a.id}>{a.college}{a.deadline? ` — ${new Date(a.deadline).toLocaleDateString()}`:''}</option>))}
              </select>
              <button className="btn btn-primary w-full mt-3" onClick={runSmartFrame} disabled={!prompt}>Generate 3 frames</button>
              {!!frames.length && (
                <div className="mt-3 space-y-2 text-sm">
                  {frames.map((f,i)=>(
                    <div key={i} className="mini-card">
                      <div className="font-medium text-white/90">{f.name}</div>
                      <div className="text-xs text-[#9fb0d8] line-clamp-2">{f.thesis}</div>
                      <button className="btn btn-outline mt-2" onClick={()=>injectOutline(f)}>Insert outline</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="text-sm text-[#cbd3ea]">Local AI Detection</div>
              <button className="btn btn-outline w-full mt-3">Re-run Detection</button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function GuidePanel({ title, color = 'emerald', children }) {
  const colors = color === 'emerald' ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-amber-500/5 border-amber-400/20';
  return (
    <div className={`card p-4 ${colors}`}>
      <div className="text-sm text-white/90">{title}</div>
      <ul className="text-sm mt-2 space-y-2">{children}</ul>
    </div>
  );
}
