'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthCard, FormMessage, PasswordField, strength } from '@/components/forms';
import { api } from '@/lib/api';

export default function ResetPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  useEffect(() => setToken(new URLSearchParams(window.location.search).get('token') ?? ''), []);
  const s = strength(password);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { setDone((await api<{ message: string }>('/api/auth/reset', { body: { token, password } })).message); }
    catch (err) { setError((err as Error).message); }
  }
  return (
    <AuthCard title="Set a new password">
      {done ? (
        <><FormMessage success={done} /><Link href="/account/" className="btn btn-primary mt-4 w-full">Sign in</Link></>
      ) : !token ? (
        <FormMessage error="This page needs a reset link from the shop owner." />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormMessage error={error} />
          <PasswordField label="New password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            hint={password ? s.label : 'At least 8 characters'} />
          <button type="submit" className="btn btn-primary w-full">Save new password</button>
        </form>
      )}
    </AuthCard>
  );
}
