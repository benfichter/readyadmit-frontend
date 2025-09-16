import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

export default function SignIn() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState({ email: '' });

  useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  function validate() {
    const ok = /\S+@\S+\.\S+/.test(email.trim());
    const fe = { email: ok ? '' : 'Enter a valid email address.' };
    setFieldErr(fe);
    return ok;
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!validate()) return;
    try {
      setBusy(true);
      const { data } = await api.post('/auth/login', { email: email.trim() });
      localStorage.setItem('token', data.token);
      remember ? localStorage.setItem('rememberEmail', email.trim())
               : localStorage.removeItem('rememberEmail');
      const me = await api.get('/users/me');
      setUser(me.data);
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  const OAUTH_GOOGLE =
    import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/auth/google`
      : '/auth/google';
  const googleSignIn = () => window.location.assign(OAUTH_GOOGLE);

  return (
    <AppShell>
      <main className="auth-wrap">
        <section className="auth-panel card card-soft">
          <div>
            <div className="badge mb-3">Welcome back</div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-[#b8bfd4] mt-1">Use your email or Google.</p>
          </div>

          {err && (
            <div role="alert" className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5Z"/></svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className={`input input-with-icon ${fieldErr.email ? 'input-invalid' : ''}`}
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={!!fieldErr.email}
                  aria-describedby={fieldErr.email ? 'email-err' : undefined}
                />
              </div>
              {fieldErr.email && <p id="email-err" className="form-error">{fieldErr.email}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#c6cce0]">
                <input type="checkbox" className="accent-[#7c3aed]" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="submit" className="btn btn-primary min-w-[120px]" disabled={busy}>
                {busy ? <span className="inline-flex items-center gap-2"><span className="spinner" /> Signing in…</span> : 'Continue'}
              </button>
            </div>
          </form>

          <div className="divider my-6" role="separator" aria-label="or continue with" />

          <button type="button" onClick={googleSignIn} className="oauth-btn" aria-label="Continue with Google">
            <span className="oauth-icon" aria-hidden="true">
              <svg viewBox="0 0 533.5 544.3" width="18" height="18"><path fill="#EA4335" d="M533.5 278.4c0-18.6-1.7-36.4-4.9-53.6H272v101.5h147c-6.3 34.1-25.5 63-54.5 82.4v68h88.2c51.6-47.5 80.8-117.5 80.8-198.3z"/><path fill="#34A853" d="M272 544.3c73.5 0 135.2-24.3 180.3-66.1l-88.2-68c-24.5 16.4-55.8 26.1-92.1 26.1-70.8 0-130.8-47.7-152.3-111.9H29.7v70.2C74.3 493.7 167 544.3 272 544.3z"/><path fill="#4A90E2" d="M119.7 324.4c-9-26.7-9-55.6 0-82.3v-70.2H29.7c-39.4 77.7-39.4 167.1 0 244.8l90-70.2z"/><path fill="#FBBC05" d="M272 107.7c39.9-.7 78.2 14.6 107.6 42.9l80.1-80.1C405.9 25.1 341.6 0 272 0 167 0 74.3 50.5 29.7 159.9l90 70.2C141.2 155.9 201.2 108.2 272 107.7z"/></svg>
            </span>
            Continue with Google
          </button>

          <p className="auth-foot text-xs text-[#9aa3be] mt-6">
            Don’t have an account? <Link to="/signup" className="form-link">Create one</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
