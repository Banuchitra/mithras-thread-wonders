'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ApiError, api, getToken, setToken, type Session, type User } from '@/lib/api';

interface Auth {
  user: User | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  changePassword(currentPassword: string, newPassword: string): Promise<User>;
  signOut(): void;
}

const Ctx = createContext<Auth | null>(null);
export const useAuth = () => {
  const a = useContext(Ctx);
  if (!a) throw new Error('useAuth must be used inside AuthProvider');
  return a;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api<User>('/api/me')
      .then(setUser)
      .catch((e) => { if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const start = useCallback((s: Session) => { setToken(s.token); setUser(s.user); return s.user; }, []);
  const value: Auth = {
    user,
    loading,
    signIn: async (email, password) => start(await api<Session>('/api/auth/login', { body: { email, password } })),
    signUp: async (name, email, password) => start(await api<Session>('/api/auth/signup', { body: { name, email, password } })),
    changePassword: async (currentPassword, newPassword) => start(await api<Session>('/api/auth/change-password', { body: { currentPassword, newPassword } })),
    signOut: () => { setToken(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
