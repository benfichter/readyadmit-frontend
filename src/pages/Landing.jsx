// src/pages/Landing.jsx
import AppShell from '../components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import '../styles/essay-highlights.css';
import Footer from '../components/Footer';
import '../styles/landing.css';
import '../styles/footer.css';

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

// Smooth scroll for in-page #anchors with fixed-header offset
function useSmoothAnchorScroll() {
  useEffect(() => {
    function handler(e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();

      const header = document.querySelector('[data-fixed-header]');
      const offset = header ? header.getBoundingClientRect().height + 12 : 12;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
      el.classList.add('scroll-focus');
      setTimeout(() => el.classList.remove('scroll-focus'), 700);
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
}

// Days-until helper
function daysUntil(dueISO) {
  const now = new Date();
  const due = new Date(dueISO);
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((end - start) / msPerDay);
}

/* ------------------------------------------------------------
   Ticker
------------------------------------------------------------ */
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
   Deadline Pill (hidden; drives color via :has)
------------------------------------------------------------ */
function DeadlinePill({ dueISO }) {
  const d = daysUntil(dueISO);
  let tone = 'ok'; // 14+ days
  if (d <= 14 && d >= 8) tone = 'soon';   // 8–14 (yellow in CSS)
  if (d <= 7 && d >= 0) tone = 'urgent';  // this week (red)
  if (d < 0) tone = 'past';               // gray
  const text =
    d < 0 ? `Past due` :
    d === 0 ? `Due today` :
    d === 1 ? `Due in 1 day` :
    `Due in ${d} days`;
  return <span className={`deadline-pill ${tone}`}>{text}</span>;
}

/* ------------------------------------------------------------
   Inline “due in …” (sits with description)
------------------------------------------------------------ */
function DueInline({ dueISO }) {
  const d = daysUntil(dueISO);
  const label =
    d < 0 ? 'past due' :
    d === 0 ? 'due today' :
    d === 1 ? 'due in 1 day' :
    `due in ${d} days`;
  return <span className="due-inline"> · {label}</span>;
}

/* ------------------------------------------------------------
   Section Title
------------------------------------------------------------ */
function SectionTitle({ children }) {
  return <h2 className="section-title h2">{children}</h2>;
}

/* ------------------------------------------------------------
   Hero demo card
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
          {'score' in out && (
            <div className="card p-3">
              <div className="text-xs text-[#aeb6d0]">Score</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {Number(out.score).toFixed(1)} / 10
              </div>
            </div>
          )}

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
   Feature
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
  useSmoothAnchorScroll();

  // Demo dates (relative) to clearly show urgency colors
  const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString();
  const demoDates = {
    uva: inDays(2),      // urgent (≤7) -> red
    duke: inDays(10),    // soon (8–14) -> yellow (CSS)
    vandy: inDays(21),   // ok (14+)   -> green
    stateMerit: inDays(6),   // urgent
    stemSch: inDays(12),     // soon
  };

  return (
    <AppShell showMarketingNav={true}>
      <div className="landing">
        {/* HERO */}
        <section className="hero" id="home">
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
                  A calm, opinionated workspace for college apps — instant essay insights, impact-driven activity lines,
                  and a simple plan to hit every deadline. Built by students who got in.
                </p>

                <div className="mt-7 flex gap-3 reveal" data-reveal>
                  <a href="/signup" className="btn btn-primary">Start Free</a>
                  <a href="/signup" className="btn btn-secondary">Sign Up</a>
                </div>
              </div>

              {/* Right */}
              <div className="min-w-0">
                <HeroPreview />
              </div>
            </div>
          </div>
        </section>

        {/* COLLEGES TICKER */}
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

        {/* HOW IT WORKS — unified 1–6 */}
        <section className="section" id="how">
          <div className="container container-narrow">
            <SectionTitle>How it works</SectionTitle>

            <div className="steps-grid grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
              {[
                {
                  t: 'Build your profile',
                  d: 'Add ECs, awards, interests, and goals. SmartFrame turns them into high-impact lines.',
                },
                {
                  t: 'Polish your essays',
                  d: 'Paste a draft, get a score and highlights. Iterate with instant rewrites for hooks and transitions.',
                },
                {
                  t: 'Track & submit',
                  d: 'See all deadlines in one calendar, set mini-goals, and check off portals and supplementals.',
                },
                {
                  t: 'Common App Personal Essay',
                  d: 'Go from idea → outline → punchy draft. We keep your voice and tighten clarity and flow.',
                },
                {
                  t: 'Activities & Honors',
                  d: 'Turn “Member, Robotics Club” into leadership with measurable impact in 150 characters.',
                },
                {
                  t: 'Supplementals',
                  d: 'Show fit for “Why Us?” and “Community” prompts with crisp specifics and reflection.',
                },
              ].map((s, i) => (
                <div key={i} className="card step-card reveal" data-reveal>
                  <div className="flex items-start gap-3">
                    <span className="step-num">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{s.t}</div>
                      <p className="text-xs sm:text-sm text-[#c6cce0] mt-1">{s.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Keep #examples as an alias for old links */}
            <span id="examples" aria-hidden className="sr-only" />
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="section" id="features">
          <div className="container container-narrow">
            <SectionTitle>What you get</SectionTitle>
            <div className="grid gap-6 lg:grid-cols-3 mt-10">
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

        {/* SEE IT IN ACTION */}
        <section className="section" id="demo">
          <div className="container container-narrow">
            <SectionTitle>See it in action</SectionTitle>
            <div className="media-grid mt-8">
              <div className="card overflow-hidden reveal" data-reveal>
                <div className="p-4 border-b border-white/10 text-sm font-semibold text-white/90">Essay Highlights</div>
                <div className="p-4 text-sm leading-6 text-slate-200">
                  <div className="editor-hl-wrap">
                    I grew up in a noisy apartment above my mom’s bakery, where&nbsp;
                    <span className="hl hl-good">the 5 a.m. clatter turned into a rhythm I could rely on</span>.
                    When the mixers stopped during the pandemic, I learned to&nbsp;
                    <span className="hl hl-meh">translate stress into service</span> by building a simple ordering app for our neighbors.
                  </div>
                </div>
              </div>

              <div className="card overflow-hidden reveal" data-reveal>
                <img
                  className="media-img shine"
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop"
                  alt="Campus walkway"
                  loading="lazy"
                />
                <div className="p-4 text-sm text-[#c6cce0]">
                  Pair strong voice with crisp structure — that’s what stands out.
                </div>
              </div>

              <div className="card p-4 reveal" data-reveal>
                <div className="text-sm font-semibold text-white mb-3">Deadlines Snapshot</div>
                <div className="grid gap-2">
                  <div className="mini-card">
                    <div className="title">University of Virginia</div>
                    <div className="date">
                      Personal Essay + ECs + Honors
                      <DueInline dueISO={demoDates.uva} />
                    </div>
                    <div className="mt-2"><DeadlinePill dueISO={demoDates.uva} /></div>
                  </div>

                  <div className="mini-card">
                    <div className="title">Duke University</div>
                    <div className="date">
                      2 supplementals + transcript
                      <DueInline dueISO={demoDates.duke} />
                    </div>
                    <div className="mt-2"><DeadlinePill dueISO={demoDates.duke} /></div>
                  </div>

                  <div className="mini-card">
                    <div className="title">Vanderbilt University</div>
                    <div className="date">
                      1 supplemental + activities review
                      <DueInline dueISO={demoDates.vandy} />
                    </div>
                    <div className="mt-2"><DeadlinePill dueISO={demoDates.vandy} /></div>
                  </div>
                </div>

                {/* Tiny legend */}
                <div className="deadline-legend mt-3">
                  <span><i className="dot ok" /> 14+ days</span>
                  <span><i className="dot soon" /> 8–14</span>
                  <span><i className="dot urgent" /> ≤7</span>
                  <span><i className="dot past" /> past</span>
                </div>
              </div>

              <div className="card p-4 reveal" data-reveal>
                <div className="text-sm font-semibold text-white mb-3">Scholarship Picks</div>
                <div className="grid gap-2">
                  <div className="mini-card scholarship">
                    <div className="title">State Merit — Dec 5</div>
                    <div className="date">
                      GPA 3.5+, FAFSA
                      <DueInline dueISO={demoDates.stateMerit} />
                    </div>
                    <div className="mt-2"><DeadlinePill dueISO={demoDates.stateMerit} /></div>
                  </div>
                  <div className="mini-card scholarship">
                    <div className="title">STEM Scholars — Dec 12</div>
                    <div className="date">
                      Short essay + rec
                      <DueInline dueISO={demoDates.stemSch} />
                    </div>
                    <div className="mt-2"><DeadlinePill dueISO={demoDates.stemSch} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section" id="testimonials">
          <div className="container container-narrow creative-wrap">
            <SectionTitle>Testimonials</SectionTitle>
            <div className="creative-grid grid gap-6 lg:grid-cols-3 mt-10">
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

        {/* PRICING */}
        <section className="section" id="pricing">
          <div className="container container-narrow">
            <SectionTitle>Pricing</SectionTitle>
            <div className="card card-soft p-6 mt-8">
              <div className="flex items-center gap-2">
                <span className="badge badge-violet">Beta</span>
                <div className="text-white font-semibold text-lg">Free during beta</div>
              </div>
              <p className="text-sm text-[#c6cce0] mt-2">
                All features are free while we’re in beta — no credit card required.
              </p>
              <ul className="list-disc pl-5 text-sm mt-3 space-y-1 text-[#c6cce0]">
                <li>Essay insights & rewrites</li>
                <li>SmartFrame activities builder</li>
                <li>Deadlines & mini-deadlines</li>
                <li>AdmitLens™ holistic advisor</li>
              </ul>
              <div className="mt-5 flex gap-3">
                <a href="/signup" className="btn btn-primary">Get Started Free</a>
                <a href="/signup" className="btn btn-secondary">Sign Up</a>
              </div>
              <div className="text-xs subtle mt-4">
                Paid tiers will launch after beta; students on beta keep generous free access.
              </div>
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
                  <a href="/signup" className="btn btn-secondary">Sign Up</a>
                  {/* <a href="#pricing" className="btn btn-secondary">See Pricing</a> */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}


