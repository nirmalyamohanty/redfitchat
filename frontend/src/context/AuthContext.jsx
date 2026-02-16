import React, { createContext, useContext, useEffect, useState } from 'react';
import { users as usersApi, auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', window.location.pathname);
      usersApi.me()
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    return usersApi.me().then(({ data }) => setUser(data));
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () => usersApi.me().then(({ data }) => setUser(data));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
