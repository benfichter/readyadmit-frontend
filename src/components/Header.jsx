import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const loc = useLocation();
  const inApp = /^\/(dashboard|essays|applications|extracurriculars)/.test(loc.pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="container h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/logo.svg" alt="ReadyAdmit" className="w-6 h-6" />
          <span className="tracking-tight">ReadyAdmit</span>
        </Link>

        {/* Marketing CTAs only on marketing pages */}
        {!user && !inApp && (
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/signin" className="link">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
