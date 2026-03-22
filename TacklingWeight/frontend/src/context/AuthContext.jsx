import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { tokenStore } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount (only if a token exists in localStorage)
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api.getProfile()
      .then((data) => setUser(data.user))
      .catch(() => { tokenStore.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    tokenStore.set(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, password, alias) => {
    const data = await api.register({ email, password, alias });
    tokenStore.set(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    tokenStore.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api.getProfile();
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
