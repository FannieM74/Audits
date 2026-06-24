'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_MS = 15 * 60 * 1000;
  const logout = useCallback(() => {
    document.cookie = 'token=; path=/; max-age=0';
    setToken(null);
    setUser(null);
    router.push('/');
  }, [router]);

  useEffect(() => {
    const t = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (t) {
      setToken(t);
      api.get('/api/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [logout]);

  const resetIdleTimer = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => logout(), INACTIVITY_MS);
  }, [logout, INACTIVITY_MS]);

  useEffect(() => {
    if (!token) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];
    resetIdleTimer();
    for (const event of events) {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    }
    return () => {
      if (idleRef.current) clearTimeout(idleRef.current);
      for (const event of events) {
        window.removeEventListener(event, resetIdleTimer);
      }
    };
  }, [token, resetIdleTimer]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 72}`;
    setToken(res.data.token);
    setUser(res.data.user);
    router.push('/dashboard');
  };

  const register = async (data: Record<string, unknown>) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/register', data);
    document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 72}`;
    setToken(res.data.token);
    setUser(res.data.user);
    router.push('/dashboard?registered=1');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
