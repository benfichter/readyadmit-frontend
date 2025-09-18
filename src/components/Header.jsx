// src/components/Header.jsx
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

/* Smooth scroll helper with fixed-header offset */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('[data-fixed-header]');
  const offset = header ? header.getBoundingClientRect().height + 12 : 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
  el.classList.add('scroll-focus');
  setTimeout(() => el.classList.remove('scroll-focus'), 700);
}

/* HashLink: if not on home route, go home first then scroll */
function HashLink({ section, className = 'nav-link', children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const onClick = useCallback(
    (e) => {
      e.preventDefault();
      const go = () => scrollToId(section);
      if (pathname !== '/') {
        navigate('/');
        requestAnimationFrame(() => requestAnimationFrame(go));
      } else {
        go();
      }
    },
    [pathname, navigate, section]
  );

  return (
    <a href={`#${section}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

export default function Header({ showMarketingNav = true } = {}) {
  const { user, signOut } = useAuth() || {};
  const { pathname } = useLocation();

  const inApp = [
    '/dashboard','/essays','/applications','/extracurriculars',
    '/honors','/admitlens','/settings',
  ].some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <header
      className="fixed top-0 inset-x-0 h-20 z-[1000] navbar"
      role="banner"
      data-fixed-header
    >
      <div className="container h-full flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ReadyAdmit" className="w-6 h-6 drop-shadow-sm" />
            <span className="font-semibold tracking-tight text-white">ReadyAdmit</span>
          </Link>
        </div>

        {/* Primary links */}
        {(!inApp && showMarketingNav) && (
          <nav className="hidden md:flex items-center gap-6">
            {/* Home now anchors to #home */}
            <HashLink section="home">Home</HashLink>
            <HashLink section="how">How it Works</HashLink>
            <HashLink section="features">Features</HashLink>
            <HashLink section="testimonials">Testimonials</HashLink>
            <HashLink section="pricing">Pricing</HashLink>
          </nav>
        )}

        {/* Auth / App actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/signup" className="nav-signin">Sign Up</Link>
              <Link to="/signin" className="nav-cta">Sign In</Link>
            </>
          ) : (
            <>
              {inApp ? (
                <>
                  <Link to="/dashboard" className="nav-signin">Dashboard</Link>
                  <button onClick={signOut} className="nav-cta" title="Sign out">Sign Out</button>
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

/* If you still use this elsewhere */
function A({ to, exact, children }) {
  return (
    <NavLink to={to} end={!!exact} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </NavLink>
  );
}

