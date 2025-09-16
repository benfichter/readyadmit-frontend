// src/pages/AdmitLens.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../lib/api';
import MenuSelect from '../components/ui/MenuSelect';

const toItems = (arr=[]) => arr.map(a => ({ value: a.id, label: a.title || a.college || a.name || `Item ${a.id}` }));

export default function AdmitLens(){
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [essays, setEssays] = useState([]);
  const [activities, setActivities] = useState([]);

  const [selectedApp, setSelectedApp] = useState('');
  const [selectedEssay, setSelectedEssay] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I’m AdmitLens. Ask me anything about your **whole** application — essays, activities, deadlines, strategy. I’ll reference your data and give concrete suggestions." }
  ]);

  const listRef = useRef(null);
  const typingTimerRef = useRef(null);

  const appItems = useMemo(()=> [{value:'',label:'All apps'}].concat(toItems(apps)), [apps]);
  const essayItems = useMemo(()=> [{value:'',label:'All essays'}].concat(toItems(essays)), [essays]);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try{
        try {
          const { data } = await api.get('/ai/context');
          setApps(data?.apps || []);
          setEssays(data?.essays || []);
          setActivities(data?.activities || []);
        } catch {
          const { data: appsList } = await api.get('/apps');
          const supLists = await Promise.all(
            (appsList || []).map(a => api.get(`/apps/${a.id}`).then(r => r.data?.supplementals || []).catch(()=>[]))
          );
          const supplementals = supLists.flat().map(s => ({
            id: s.id, title: s.title || 'Supplemental Essay', text: s.response || '', appId: s.appId || s.app_id || null,
          }));
          let mainEssay = null;
          try {
            const { data } = await api.get('/essays/main');
            if (data?.text != null) mainEssay = { id: data.id || 'main', title: 'Common App Personal Essay', text: data.text, appId: null };
          } catch {}
          const { data: ecs } = await api.get('/extracurriculars');
          setApps(appsList || []);
          setEssays([ ...(mainEssay ? [mainEssay] : []), ...supplementals ]);
          setActivities(ecs || []);
        }
      } finally{
        setLoading(false);
      }
    })();
  },[]);

  // keep scroll pinned to bottom
  useEffect(()=>{
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  const presets = [
    "What needs the most work in my application?",
    "I'm over the character limit—what should I cut without losing substance?",
    "Do my activities show leadership and impact, or just participation?",
  ];

  // --- typing animation ---
  function typeAssistant(fullText){
    // cancel any previous typing interval
    if (typingTimerRef.current) { clearInterval(typingTimerRef.current); typingTimerRef.current = null; }

    // append an empty assistant bubble, then fill it
    setMessages(xs => [...xs, { role: 'assistant', content: '' }]);

    let i = 0;
    const STEP = 3;        // chars per tick
    const INTERVAL = 12;   // ms per tick

    typingTimerRef.current = setInterval(() => {
      i = Math.min(fullText.length, i + STEP);
      const chunk = fullText.slice(0, i);
      setMessages(xs => {
        const ys = xs.slice();
        ys[ys.length - 1] = { role: 'assistant', content: chunk };
        return ys;
      });
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      if (i >= fullText.length) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, INTERVAL);
  }

  async function sendMessage(text){
    const content = (text ?? input).trim();
    if (!content) return;
    setInput('');
    setMessages((xs)=>[...xs, { role:'user', content }]);
    setSending(true);
    try{
      const recent = [...messages, { role:'user', content }].slice(-12);
      const { data } = await api.post('/ai/chat', {
        messages: recent,
        appId: selectedApp || null,
        essayId: selectedEssay || null,
      });
      const assistant = data?.message || data?.answer || "Sorry — I couldn't generate a reply.";
      typeAssistant(assistant); // animate
    } catch {
      setMessages((xs)=>[...xs, { role:'assistant', content: "Something went wrong. Try again in a moment." }]);
    } finally {
      setSending(false);
    }
  }

  function onPresetClick(p){
    setInput(p);
    sendMessage(p);
  }

  return (
    <AppShell>
      <div className="page-wrap mt-[-8px]">
        {/* fixed width, internal scroll, comfy padding */}
        <div className="card overflow-hidden max-w-[1100px] mx-auto h-[78vh] flex flex-col">
          {/* Header */}
          <div className="card-header px-4">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <div className="text-lg font-semibold">AdmitLens™</div>
              <div className="ml-auto flex items-center gap-2 min-w-0">
                <div className="w-44 sm:w-48 min-w-0">
                  <MenuSelect
                    value={selectedApp}
                    onChange={setSelectedApp}
                    items={[{value:'',label:'All apps'}, ...appItems.slice(1)]}
                    className="ms-flat w-full"
                  />
                </div>
                <div className="w-52 sm:w-56 min-w-0">
                  <MenuSelect
                    value={selectedEssay}
                    onChange={setSelectedEssay}
                    items={[{value:'',label:'All essays'}, ...essayItems.slice(1)]}
                    className="ms-flat w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Body (scrollable message list) */}
          <div className="card-body flex-1 min-h-0 pt-2 px-4 overflow-hidden">
            <div className="flex flex-col h-full min-h-0">
              {/* Message list */}
              <div
                ref={listRef}
                className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1"
                style={{ scrollBehavior: 'smooth', scrollbarGutter: 'stable', overscrollBehavior: 'contain' }}
              >
                {messages.map((m, i) => (<ChatBubble key={i} role={m.role} content={m.content} />))}
                {sending && <div className="text-xs subtle">Thinking…</div>}
              </div>

              {/* Suggestions ABOVE the composer (small purple bullets) */}
                <div className="mt-2 mb-3 flex flex-wrap justify-center gap-2">
                {presets.map((p, i) => (
                    <button
                    key={i}
                    type="button"
                    className="chip"
                    onClick={() => onPresetClick(p)}
                    title="Insert and send"
                    >
                    {p}
                    </button>
                ))}
                </div>

            </div>
          </div>

          {/* Composer (extra padding so button/textarea don’t touch edges) */}
          <div className="card-footer px-4 pb-4 pt-2">
            <form
              className="flex items-center gap-3 w-full min-w-0"
              onSubmit={(e)=>{ e.preventDefault(); sendMessage(); }}
            >
              <div className="flex-1 min-w-0">
                <textarea
                  className="input w-full"
                  placeholder="Ask me anything about your apps, essays, ECs, strategy…"
                  value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                  style={{ minHeight: 56, maxHeight: 180, resize: 'vertical' }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary shrink-0 px-4"
                disabled={sending || !input.trim()}
                style={{ height: 44 }}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ChatBubble({ role, content }){
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="rounded-2xl px-3 py-2 text-sm leading-6 max-w-full sm:max-w-[72ch] break-words"
        style={{
          background: isUser ? 'linear-gradient(90deg, var(--violet), var(--blue))' : 'rgba(255,255,255,.05)',
          color: isUser ? 'white' : 'var(--text)',
          boxShadow: 'var(--shadow-1)'
        }}
        dangerouslySetInnerHTML={{ __html: mdToHtml(content) }}
      />
    </div>
  );
}

// light markdown-to-HTML
function mdToHtml(s=''){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g,'<br/>');
}
