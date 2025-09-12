// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationWorkspace from './pages/ApplicationWorkspace';
import Extracurriculars from './pages/Extracurriculars';
import Settings from './pages/Settings';

// NEW: Essays overview + standalone editor routes
import EssaysIndex from './pages/EssaysIndex';
import EssayWorkspace from './pages/EssayWorkspace';

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
      {/* Marketing / public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<GuestOnly><SignIn /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><SignUp /></GuestOnly>} />

      {/* OAuth callback */}
      <Route path="/oauth/success" element={<OAuthSuccess />} />

      {/* App (protected) */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

      {/* Applications */}
      <Route path="/applications" element={<Protected><Applications /></Protected>} />
      <Route path="/applications/:appId" element={<Protected><ApplicationWorkspace /></Protected>} />

      {/* Essays */}
      <Route path="/essays" element={<Protected><EssaysIndex /></Protected>} />
      <Route path="/essaysworkspace" element={<Protected><EssayWorkspace /></Protected>} />
      <Route path="/essaysworkspace/s/:sid" element={<Protected><EssayWorkspace /></Protected>} />

      {/* Other sections */}
      <Route path="/extracurriculars" element={<Protected><Extracurriculars /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
