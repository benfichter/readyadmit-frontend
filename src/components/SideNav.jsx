import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Trophy, CalendarDays, Settings
} from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/essays', label: 'Essays', icon: FileText },
  { to: '/applications', label: 'Applications', icon: BookOpen },
  { to: '/extracurriculars', label: 'Extracurriculars', icon: Trophy },
  { to: '/deadlines', label: 'Deadlines', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function SideNav() {
  const loc = useLocation();

  return (
    <aside className="sidenav">
      <div className="sidenav-scroller">
        <div className="sidenav-section">
          <div className="sidenav-title">ReadyAdmit</div>
          <nav className="sidenav-list">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidenav-link ${isActive || loc.pathname.startsWith(to) ? 'active' : ''}`
                }
                end={to === '/dashboard'}
              >
                <Icon size={18} className="sidenav-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
