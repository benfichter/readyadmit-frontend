import AppShell from '../components/AppShell';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';

/* ------------------------------------------------------------
   Data
------------------------------------------------------------ */
const SCHOOLS = [
  'West Point','Duke','Carnegie Mellon','UT Austin','Vanderbilt',
  'UNC Chapel Hill','UVA','Washington & Lee','William & Mary',
  'Indiana Bloomington','Villanova','University of Maryland',
  'Fordham','UMass Amherst',
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
------------------------------------------------------------ */
function Ticker({ items }) {
  const list = useMemo(() => [...items, ...items], [items]); // duplicate for seamless loop
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {list.map((t, i) => (
          <span key={i} className="ticker-item">{t}</span>
        ))}
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
        placeholder="Paste ~150–650 words. We’ll score it and rewrite your intro."
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
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="kicker mb-3 badge">
            <span>Earned $2.3M+ in Merit Aid</span>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] items-start">
            {/* Left */}
            <div>
              <h1 className="reveal" data-reveal>
                Craft essays that <span className="text-gradient">stand out</span>. <br />
                Track applications. Unlock scholarships.
              </h1>
              <p className="text-[#b9c1d9] mt-4 max-w-xl reveal" data-reveal>
                Built by students admitted to top schools, ReadyAdmit gives you punchy feedback,
                clearer structure, and a calm plan from draft to submit.
              </p>

              <div className="mt-7 flex gap-3 reveal" data-reveal>
                <a href="/signup" className="btn btn-primary">Start Free</a>
                <a href="/signin" className="btn btn-secondary">Sign In</a>
              </div>

              <div className="mt-8 reveal" data-reveal>
                <Ticker items={SCHOOLS} />
              </div>
            </div>

            {/* Right */}
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="section">
        <div className="container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Avg. essay score lift (first pass)" value="+23%" />
          <Metric label="Extracurriculars reframed" value="12,400+" />
          <Metric label="Deadlines tracked last cycle" value="8,900+" />
          <Metric label="Merit aid surfaced" value="$2.3M+" />
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section">
        <div className="container">
          <h2 className="h2 mb-10">What you get</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <Feature icon="🖊️" title="AI Essay Insights">
              Sentence-level highlights for clarity, voice, and authenticity. Get concrete rewrites on hooks and topic sentences.
            </Feature>
            <Feature icon="📌" title="SmartFrame™ EC Builder">
              Turn activities into impact-driven lines that show initiative, scope, results, and reflection.
            </Feature>
            <Feature icon="📅" title="Deadlines & Apps">
              One place for portals, supplementals, and reminders—see conflicts early and set mini-deadlines.
            </Feature>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-3">
          <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">1 · Build your profile</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Add ECs, awards, interests, and goals. SmartFrame™ turns them into high-impact lines.
            </p>
          </div>
          <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">2 · Polish your essays</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              Paste a draft, get a score and highlights. Iterate with instant rewrites for hooks and transitions.
            </p>
          </div>
          <div className="card p-6 reveal" data-reveal>
            <div className="text-sm font-semibold text-white">3 · Track & submit</div>
            <p className="text-sm text-[#c6cce0] mt-2">
              See all deadlines in one calendar, set mini-goals, and check off portals and supplementals.
            </p>
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-3">
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
        <div className="container grid gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Aisha (VA)',
              quote:
                'My intro finally clicked. The highlights told me exactly why sentences worked or didn’t — I submitted with confidence.',
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
            <div key={t.name} className="card p-6 reveal" data-reveal>
              <div className="quote">{t.quote}</div>
              <small className="block mt-3">— {t.name}</small>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING CTA */}
      <section className="section">
        <div className="container">
          <div className="card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xl font-semibold text-white">Ready to make your app stand out?</div>
              <div className="text-sm text-[#c6cce0] mt-1">Start free — no credit card. Upgrade anytime.</div>
            </div>
            <div className="flex gap-3">
              <a href="/signup" className="btn btn-primary">Start Free</a>
              <a href="/pricing" className="btn btn-secondary">See Plans</a>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
