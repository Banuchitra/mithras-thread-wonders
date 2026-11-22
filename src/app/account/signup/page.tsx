'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AuthCard, Field, FormMessage, PasswordField, strength } from '@/components/forms';
import { api } from '@/lib/api';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ allowSignups: boolean }>('/api/settings/public').then((s) => setOpen(s.allowSignups)).catch(() => setOpen(true)); }, []);
  const s = strength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await signUp(name, email, password); router.push('/account/'); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  if (open === false) {
    return <AuthCard title="Create an account" subtitle="Sign-ups are closed at the moment."><p className="text-center text-sm text-muted">You can still order any design on WhatsApp.</p></AuthCard>;
  }
  return (
    <AuthCard title="Create an account" subtitle="Save your details and follow your orders">
      <form onSubmit={submit} className="space-y-4">
        <FormMessage error={error} />
        <Field label="Your name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          hint={password ? s.label : 'At least 8 characters'} />
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/account/" className="font-semibold text-brand-violet hover:underline">Sign in</Link></p>
    </AuthCard>
  );
}
