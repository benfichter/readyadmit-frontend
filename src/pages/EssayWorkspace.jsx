// src/pages/EssayWorkspace.jsx
import AppShell from '../components/AppShell';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import MenuSelect from '../components/ui/MenuSelect';
import '../styles/essay-highlights.css';

const countWords = (t = '') => String(t).trim().split(/\s+/).filter(Boolean).length;

export default function EssayWorkspace() {
  const navigate = useNavigate();
  const { sid } = useParams();               // /essaysworkspace/s/:sid for supplementals
  const isMain = !sid;                       // /essaysworkspace for Common App

  // Apps (for global picker)
  const [apps, setApps] = useState([]);
  const [picker, setPicker] = useState({ items: [], idx: 0 });

  // Draft + meta
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [err, setErr] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const textRef = useRef(null);
  const overlayRef = useRef(null);
  const preRef = useRef(null);
  const wrapRef = useRef(null);
  const [tip, setTip] = useState({ show: false, text: '', left: 0, top: 0 });
  const activeSpanRef = useRef(null);

  // Insights (for score details)
  const [likes, setLikes] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [categories, setCategories] = useState({});

  // Metadata (status + wordLimit live in header; Common App stored locally)
  const [meta, setMeta] = useState({
    title: 'Common App',
    wordLimit: 650,
    appName: '',
    appId: null,
    status: 'drafting',
  });
  const [metaDirty, setMetaDirty] = useState(false);
  const metaSaveTimer = useRef(null);

  /* Load apps */
  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/apps'); setApps(data || []); }
      catch (e) { console.warn('Failed to load apps', e?.response?.data || e.message); }
    })();
  }, []);

  /* Build global picker */
  useEffect(() => {
    const items = [{ key: 'main', kind: 'main', label: 'Common App Personal Essay', sub: 'Main', go: () => navigate('/essaysworkspace') }];
    for (const a of apps) for (const s of (a.supplementals || [])) {
      items.push({ key: s.id, kind: 'supp', label: s.title || 'Prompt', sub: a.college || 'Application', wordLimit: s.wordLimit ?? null, appId: a.id, go: () => navigate(`/essaysworkspace/s/${s.id}`) });
    }
    const idx = items.findIndex(x => (isMain ? x.kind === 'main' : x.key === sid));
    setPicker({ items, idx: idx >= 0 ? idx : 0 });
  }, [apps, sid, isMain, navigate]);

  /* Build items for custom essay dropdown */
  const essayItems = useMemo(() => {
    const arr = [{ value: 'main', label: 'Common App Personal Essay' }];
    for (const a of apps) for (const s of (a.supplementals || [])) {
      arr.push({ value: s.id, label: `${s.title || 'Prompt'} — ${a.college || 'Application'}` });
    }
    return arr;
  }, [apps]);

  /* Load current essay */
  useEffect(() => {
    (async () => {
      try {
        setErr('');
        if (isMain) {
          const { data } = await api.get('/essays/draft');
          setText(data?.text || '');
          setScore(data?.score ?? 0);
          setLikes(data?.likes || []);
          setNeeds(data?.needsWork || []);
          setCategories(data?.categories || {});
          setPrompt('Common App Personal Essay: Share an essay on any topic of your choice…');
          const def = { title: 'Common App', wordLimit: 650, appName: '—', appId: null, status: 'drafting' };
          try { const saved = JSON.parse(localStorage.getItem('mainEssayMeta') || 'null'); setMeta(saved ? { ...def, ...saved } : def); }
          catch { setMeta(def); }
        } else {
          const { data } = await api.get(`/supplementals/${sid}`);
          setText(data?.response || '');
          setScore(data?.score ?? 0);
          const fb = data?.feedback || {};
          setLikes(fb.likes || []);
          setNeeds(fb.needsWork || []);
          setCategories(fb.categories || {});
          setPrompt(data?.prompt || '');
          setMeta({
            title: data?.title || 'Supplemental',
            wordLimit: data?.wordLimit ?? null,
            appName: data?.appCollege || '',
            appId: data?.appId || null,
            status: data?.status || 'drafting',
          });
        }
      } catch (e) { setErr(e?.response?.data?.error || 'Failed to load'); }
    })();
  }, [sid, isMain]);

  /* Autosave text */
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        if (isMain) await api.post('/essays/draft', { text, status: meta.status });
        else await api.put(`/supplementals/${sid}`, { response: text });
      } catch (e) { console.warn('Autosave failed', e?.response?.data || e.message); }
      finally { setSaving(false); }
    }, 700);
    return () => clearTimeout(t);
  }, [text, isMain, sid, meta.status]);

  /* Save status/limit (CA → local; supp → server) */
  useEffect(() => {
    if (!metaDirty) return;
    if (metaSaveTimer.current) clearTimeout(metaSaveTimer.current);
    metaSaveTimer.current = setTimeout(async () => {
      try {
        if (isMain) localStorage.setItem('mainEssayMeta', JSON.stringify({ title: meta.title, wordLimit: meta.wordLimit, status: meta.status }));
        else await api.put(`/supplementals/${sid}`, { status: meta.status, wordLimit: meta.wordLimit ?? null });
      } catch (e) { console.warn('Meta save failed', e?.response?.data || e.message); }
      finally { setMetaDirty(false); }
    }, 450);
    return () => metaSaveTimer.current && clearTimeout(metaSaveTimer.current);
  }, [metaDirty, meta.wordLimit, meta.status, isMain, sid]);

  /* Scoring + Local detect */
  async function runAI() {
    setErr('');
    setScoring(true);
    try {
      const { data } = await api.post('/essays/grade', {
        text,
        prompt: isMain ? 'Common App' : (meta.title || 'Supplemental'),
        supplementalId: isMain ? undefined : sid
      });
      setScore(data.score || 0);
      setLikes(data.likes || []);
      setNeeds(data.needsWork || []);
      setCategories(data.categories || {});
    } catch (e) { setErr(e?.response?.data?.error || 'Scoring failed'); }
    finally { setScoring(false); }
  }
  async function runLocalDetect() { try { console.info('Local detect triggered'); } catch (e) { console.warn('Local detect failed', e?.response?.data || e.message); } }

  /* Helpers */
  const words = useMemo(() => countWords(text), [text]);
  const overLimit = useMemo(() => meta.wordLimit ? words > meta.wordLimit : false, [words, meta.wordLimit]);
  
  // Keep overlay perfectly aligned across zoom/scroll by copying computed styles
  useEffect(() => {
    const ta = textRef.current; const pre = preRef.current; const ov = overlayRef.current;
    if (!ta || !pre || !ov) return;

    const copyStyles = () => {
      const cs = window.getComputedStyle(ta);
      const props = [
        'font-family','font-size','font-weight','font-style','font-stretch','line-height',
        'letter-spacing','word-spacing','text-indent','text-transform','text-rendering',
        'font-kerning','font-variant-ligatures','font-feature-settings','tab-size',
        'white-space','word-break','overflow-wrap','box-sizing'
      ];
      props.forEach(p => { pre.style.setProperty(p, cs.getPropertyValue(p)); });
      pre.style.whiteSpace = 'pre-wrap';
      // Mirror padding including scrollbar compensation on the right
      const pr = parseFloat(cs.paddingRight) || 0;
      const sbw = ta.offsetWidth - ta.clientWidth; // scrollbar width
      pre.style.paddingTop = cs.paddingTop;
      pre.style.paddingLeft = cs.paddingLeft;
      pre.style.paddingBottom = cs.paddingBottom;
      pre.style.paddingRight = `${pr + sbw}px`;
      // Radius for visual coherence
      pre.style.borderRadius = cs.borderRadius;
    };

    const syncScroll = () => {
      // Move highlight content opposite of textarea scroll
      pre.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
    };

    copyStyles();
    syncScroll();

    const ro = new ResizeObserver(() => { copyStyles(); syncScroll(); });
    ro.observe(ta);
    ta.addEventListener('scroll', syncScroll, { passive: true });
    window.addEventListener('resize', copyStyles);
    return () => {
      ro.disconnect();
      ta.removeEventListener('scroll', syncScroll);
      window.removeEventListener('resize', copyStyles);
    };
  }, []);

  // Build highlight HTML from likes/needs (expects start/end indexes)
  const highlightHTML = useMemo(() => {
    try {
      const hs = [];
      for (const l of likes || []) if (Number.isFinite(l?.start) && Number.isFinite(l?.end)) hs.push({ start: Math.max(0, l.start), end: Math.min((text||'').length, l.end), kind: 'good', why: l.why || '' });
      for (const n of needs || []) if (Number.isFinite(n?.start) && Number.isFinite(n?.end)) hs.push({ start: Math.max(0, n.start), end: Math.min((text||'').length, n.end), kind: 'meh',  why: n.why || '' });
      if (!hs.length) return (text || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
      hs.sort((a,b)=> a.start - b.start || a.end - b.end);
      const clamp = (v) => Math.max(0, Math.min((text||'').length, v|0));
      let html = '';
      let i = 0;
      const esc = (s) => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
      for (const h of hs) {
        const s = clamp(h.start), e = clamp(h.end);
        if (e <= i || e <= s) continue;
        if (s > i) html += esc((text || '').slice(i, s));
        const seg = esc((text || '').slice(s, e));
        const hint = esc(h.why || '');
        html += `<span class="hl ${h.kind === 'good' ? 'hl-good' : 'hl-meh'}" data-hint="${hint}" data-start="${s}" data-end="${e}">${seg}</span>`;
        i = e;
      }
      if (i < (text||'').length) html += esc((text || '').slice(i));
      return html;
    } catch { return (text || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  }, [text, likes, needs]);

  // Confetti burst when score increases
  const prevScoreRef = useRef(null);
  useEffect(() => {
    if (prevScoreRef.current == null) { prevScoreRef.current = score; return; }
    if (score > prevScoreRef.current) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1500);
      prevScoreRef.current = score;
      return () => clearTimeout(t);
    }
    prevScoreRef.current = score;
  }, [score]);

  // Forward clicks on highlights to textarea so typing isn't blocked
  const onHLMouseDown = (e) => {
    let el = e.target && e.target.closest ? e.target.closest('.hl') : null;
    if (!el && typeof document !== 'undefined') {
      const probe = document.elementFromPoint(e.clientX, e.clientY);
      el = probe && probe.closest ? probe.closest('.hl') : null;
    }
    if (!el) return; // let clicks pass to textarea
    e.preventDefault();
    const ta = textRef.current;
    if (!ta) return;
    const s = Number(el.getAttribute('data-start'));
    const en = Number(el.getAttribute('data-end'));
    try {
      if (Number.isFinite(s) && Number.isFinite(en)) ta.setSelectionRange(s, en);
    } catch {}
    ta.focus();
    // also pin tooltip on click
    activeSpanRef.current = el;
    placeTooltipForSpan(el);
  };

  // Tooltip placement helpers
  const getLineHeightPx = (el) => {
    const cs = getComputedStyle(el);
    const lh = cs.lineHeight;
    if (lh.endsWith && lh.endsWith('px')) return parseFloat(lh) || 0;
    const fs = parseFloat(cs.fontSize) || 16;
    return fs * 1.5;
  };
  const placeTooltipForSpan = (span) => {
    const wrap = wrapRef.current; const ta = textRef.current;
    if (!wrap || !ta || !span) return;
    const wrapRect = wrap.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    const lh = getLineHeightPx(ta);
    const left = spanRect.left + spanRect.width/2 - wrapRect.left;
    // uniform spacing ~1.25 line-heights above the sentence
    const top  = spanRect.top - wrapRect.top - (1.25*lh);
    const cl = Math.max(12, Math.min(left, wrapRect.width - 12));
    const ct = Math.max(8, top);
    setTip({ show: true, text: span.getAttribute('data-hint') || '', left: cl, top: ct });
  };
  const hideTip = () => { activeSpanRef.current = null; setTip(t => (t.show ? { ...t, show: false } : t)); };

  // Hover handlers on wrapper (works even with overlay click-through)
  const onHoverMove = (e) => {
    let el = e.target && e.target.closest ? e.target.closest('.hl') : null;
    if (!el && typeof document !== 'undefined') {
      const probe = document.elementFromPoint(e.clientX, e.clientY);
      el = probe && probe.closest ? probe.closest('.hl') : null;
    }
    if (!el) { if (tip.show) hideTip(); return; }
    activeSpanRef.current = el; placeTooltipForSpan(el);
  };
  const onHoverLeave = () => hideTip();

  const prevEssay = () => { if (picker.items.length < 2) return; const i = (picker.idx - 1 + picker.items.length) % picker.items.length; picker.items[i].go(); };
  const nextEssay = () => { if (picker.items.length < 2) return; const i = (picker.idx + 1) % picker.items.length; picker.items[i].go(); };
  const jumpTo = (key) => { const item = picker.items.find(x => x.key === key || (key === 'main' && x.kind === 'main')); if (item) item.go(); };

  const copyToClipboard = async () => { try { await navigator.clipboard.writeText(text || ''); } catch {} };
  const downloadTxt = () => {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${isMain ? 'CommonApp' : (meta.title || 'Supplemental')}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  /* Render */
  return (
    <AppShell>
      <div className="page-wrap essay-ws">
        <div className="editor-wrap">

          {/* ================= Top bar (two rows) ================= */}
          <div className="card editor-topbar editor-top" style={{ display: 'grid', gap: '0.6rem', overflow: 'visible' }}>
            {/* Row 1: selector + arrows + words/limit + status (single line, NO CLIPPING) */}
            <div className="flex items-center gap-2 flex-nowrap w-full" style={{ overflow: 'visible' }}>
              {/* Essay chooser dynamically fills remaining space (custom menu) */}
              <div className="flex-1 min-w-0">
                <MenuSelect
                  className="w-full"
                  value={isMain ? 'main' : sid}
                  onChange={(val)=> jumpTo(val)}
                  items={essayItems}
                />
              </div>

              {/* Prev/Next */}
              <div className="flex items-center gap-1 shrink-0">
                <button className="btn btn-outline" onClick={prevEssay} title="Previous essay">←</button>
                <button className="btn btn-outline" onClick={nextEssay} title="Next essay">→</button>
              </div>

              {/* words: ### / [limit input] */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#9fb0d8]">words:</span>
                <span style={{ fontWeight: 800, color: '#e8eaf2' }}>{words}</span>
                <span className="text-xs text-[#9fb0d8]">/</span>
                <input
                  type="number"
                  className="select"
                  style={{ width: 120, textAlign: 'center', fontWeight: 700 }}
                  value={meta.wordLimit ?? ''}
                  onChange={(e)=>{
                    const v = e.target.value === '' ? null : Number(e.target.value);
                    setMeta(m => ({...m, wordLimit: v}));
                    setMetaDirty(true);
                  }}
                  placeholder="650"
                  aria-label="Word limit"
                />
              </div>

              {/* Status (custom Notion-like dropdown with purple dot) */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-[#9fb0d8]">status:</span>
                <MenuSelect
                  className="w-[160px]"
                  value={meta.status}
                  onChange={(val)=>{ setMeta(m => ({...m, status: val})); setMetaDirty(true); }}
                  items={[
                    { value: 'drafting', label: 'Drafting' },
                    { value: 'editing',  label: 'Editing'  },
                    { value: 'final',    label: 'Final'    },
                  ]}
                />
              </div>
            </div>

            {/* Row 2: actions equally spaced across the bar (Saved as a full cell) */}
            <div
              className="editor-actions"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
                alignItems: 'center',
                justifyItems: 'center',
                gap: '.6rem',
                overflow: 'visible',
                padding: '2px .4rem'
              }}
            >
              {/* Saved / Saving no pill but has pill styling properties to balance layout */}
              <div
                className="btn save-indicator"
                role="status"
                style={{ width: '100%', justifyContent: 'center', pointerEvents: 'none' }}
                title={saving ? 'Saving' : 'Saved'}
              >
                {saving ? (
                  <>
                    <span className="spinner" />
                    <span className="text-xs">Saving…</span>
                  </>
                ) : (
                  <>
                    <span
                      className="save-dot"
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '999px',
                        background: '#34d399',
                        boxShadow: '0 0 0 4px rgba(52, 211, 153, .24)',
                      }}
                    />
                    <span className="text-xs text-[#9fb0d8]">Saved</span>
                  </>
                )}
              </div>

              <button onClick={runAI} className="btn btn-primary" disabled={!text.trim() || scoring} style={{ width: '100%' }}>
                ✦ Score (AI)
              </button>
              <button onClick={copyToClipboard} className="btn btn-outline" style={{ width: '100%' }}>
                Copy
              </button>
              <button onClick={downloadTxt} className="btn btn-outline" style={{ width: '100%' }}>
                Download .txt
              </button>
              <button onClick={runLocalDetect} className="btn btn-outline" style={{ width: '100%' }}>
                Local AI Detection
              </button>
            </div>
          </div>

          {/* ================= Content (full-width) ================= */}
          <section className="space-y-4 editor-left" style={{ gridColumn: '1 / -1' }}>
            {/* Prompt + Score card */}
            <div className="editor-meta">
              {/* Prompt */}
              <div className="card p-4">
                <div className="text-sm text-[#cbd3ea] mb-2">{isMain ? 'Prompt (local)' : 'Prompt'}</div>
                <textarea
                  className="input"
                  value={prompt}
                  onChange={(e)=>{ setPrompt(e.target.value); setMetaDirty(true); }}
                  placeholder={isMain ? 'Optionally add a personal prompt focus… (not saved to server, used for scoring only)' : 'Paste the official prompt…'}
                  style={{ minHeight: 120 }}
                />
                {isMain && (
                  <div className="mt-2 text-xs text-[#9fb0d8]">
                    This prompt is local (not saved to server). It’s used when scoring the main essay.
                  </div>
                )}
              </div>

              {/* Score Card */}
              <div className="score-card">
                <div className="text-sm text-[#cbd3ea]">Raw Essay Score</div>
                <div className="score-row mt-2">
                  <span className="score-num">{Math.max(0, Math.min(100, score))}</span>
                  <span className="score-den">/100</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar" style={{ '--score': `${Math.max(0, Math.min(100, score))}%` }} />
                  {showConfetti && (
                    <div className="confetti" aria-hidden>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const left = Math.random() * 100;
                        const delay = Math.random() * 0.3;
                        const hue = 180 + Math.random() * 160;
                        const rot = (Math.random() * 360 - 180).toFixed(0);
                        return <i key={i} className="piece" style={{ left: `${left}%`, ['--delay']: `${delay}s`, ['--hue']: hue, ['--rot']: `${rot}deg` }} />;
                      })}
                    </div>
                  )}
                </div>
                <details className="disclosure">
                  <summary>Score Details</summary>
                  <div className="panel">
                    <div className="text-sm text-[#cbd3ea] mb-2">Category Breakdown</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {[
                        ['Content','content'], ['Structure','structure'], ['Voice','voice'],
                        ['Clarity','clarity'], ['Specificity','specificity'], ['Reflection','reflection']
                      ].map(([label,key])=>{
                        const raw = Math.max(0, Math.min(100, Number(categories?.[key] ?? 0)));
                        const ten = Math.max(0, Math.min(10, raw / 10));
                        return (
                          <div key={key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs text-[#cbd3ea]">
                              <span>{label}</span>
                              <span>{ten.toFixed(1)}/10</span>
                            </div>
                            <div className="score-bar cat" style={{ '--score': `${raw}%` }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-sm text-[#cbd3ea] mb-1">What’s working</div>
                    <ul className="list-disc pl-5 mb-3">
                      {likes?.length ? likes.map((l, i) => <li key={i}>{l?.why ?? String(l)}</li>) : <li className="text-[#9fb0d8]">No highlights yet.</li>}
                    </ul>
                    <div className="text-sm text-[#cbd3ea] mb-1">What needs work</div>
                    <ul className="list-disc pl-5">
                      {needs?.length ? needs.map((l, i) => <li key={i}>{l?.why ?? String(l)}</li>) : <li className="text-[#9fb0d8]">No issues flagged.</li>}
                    </ul>
                  </div>
                </details>
              </div>
            </div>

            {/* Editor — full width */}
            <div className="card p-4">
              <div className="editor-hl-wrap" ref={wrapRef} onMouseDown={onHLMouseDown} onMouseMove={onHoverMove} onMouseLeave={onHoverLeave}>
                <div className="hl-surface" ref={overlayRef} aria-hidden>
                  <pre className="hl-pre" ref={preRef} dangerouslySetInnerHTML={{ __html: highlightHTML }} />
                </div>
                <textarea
                  ref={textRef}
                className={`input editor-text big ${overLimit ? 'input-invalid' : ''}`}
                value={text}
                onChange={(e)=>setText(e.target.value)}
                placeholder="Write your essay here. We’ll keep it saved as you type."
                  style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
              />
                {tip.show && (
                  <div className="hl-tip" style={{ left: tip.left, top: tip.top }}>
                    {tip.text}
                  </div>
                )}
              </div>
              <div className="meta-mini">
                {meta.wordLimit && overLimit && <span>{`Over limit by ${words - meta.wordLimit}`}</span>}
              </div>
            </div>

            {err && (
              <div className="card p-4 text-sm text-rose-300 border border-rose-500/40 bg-rose-500/10">
                {err}
              </div>
            )}
          </section>
        </div>
      </div>
      {scoring && (
        <div className="ai-overlay" role="status" aria-live="polite" aria-label="Analyzing your essay">
          <div className="ai-panel">
            <div className="ai-loader"><span></span><span></span><span></span></div>
            <div className="ai-text">Analyzing your essay…</div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

