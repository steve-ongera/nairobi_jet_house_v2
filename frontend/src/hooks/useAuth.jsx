// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access');
        if (accessToken) {
          const response = await authAPI.profile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth rehydration error:', error);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  // Classic single-step login (kept for backward compat / non-OTP flows).
  const login = async (username, password) => {
    const response = await authAPI.login({ username, password });

    if (response.data.access) {
      localStorage.setItem('access', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refresh', response.data.refresh);
    }

    const profileResponse = await authAPI.profile();
    const userData = profileResponse.data;

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // ── setSession ────────────────────────────────────────────────────────────
  // Called after OTP verification succeeds.
  // `data` is the verify-otp response: { access, refresh, user }
  const setSession = (data) => {
    localStorage.setItem('access',  data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('user',    JSON.stringify(data.user));
    setUser(data.user);   // ← syncs React state so protected routes open immediately
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setSession,           // ← consumed by LoginPage after OTP verify
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}