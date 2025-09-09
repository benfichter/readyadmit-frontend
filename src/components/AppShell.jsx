import SideNav from './SideNav';
import MarketingHeader from './MarketingHeader';
import { useLocation } from 'react-router-dom';

const IN_APP_ROUTES = [
  '/dashboard',
  '/essays',
  '/applications',
  '/extracurriculars',
  '/deadlines',
  '/settings',
];

export default function AppShell({ children }) {
  const { pathname } = useLocation();
  const inApp = IN_APP_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  // Show header only on marketing pages; no header on in-app.
  const showHeader = !inApp;
  const HEADER_H = 64;

  return (
    <div className="app-root">
      {showHeader && <MarketingHeader />}
      <div style={{ paddingTop: showHeader ? HEADER_H : 0 }}>
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
