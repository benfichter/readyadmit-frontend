import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

export default function SignUp() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [fieldErr, setFieldErr] = useState({ name: '', email: '', password: '', confirm: '', agree: '' });

  function validate() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nameOk = trimmedName.length >= 2;
    const emailOk = /\S+@\S+\.\S+/.test(trimmedEmail);
    const passwordOk = password.length >= 8;
    const confirmOk = password && password === confirm;
    const agreeOk = !!agree;
    const fe = {
      name: nameOk ? '' : 'Enter your full name.',
      email: emailOk ? '' : 'Enter a valid email address.',
      password: passwordOk ? '' : 'Use at least 8 characters.',
      confirm: confirmOk ? '' : 'Passwords must match.',
      agree: agreeOk ? '' : 'Please agree to the terms.',
    };
    setFieldErr(fe);
    return nameOk && emailOk && passwordOk && confirmOk && agreeOk;
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!validate()) return;
    try {
      setBusy(true);
      const payload = { name: name.trim(), email: email.trim(), password };
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      const me = await api.get('/users/me');
      setUser(me.data);
      nav('/dashboard');
    } catch (e) {
      setErr(e?.response?.data?.error || 'Sign-up failed');
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
            <div className="badge mb-3">Create your account</div>
            <h1 className="text-2xl font-bold tracking-tight">Sign up</h1>
            <p className="text-sm text-[#b8bfd4] mt-1">Start free with email or Google.</p>
          </div>

          {err && (
            <div role="alert" className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="form-label">Full name</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5c0-2.5-3.58-4.5-8-4.5Z"/></svg>
                </span>
                <input
                  id="name"
                  className={`input input-with-icon ${fieldErr.name ? 'input-invalid' : ''}`}
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder="Taylor Jenkins"
                  autoComplete="name"
                  aria-invalid={!!fieldErr.name}
                  aria-describedby={fieldErr.name ? 'name-err' : undefined}
                />
              </div>
              {fieldErr.name && <p id="name-err" className="form-error">{fieldErr.name}</p>}
            </div>

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
                  autoComplete="email"
                  aria-invalid={!!fieldErr.email}
                  aria-describedby={fieldErr.email ? 'email-err' : undefined}
                />
              </div>
              {fieldErr.email && <p id="email-err" className="form-error">{fieldErr.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17 8V7a5 5 0 0 0-10 0v1a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-8-1a3 3 0 0 1 6 0v1H9Zm8 12H7v-9h10Z"/></svg>
                </span>
                <input
                  id="password"
                  type="password"
                  className={`input input-with-icon ${fieldErr.password ? 'input-invalid' : ''}`}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErr.password}
                  aria-describedby={fieldErr.password ? 'password-err' : undefined}
                />
              </div>
              {fieldErr.password && <p id="password-err" className="form-error">{fieldErr.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="form-label">Confirm password</label>
              <div className="input-group">
                <span className="input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17 8V7a5 5 0 0 0-10 0v1a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-8-1a3 3 0 0 1 6 0v1H9Zm8 12H7v-9h10Z"/></svg>
                </span>
                <input
                  id="confirm"
                  type="password"
                  className={`input input-with-icon ${fieldErr.confirm ? 'input-invalid' : ''}`}
                  value={confirm}
                  onChange={(e)=>setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErr.confirm}
                  aria-describedby={fieldErr.confirm ? 'confirm-err' : undefined}
                />
              </div>
              {fieldErr.confirm && <p id="confirm-err" className="form-error">{fieldErr.confirm}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input
                id="agree" type="checkbox" className="mt-1 accent-[#7c3aed]"
                checked={agree} onChange={(e)=>setAgree(e.target.checked)}
                aria-invalid={!!fieldErr.agree}
              />
              <label htmlFor="agree" className="text-sm text-[#c6cce0]">
                I agree to the <a className="form-link" href="/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
                <a className="form-link" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
                {fieldErr.agree && <span className="block form-error mt-1">{fieldErr.agree}</span>}
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              {busy ? <span className="inline-flex items-center gap-2"><span className="spinner" /> Creating...</span> : 'Create account'}
            </button>
          </form>

          <div className="divider my-6" role="separator" aria-label="or continue with" />

          <button type="button" onClick={googleSignIn} className="oauth-btn" aria-label="Continue with Google">
            <span className="oauth-icon" aria-hidden="true">
              <svg viewBox="0 0 533.5 544.3" width="18" height="18"><path fill="#EA4335" d="M533.5 278.4c0-18.6-1.7-36.4-4.9-53.6H272v101.5h147c-6.3 34.1-25.5 63-54.5 82.4v68h88.2c51.6-47.5 80.8-117.5 80.8-198.3z"/><path fill="#34A853" d="M272 544.3c73.5 0 135.2-24.3 180.3-66.1l-88.2-68c-24.5 16.4-55.8 26.1-92.1 26.1-70.8 0-130.8-47.7-152.3-111.9H29.7v70.2C74.3 493.7 167 544.3 272 544.3z"/><path fill="#4A90E2" d="M119.7 324.4c-9-26.7-9-55.6 0-82.3v-70.2H29.7c-39.4 77.7-39.4 167.1 0 244.8l90-70.2z"/><path fill="#FBBC05" d="M272 107.7c39.9-.7 78.2 14.6 107.6 42.9l80.1-80.1C405.9 25.1 341.6 0 272 0 167 0 74.3 50.5 29.7 159.9l90 70.2C141.2 155.9 201.2 108.2 272 107.7z"/></svg>
            </span>
            Continue with Google
          </button>

          <p className="auth-foot text-xs text-[#9aa3be] mt-6">
            Already have an account? <Link to="/signin" className="form-link">Sign in</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}

