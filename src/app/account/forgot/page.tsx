'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AccountsComingSoon, AuthCard, Field, FormMessage } from '@/components/forms';
import { API_CONFIGURED, api } from '@/lib/api';

export default function ForgotPage() {
  return API_CONFIGURED ? <ForgotPageInner /> : <AccountsComingSoon />;
}

function ForgotPageInner() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { setDone((await api<{ message: string }>('/api/auth/forgot', { body: { email } })).message); }
    catch (err) { setError((err as Error).message); }
  }
  return (
    <AuthCard title="Forgot password" subtitle="We’ll arrange a reset link for you">
      {done ? <FormMessage success={done} /> : (
        <form onSubmit={submit} className="space-y-4">
          <FormMessage error={error} />
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-primary w-full">Request reset link</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link href="/account/" className="font-semibold text-brand-violet hover:underline">Back to sign in</Link></p>
    </AuthCard>
  );
}
