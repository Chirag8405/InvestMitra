import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser { id: string; email: string }

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ ok: boolean; user?: AuthUser }>("/api/auth/me");
      setUser(data.ok ? (data.user as AuthUser) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginFn = useCallback(async (email: string, password: string) => {
    try {
      const data = await api<{ ok: boolean; error?: string }>("/api/auth/login", { method: 'POST', body: JSON.stringify({ email, password }) });
      if (data.ok) await refresh();
      return data;
    } catch {
      return { ok: false, error: 'network_error' };
    }
  }, [refresh]);

  const signupFn = useCallback(async (email: string, password: string) => {
    try {
      const data = await api<{ ok: boolean; error?: string }>("/api/auth/register", { method: 'POST', body: JSON.stringify({ email, password }) });
      if (data.ok) await refresh();
      return data;
    } catch {
      return { ok: false, error: 'network_error' };
    }
  }, [refresh]);

  const logoutFn = useCallback(async () => {
    try { await api("/api/auth/logout", { method: 'POST' }); } catch {}
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login: loginFn, signup: signupFn, logout: logoutFn, refresh }), [user, loading, loginFn, signupFn, logoutFn, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
