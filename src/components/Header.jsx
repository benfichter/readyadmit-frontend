// src/components/Header.jsx
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth() || {};
  const { pathname } = useLocation();

  const inApp = [
    '/dashboard',
    '/essays',
    '/applications',
    '/extracurriculars',
    '/settings',
  ].some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <header
      className="fixed top-0 inset-x-0 h-16 z-[1000] navbar"
      role="banner"
    >
      <div className="container h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ReadyAdmit" className="w-6 h-6" />
            <span className="font-semibold tracking-tight text-white">
              ReadyAdmit
            </span>
          </Link>
        </div>

        {/* Primary links (compact) */}
        {!inApp && (
          <nav className="hidden md:flex items-center gap-6">
            <A to="/" exact>Home</A>
            <a href="/#how" className="nav-link">How it Works</a>
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#pricing" className="nav-link">Pricing</a>
          </nav>
        )}

        {/* Auth / App actions (always on right) */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/signin" className="nav-signin">Sign In</Link>
              <Link to="/signup" className="nav-cta">Start Free</Link>
            </>
          ) : (
            <>
              {/* Always show Sign Out when logged in */}
              {inApp ? (
                <>
                  <Link to="/dashboard" className="nav-signin">Dashboard</Link>
                  <button onClick={signOut} className="nav-cta" title="Sign out">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-cta">Open Dashboard</Link>
                  <button onClick={signOut} className="nav-signin">Sign Out</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function A({ to, exact, children }) {
  return (
    <NavLink
      to={to}
      end={!!exact}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </NavLink>
  );
}
