import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // bootstrap from token
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberEmail');
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, signOut, loading }), [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

// also export default for compatibility with default imports
export default AuthProvider;
