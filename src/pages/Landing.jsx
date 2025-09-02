// client/src/pages/Landing.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

/** Brand logo (square) */
function BrandLogo({ className = "w-8 h-8" }) {
  return (
    <img
      src="/logo.svg"
      alt="ReadyAdmit"
      width={32}
      height={32}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

/** --- DATA: school groups for swapping --- */
const SCHOOL_GROUPS = {
  ivy: [
    "Harvard", "Yale", "Princeton", "Columbia",
    "Brown", "Dartmouth", "Cornell", "UPenn"
  ],
  public: [
    "UCLA", "UC Berkeley", "Michigan", "UT Austin",
    "UNC Chapel Hill", "UVA", "UW–Madison", "Georgia Tech"
  ],
  liberal: [
    "Williams", "Amherst", "Swarthmore", "Pomona",
    "Harvey Mudd", "Wellesley", "Middlebury", "Carleton"
  ]
};

/** utility: shuffled copy, stable per mount */
function useShuffled(list) {
  return useMemo(() => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((i + 17) * 9301 % (i + 1)); // deterministic-ish
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [list]);
}

/** Rotating word with pause-on-hover & reduced-motion awareness */
function RotatingWord({ items, interval = 2500 }) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    : false;
  const list = useShuffled(items);
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => {
      if (hovering.current) return;
      setI(v => (v + 1) < list.length ? v + 1 : 0);
      setTick(t => t + 1);
    }, interval);
    return () => clearInterval(id);
  }, [interval, list, prefersReduced]);

  return (
    <span
      className="inline-block align-baseline"
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; }}
      style={{ transform: "translateY(-0.08em)" }}
    >
      <span key={tick} className="rotating-word swoop-in align-middle">
        {list[i]}
      </span>
    </span>
  );
}

/** Navbar */
function Navbar() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!localStorage.getItem('token')); }, []);
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-semibold text-gray-900">ReadyAdmit</span>
        </a>
        <nav className="hidden md:flex items-center gap-6">
          {authed ? (
            <>
              <a href="/dashboard" className="btn btn-outline">Dashboard</a>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
                className="text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="/signin" className="hover:text-gray-900 text-gray-700">Sign In</a>
              <a href="/signup" className="btn btn-primary">Sign Up</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/** Live demo card — fixed to use axios instance */
function EssayPreview() {
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)  // { score, feedback[], rewritten_intro, note? }
  const [err, setErr] = useState('')

  async function runPreview() {
    setErr(''); setData(null)
    if (!essay || essay.trim().length < 50) {
      setErr('Paste at least ~50 characters so we can analyze your essay.')
      return
    }
    try {
      setLoading(true)
      const { data } = await api.post('/essay-preview', { essay }) // <-- axios call
      setData(data)
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'Preview failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ minHeight: 360 }}>
      <div className="text-sm font-medium text-gray-700">Live Demo — AI Essay Preview</div>
      <textarea
        className="mt-2 w-full h-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900/10"
        placeholder="Paste ~150–650 words. You'll get a score, 3 bullets of feedback, and a rewritten intro."
        value={essay}
        onChange={e => setEssay(e.target.value)}
      />
      {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
      <button onClick={runPreview} disabled={loading} className="btn btn-primary mt-3 w-full">
        {loading ? 'Analyzing…' : 'Score Your Essay'}
      </button>

      {data && (
        <div className="mt-4 space-y-3">
          {data.note && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              Demo mode: {data.note}
            </div>
          )}
          {typeof data.score === 'number' && (
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-sm font-semibold text-gray-900">Score</div>
              <div className="text-2xl font-bold mt-1">{data.score.toFixed(1)} / 10</div>
            </div>
          )}
          {Array.isArray(data.feedback) && data.feedback.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-sm font-semibold text-gray-900">Feedback</div>
              <ul className="list-disc pl-5 text-sm text-gray-800 mt-2">
                {data.feedback.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {data.rewritten_intro && (
            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
              <div className="text-sm font-semibold text-gray-900">Rewritten Intro</div>
              <p className="mt-2 text-gray-800">{data.rewritten_intro}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** --- HERO with school swapping --- */
function SchoolTabs({ value, onChange }) {
  const tabs = [
    { id: 'ivy', label: 'Ivy' },
    { id: 'public', label: 'Public' },
    { id: 'liberal', label: 'Liberal Arts' },
  ];
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl border bg-white">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-lg text-sm ${value===t.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          aria-pressed={value===t.id}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- PAGE DEFAULT EXPORT ---------- */
export default function Landing() {
  const [group, setGroup] = useState('ivy');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-20 bg-blue-grad">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="badge flex items-center gap-2">
              <span className="accent-dot" style={{ backgroundColor: '#22c55e' }} />
              Earned over $2.3M+ in Merit Aid
            </div>

            <div className="mt-4 flex items-center gap-3">
              <SchoolTabs value={group} onChange={setGroup} />
              <span className="text-xs text-gray-500">Hover the school name to pause</span>
            </div>

            <h1 className="h1 mt-4">
              Built by students admitted to{' '}
              <RotatingWord items={SCHOOL_GROUPS[group]} />
            </h1>

            <p className="p mt-4">
              Craft essays that punch, track applications, and unlock scholarships — with AI plus guidance from real admits.
            </p>

            <div className="mt-6 flex gap-3">
              {localStorage.getItem('token') ? (
                <>
                  <a href="/dashboard" className="btn btn-primary">Open Dashboard</a>
                  <a href="#how" className="btn btn-outline">See How It Works</a>
                </>
              ) : (
                <>
                  <a href="/signup" className="btn btn-primary">Start Free Today →</a>
                  <a href="#how" className="btn btn-outline">See How It Works</a>
                </>
              )}
            </div>
          </div>

          <EssayPreview />
        </div>
      </section>

      {/* Sections */}
      <HowItWorks id="how" />
      <Features />
      <Pricing />

      <Footer />
    </div>
  )
}
