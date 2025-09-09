import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  // close sheet when route/hash changes
  useEffect(() => setOpen(false), [pathname, hash]);

  return (
    <header className="m-header fixed top-0 inset-x-0 z-[9999]">
      <div className="m-header-line" />
      <div className="container h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-white">
          <img src="/logo.svg" alt="ReadyAdmit" className="w-6 h-6 drop-shadow-sm" />
          <span className="font-semibold tracking-tight">ReadyAdmit</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <A to="/">Home</A>
          <a href="/#how" className="m-link">How it Works</a>
          <a href="/#features" className="m-link">Features</a>
          <a href="/#pricing" className="m-link">Pricing</a>

          <Link to="/signin" className="m-signin">Sign In</Link>
          <Link to="/signup" className="m-cta">Start Free</Link>
        </nav>

        {/* Mobile trigger */}
        <button
          className="md:hidden m-menu"
          onClick={() => setOpen(v => !v)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden">
          <div className="container py-3">
            <div className="m-sheet">
              <Link to="/" className="m-sheet-link">Home</Link>
              <a href="/#how" className="m-sheet-link">How it Works</a>
              <a href="/#features" className="m-sheet-link">Features</a>
              <a href="/#pricing" className="m-sheet-link">Pricing</a>
              <div className="pt-2 flex items-center gap-2">
                <Link to="/signin" className="m-signin flex-1 text-center">Sign In</Link>
                <Link to="/signup" className="m-cta flex-1 text-center">Start Free</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function A({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `m-link ${isActive ? 'is-active' : ''}`}
    >
      {children}
    </NavLink>
  );
}
