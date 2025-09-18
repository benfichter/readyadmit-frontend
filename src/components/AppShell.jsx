// src/components/AppShell.jsx
import Header from './Header';
import SideNav from './SideNav';
import { useLocation } from 'react-router-dom';

const IN_APP_ROUTES = [
  '/dashboard',
  '/essays',
  '/essaysworkspace',
  '/applications',
  '/extracurriculars',
  '/honors',
  '/admitlens',
  '/settings',
];

export default function AppShell({ children, showMarketingNav = true }) {
  const { pathname } = useLocation();
  const inApp = IN_APP_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  const HEADER_H = 80; // h-20

  return (
    <div className="app-root">
      {/* NOTE: make Header accept `showMarketingNav` and hide Home/How/Features/Pricing when false */}
      <Header showMarketingNav={!inApp && showMarketingNav} />
      <div style={{ paddingTop: HEADER_H }}>
        {inApp ? (
          <div className="container app-frame">
            <SideNav />
            <main className="app-main">{children}</main>
          </div>
        ) : (
          <main className="container py-10">{children}</main>
        )}
      </div>
    </div>
  );
}
