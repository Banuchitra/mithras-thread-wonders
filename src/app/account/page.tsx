'use client';

import { API_CONFIGURED } from '@/lib/api';
import { ADMIN_BACKEND } from '@/lib/content-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { AccountsComingSoon, AuthCard, FormMessage, PasswordField, strength } from '@/components/forms';

export default function AccountPage() {
  if (ADMIN_BACKEND === 'github') return <AdminPasswordGate />;
  return API_CONFIGURED ? <AccountPageInner /> : <AccountsComingSoon />;
}

function AccountPageInner() {
  const { user, loading } = useAuth();
  if (loading) return <AuthCard title="Account"><p className="text-center text-muted">Loading…</p></AuthCard>;
  if (!user) return <SignIn />;
  if (user.mustChangePassword) return <ChangePassword forced />;
  return <MyAccount />;
}

// Only the shop owner signs in (no customer accounts), so this asks for the admin password only.
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'mithras.canada@gmail.com';

function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const u = await signIn(ADMIN_EMAIL, password);
      if (!u.mustChangePassword && (u.role === 'admin' || u.role === 'editor')) router.push('/admin/'); // straight to the dashboard
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg === 'Email or password is incorrect' ? 'That password is not correct' : msg);
    } finally { setBusy(false); }
  }
  return (
    <AuthCard title="Admin sign in" subtitle="For the shop owner">
      <form onSubmit={submit} className="space-y-4">
        <FormMessage error={error} />
        <PasswordField label="Admin password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">Customers don’t need an account — order on WhatsApp from any design.</p>
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
    <div className="mx-auto grid grid-cols-1 max-w-4xl gap-6 px-4 py-12 md:grid-cols-2">
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

/** Live site: the shop owner signs in with the admin password only. */
function AdminPasswordGate() {
  const { user, loading, signInWithPassword } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user) router.replace('/admin/'); }, [user, router]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <AuthCard title="Admin"><p className="text-center text-muted">Loading…</p></AuthCard>;
  if (user) return <AuthCard title="Opening admin…"><p className="text-center text-muted">One moment…</p></AuthCard>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await signInWithPassword(password); setPassword(''); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <AuthCard title="Admin sign in" subtitle="For the shop owner">
      <form onSubmit={submit} className="space-y-4">
        <FormMessage error={error} />
        <PasswordField label="Admin password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Unlocking…' : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">Customers don’t need an account — order on WhatsApp from any design.</p>
    </AuthCard>
  );
}
