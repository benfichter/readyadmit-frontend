// src/components/SideNav.jsx
import { NavLink } from "react-router-dom";

const LinkItem = ({ to, children, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `sidenav-link ${isActive ? "active" : ""}`
    }
  >
    <span className="sidenav-icon">{icon}</span>
    <span>{children}</span>
  </NavLink>
);

export default function SideNav() {
  return (
    <aside className="sidenav">
      <div className="sidenav-scroller">
        <div className="sidenav-title">Navigate</div>
        <div className="sidenav-list">
          <LinkItem to="/dashboard" icon="🏠">Dashboard</LinkItem>
          <LinkItem to="/applications" icon="📄">Applications</LinkItem>
          <LinkItem to="/essays" icon="📝">Essays</LinkItem>
          <LinkItem to="/extracurriculars" icon="🎯">Extracurriculars</LinkItem>
          <LinkItem to="/honors" icon="🏅">Honors</LinkItem>
          <LinkItem to="/settings" icon="⚙️">Settings</LinkItem>
        </div>
      </div>
    </aside>
  );
}

