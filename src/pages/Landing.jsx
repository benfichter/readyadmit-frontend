import AppShell from '../components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import '../styles/essay-highlights.css';

/* ------------------------------------------------------------
   Data
------------------------------------------------------------ */
const SCHOOLS = [
  'West Point','Duke','Carnegie Mellon','UT Austin','Vanderbilt',
  'UNC Chapel Hill','UVA','Washington & Lee','William & Mary',
  'Indiana Bloomington','Villanova','University of Maryland',
  'Fordham','UMass Amherst',
];

// Logos for a clean college row (served via Clearbit)
const SCHOOL_LOGOS = [
  { name: 'West Point', domain: 'usma.edu' },
  { name: 'Duke', domain: 'duke.edu' },
  { name: 'Carnegie Mellon', domain: 'cmu.edu' },
  { name: 'UT Austin', domain: 'utexas.edu' },
  { name: 'Vanderbilt', domain: 'vanderbilt.edu' },
  { name: 'UNC Chapel Hill', domain: 'unc.edu' },
  { name: 'UVA', domain: 'virginia.edu' },
  { name: 'Washington & Lee', domain: 'wlu.edu' },
  { name: 'William & Mary', domain: 'wm.edu' },
  { name: 'Indiana Bloomington', domain: 'indiana.edu' },
  { name: 'Villanova', domain: 'villanova.edu' },
  { name: 'University of Maryland', domain: 'umd.edu' },
  { name: 'Fordham', domain: 'fordham.edu' },
  { name: 'UMass Amherst', domain: 'umass.edu' },
];

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
function useRevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ------------------------------------------------------------
   Ticker (always visible, no blur)
------------------------------------------------------------- */
function Ticker({ items }) {
  const logosByName = useMemo(() => {
    const m = new Map();
    (Array.isArray(SCHOOL_LOGOS) ? SCHOOL_LOGOS : []).forEach((s) => {
      if (s?.name && s?.domain) m.set(String(s.name), String(s.domain));
    });
    return m;
  }, []);

  const list = useMemo(() => [...items, ...items], [items]); // duplicate for seamless loop

  return (
    <div className="ticker">
      <div className="ticker-inner">
        {list.map((t, i) => {
          const name = typeof t === 'string' ? t : (t?.name || '');
          const domain = typeof t === 'object' && t?.domain ? t.domain : logosByName.get(name) || '';
          return (
            <span key={i} className="ticker-item">
              {domain ? (
                <img
                  src={`https://logo.clearbit.com/${domain}`}
                  alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : null}
              <span>{name}</span>
            </span>
          );
        })}
      </div>
      <div className="ticker-fade" />
    </div>
  );
}

/* ------------------------------------------------------------
   Mini Metric
------------------------------------------------------------ */
function Metric({ label, value }) {
  return (
    <div className="metric reveal" data-reveal>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------
   Hero demo card (kept but cleaner)
------------------------------------------------------------ */
function HeroPreview() {
  const [essay, setEssay] = useState('');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    setOut(null);
    if ((essay || '').trim().length < 60) {
      setErr('Paste a longer sample (~60+ chars).');
      return;
    }
    try {
      setBusy(true);
      const { data } = await api.post('/essay-preview', { essay });
      setOut(data);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Preview failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-soft p-5 reveal" data-reveal>
      <div className="text-sm text-[#cdd3ff] font-medium">Live Essay Preview</div>
      <textarea
        value={essay}
        onChange={(e)=>setEssay(e.target.value)}
        placeholder={"Paste ~150–650 words. We'll score it and rewrite your intro."}
        className="input h-36 mt-3"
      />
      {err && <div className="mt-2 text-sm text-rose-400">{err}</div>}
      <button className="btn btn-primary w-full mt-4" onClick={run} disabled={busy}>
        {busy ? 'Analyzing…' : 'Score Your Essay'}
      </button>

      {out && (
        <div className="mt-5 grid gap-3">
          {'score' in out && (<>
            <div className="card p-3">
              <div className="text-xs text-[#aeb6d0]">Score</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {Number(out.score).toFixed(1)} / 10
              </div>
            </div>
          </>)}

          {Array.isArray(out.feedback) && out.feedback.length > 0 && (
            <div className="card p-3">
              <div className="text-xs text-[#aeb6d0]">Feedback</div>
              <ul className="list-disc pl-5 text-sm mt-1">
                {out.feedback.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
          {out.rewritten_intro && (
            <div className="card p-3">
              <div className="text-xs text-[#aeb6d0]">Rewritten Intro</div>
              <p className="mt-1 text-sm">{out.rewritten_intro}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   Feature line (emoji icons to avoid extra deps)
------------------------------------------------------------ */
function Feature({ icon, title, children }) {
  return (
    <div className="card p-6 reveal" data-reveal>
      <div className="feature">
        <div className="icon text-xl">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-sm text-[#c6cce0] mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Page
------------------------------------------------------------ */
export default function Landing() {
  useRevealOnScroll();

  return (
    <AppShell>
      <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="container container-narrow">
          <div className="kicker mb-3 badge badge-green">
            <span>Earned $2.3M+ in Merit Aid</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Left */}
            <div className="min-w-0">
              <h1 className="reveal" data-reveal>
                Stop the skim. <span className="text-gradient">Earn the yes.</span>
              </h1>
              <p className="text-[#b9c1d9] mt-4 max-w-xl reveal" data-reveal>
                A calm, opinionated workspace for college apps — instant essay insights, impact‑driven activity lines,
                and a simple plan to hit every deadline. Built by students who got in.
              </p>

              <div className="mt-7 flex gap-3 reveal" data-reveal>
                <a href="/signup" className="btn btn-primary">Start Free</a>
                <a href="/signin" className="btn btn-secondary">Sign In</a>
              </div>
            </div>

            {/* Right */}
            <div className="min-w-0">
              <HeroPreview />
            </div>

            {/* Scholarships next to Deadlines */}
            <div className="hidden">
              <div className="text-sm font-semibold text-white mb-3">Scholarship Picks</div>
              <div className="grid gap-2">
                <div className="mini-card is-soon">
                  <div className="title">State Merit — Dec 5</div>
                  <div className="date">GPA 3.5+, FAFSA</div>
                </div>
                <div className="mini-card is-far">
                  <div className="title">STEM Scholars — Dec 12</div>
                  <div className="date">Short essay + rec</div>
                </div>
              </div>
            </div>
          </div>
          {/* moved flow-dots to bottom */}
        </div>
      </section>

      {/* COLLEGES TICKER (narrower width) */}
      <div className="container container-narrow mt-6">
        <Ticker items={SCHOOLS} />
      </div>

      {/* METRICS */}
      <section className="section">
        <div className="container container-narrow grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Avg. essay score lift (first pass)" value="+23%" />
          <Metric label="Extracurriculars reframed" value="12,400+" />
          <Metric label="Deadlines tracked last cycle" value="8,900+" />
          <Metric label="Merit aid surfaced" value="$2.3M+" />
        </div>
      </section>

      {/* SEE IT IN ACTION */}
      <section className="section" id="demo">
        <div className="container container-narrow">
          <h2 className="h2 mb-8">See it in action</h2>
          <div className="media-grid">
            {/* Essay highlights */}
            <div className="card overflow-hidden reveal" data-reveal>
              <div className="p-4 border-b border-white/10 text-sm font-semibold text-white/90">Essay Highlights</div>
              <div className="p-4 text-sm leading-6 text-slate-200"><div className="editor-hl-wrap">
                I grew up in a noisy apartment above my mom’s bakery, where&nbsp;
                <span className="hl hl-good">the 5 a.m. clatter turned into a rhythm I could rely on</span>.
                When the mixers stopped during the pandemic, I learned to&nbsp;
                <span className="hl hl-meh">translate stress into service</span> by building a simple ordering app for our neighbors.
              </div></div>
            </div>

            {/* Photo / visual */}
            <div className="card overflow-hidden reveal" data-reveal>
              <img
                className="media-img shine"
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop"
                alt="Campus walkway"
                loading="lazy"
              />
              <div className="p-4 text-sm text-[#c6cce0]">Pair strong voice with crisp structure — that’s what stands out.</div>
            </div>

            {/* Deadlines mini snapshot */}
            <div className="card p-4 reveal" data-reveal>
              <div className="text-sm font-semibold text-white mb-3">Deadlines Snapshot</div>
              <div className="grid gap-2">
                <div className="mini-card is-today">
                  <div className="title">Nov 1 — UVA EA</div>
                  <div className="date">Personal Essay + ECs + Honors</div>
                </div>
                <div className="mini-card is-soon">
                  <div className="title">Nov 15 — Merit Scholarship</div>
                  <div className="date">Short response + transcript</div>
                </div>
                <div className="mini-card is-far">
                  <div className="title">Dec 1 — Duke Regular</div>
                  <div className="date">2 supplementals</div>
                </div>
              </div>
            </div>

            {/* Scholarship Picks (paired with Deadlines) */}
            <div className="card p-4 reveal" data-reveal>
              <div className="text-sm font-semibold text-white mb-3">Scholarship Picks</div>
              <div className="grid gap-2">
                <div className="mini-card is-soon">
                  <div className="title">State Merit — Dec 5</div>
                  <div className="date">GPA 3.5+, FAFSA</div>
                </div>
                <div className="mini-card is-far">
                  <div className="title">STEM Scholars — Dec 12</div>
                  <div className="date">Short essay + rec</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section" id="features">
        <div className="container container-narrow">
          <h2 className="h2 mb-10">What you get</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Feature icon="🧠" title="AI Essay Insights">
              Sentence-level highlights for clarity, voice, and authenticity. Get concrete rewrites on hooks and topic sentences.
            </Feature>
            <Feature icon="🧩" title="SmartFrame EC Builder">
              Turn activities into impact-driven lines that show initiative, scope, results, and reflection.
            </Feature>
            <Feature icon="⏰" title="Deadlines & Apps">
              One place for portals, supplementals, and reminders — see conflicts early and set mini-deadlines.
            </Feature>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container container-narrow flow-wrap">
          <svg className="flow-svg" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity=".8" />
                <stop offset="60%" stopColor="#2563eb" stopOpacity=".8" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity=".8" />
              </linearGradient>
            </defs>
            <path className="flow-path" d="M 60 210 C 380 140, 820 120, 1140 60" />
          </svg>
          <div className="grid gap-6 lg:grid-cols-3 flow-grid">
          <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">1 — Build your profile</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Add ECs, awards, interests, and goals. SmartFrame turns them into high-impact lines.
            </p>
            </div>
          <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">2 — Polish your essays</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Paste a draft, get a score and highlights. Iterate with instant rewrites for hooks and transitions.
            </p>
          </div>
            <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">3 — Track & submit</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              See all deadlines in one calendar, set mini-goals, and check off portals and supplementals.
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="section">
        <div className="container container-narrow grid gap-6 lg:grid-cols-3">
          <div className="card card-soft p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">Common App Personal Essay</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Go from idea → outline → punchy draft. We keep your voice and tighten clarity and flow.
            </p>
          </div>
          <div className="card card-soft p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">Activities & Honors</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Turn “Member, Robotics Club” into leadership with measurable impact in 150 characters.
            </p>
          </div>
          <div className="card card-soft p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">Supplementals</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Show fit for “Why Us?” and “Community” prompts with crisp specifics and reflection.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container container-narrow creative-wrap">
          
          <div className="creative-grid grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Aisha (VA)',
              quote:
                "My intro finally clicked. The highlights told me exactly why sentences worked or didn’t — I submitted with confidence.",
            },
            {
              name: 'Marco (TX)',
              quote:
                'SmartFrame turned “club member” into leadership with outcomes. It changed how I wrote everything.',
            },
            {
              name: 'Taryn (MA)',
              quote:
                'The calendar saved me — I saw two deadlines overlap and set a mini-deadline a week early.',
            },
          ].map((t) => (
            <div key={t.name} className="card p-6 reveal anim-subtle" data-reveal>
              <div className="quote">{t.quote}</div>
              <small className="block mt-3">— {t.name}</small>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* GET STARTED CTA */}
      <section className="section" id="get-started">
        <div className="container container-narrow">
          <div className="getstart-wrap">
            <div className="getstart-bg" aria-hidden></div>
            <div className="cta-stars" aria-hidden>
              {Array.from({ length: 16 }).map((_, i) => <i key={i}></i>)}
            </div>
            <div className="getstart-content">
              <div className="pitch">Draft boldly. Polish smart. Apply calm.</div>
              <div className="actions">
                <a href="/signup" className="btn btn-primary">Get Started Free</a>
                <a href="/signin" className="btn btn-secondary">Sign In</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </AppShell>
  );
}





