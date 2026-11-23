'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { API_CONFIGURED, ApiError, api, getToken, setToken, type Session, type User } from '@/lib/api';
import { unseal, type SealedKey } from '@/lib/admin-crypto';
import { ADMIN_BACKEND, getAdminKey, setAdminKey } from '@/lib/content-client';
import { GitHubStore } from '@/lib/github-store';
import { asset } from '@/lib/paths';

/** The live site has one admin, signed in with the password (no server). */
const SITE_ADMIN: User = { email: 'admin', displayName: 'Admin', role: 'admin', disabled: false, mustChangePassword: false, isSuperAdmin: true, createdAt: '', lastLoginAt: null };

interface Auth {
  user: User | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<User>;
  /** Live site: unlock the admin key with the password. */
  signInWithPassword(password: string): Promise<User>;
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
    if (ADMIN_BACKEND === 'github') { if (getAdminKey()) setUser(SITE_ADMIN); setLoading(false); return; }
    if (!API_CONFIGURED || !getToken()) { setLoading(false); return; }
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
    signInWithPassword: async (password) => {
      const res = await fetch(asset('/admin-key.json'), { cache: 'no-store' });
      if (!res.ok) throw new Error('Online editing isn’t set up yet (admin key missing).');
      let token: string;
      try { token = await unseal((await res.json()) as SealedKey, password); } catch { throw new Error('That password is not correct'); }
      await new GitHubStore(token).check();
      setAdminKey(token);
      setUser(SITE_ADMIN);
      return SITE_ADMIN;
    },
    signOut: () => { setToken(null); setAdminKey(null); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
