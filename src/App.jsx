import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import Essays from './pages/EssaysPage';

function Protected({ children }) {
  const { user } = useAuth();
  const authed = !!user || !!localStorage.getItem('token');
  return authed ? children : <Navigate to="/signin" replace />;
}
function GuestOnly({ children }) {
  const { user } = useAuth();
  const authed = !!user || !!localStorage.getItem('token');
  return authed ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Marketing */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<GuestOnly><SignIn /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><SignUp /></GuestOnly>} />

      {/* OAuth callback */}
      <Route path="/oauth/success" element={<OAuthSuccess />} />

      {/* App (protected) */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/essays" element={<Protected><Essays /></Protected>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
