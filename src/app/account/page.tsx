'use client';

import { API_CONFIGURED } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AccountsComingSoon, AuthCard, Field, FormMessage, PasswordField, strength } from '@/components/forms';

export default function AccountPage() {
  return API_CONFIGURED ? <AccountPageInner /> : <AccountsComingSoon />;
}

function AccountPageInner() {
  const { user, loading } = useAuth();
  if (loading) return <AuthCard title="Account"><p className="text-center text-muted">Loading…</p></AuthCard>;
  if (!user) return <SignIn />;
  if (user.mustChangePassword) return <ChangePassword forced />;
  return <MyAccount />;
}

function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await signIn(email, password); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthCard title="Sign in" subtitle="Welcome back to Mithra's Thread Wonders">
      <form onSubmit={submit} className="space-y-4">
        <FormMessage error={error} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="text-right text-sm"><Link href="/account/forgot/" className="font-semibold text-brand-blue hover:underline">Forgot password?</Link></div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New here? <Link href="/account/signup/" className="font-semibold text-brand-violet hover:underline">Create an account</Link></p>
      <p className="mt-2 text-center text-xs text-muted">You don’t need an account to order — use WhatsApp on any design.</p>
    </AuthCard>
  );
}

function ChangePassword({ forced = false }: { forced?: boolean }) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const s = strength(next);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    try { await changePassword(current, next); setSuccess('Password changed.'); setCurrent(''); setNext(''); }
    catch (err) { setError((err as Error).message); }
  }
  const form = (
    <form onSubmit={submit} className="space-y-4">
      <FormMessage error={error} success={success} />
      <PasswordField label={forced ? 'Temporary password' : 'Current password'} autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordField label="New password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)}
        hint={next ? s.label : 'At least 8 characters'} />
      <button type="submit" className="btn btn-primary w-full">Change password</button>
    </form>
  );
  return forced
    ? <AuthCard title="Choose a new password" subtitle="For your security, replace the temporary password before continuing.">{form}</AuthCard>
    : form;
}

function MyAccount() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const staff = user.role === 'admin' || user.role === 'editor';
  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 md:grid-cols-2">
      <section className="rounded-2xl border border-brand-gold bg-white p-6">
        <h1 className="text-3xl font-semibold text-brand-plum">My account</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div><dt className="font-semibold">Name</dt><dd>{user.displayName || '—'}</dd></div>
          <div><dt className="font-semibold">Email</dt><dd>{user.email}</dd></div>
          <div><dt className="font-semibold">Role</dt><dd className="capitalize">{user.isSuperAdmin ? 'Super admin' : user.role}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {staff && <Link href="/admin/" className="btn btn-primary">Admin dashboard</Link>}
          <button type="button" onClick={signOut} className="btn btn-outline">Sign out</button>
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-2xl font-semibold text-brand-plum">Change password</h2>
        <div className="mt-4"><ChangePassword /></div>
      </section>
    </div>
  );
}
