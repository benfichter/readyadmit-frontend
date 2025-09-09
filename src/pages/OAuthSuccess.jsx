import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function OAuthSuccess() {
  const nav = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1)); // after '#'
    const token = params.get('token');
    if (!token) {
      nav('/signin');
      return;
    }
    localStorage.setItem('token', token);

    // hydrate user
    (async () => {
      try {
        const me = await api.get('/auth/me');
        setUser(me.data);
        nav('/dashboard', { replace: true });
      } catch {
        nav('/signin');
      }
    })();
  }, [nav, setUser]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-sm text-[#c6cce0]">Signing you in…</div>
    </div>
  );
}
