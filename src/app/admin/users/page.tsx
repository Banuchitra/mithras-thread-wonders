'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/components/AuthProvider';
import { Field, FormMessage, PasswordField, inputClass } from '@/components/forms';
import { api, type User } from '@/lib/api';

type ResetRequest = { id: string; email: string; createdAt: string };
const ROLES: User['role'][] = ['admin', 'editor', 'customer'];
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

export default function UsersPage() {
  return <AdminGuard adminOnly><Users /></AdminGuard>;
}

function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [allowSignups, setAllowSignups] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [link, setLink] = useState<{ email: string; url: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, r, s] = await Promise.all([
        api<{ users: User[] }>('/api/users'),
        api<{ requests: ResetRequest[] }>('/api/reset-requests'),
        api<{ allowSignups: boolean }>('/api/settings/public'),
      ]);
      setUsers(u.users); setRequests(r.requests); setAllowSignups(s.allowSignups);
    } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setError(''); setNotice('');
    try { await fn(); setNotice(ok); await load(); } catch (e) { setError((e as Error).message); }
  };
  const enc = encodeURIComponent;
  const resetLink = async (email: string) => {
    setError('');
    try { const r = await api<{ link: string }>(`/api/users/${enc(email)}/reset-link`, { body: {} }); setLink({ email, url: r.link }); await load(); }
    catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="px-4 py-6 lg:px-0 lg:py-2">
      <p className="eyebrow text-brand-gold-text"><Link href="/admin/" className="hover:underline">Admin</Link> / Users</p>
      <h1 className="mt-1 text-4xl font-semibold text-brand-plum">User management</h1>
      <div className="mt-4 space-y-2"><FormMessage error={error} success={notice} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-brand-gold bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-2xl font-semibold text-brand-plum">People ({users.length})</h2>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={allowSignups} className="h-4 w-4 accent-[#6A2C91]"
                onChange={(e) => run(() => api('/api/settings', { method: 'PATCH', body: { allowSignups: e.target.checked } }), e.target.checked ? 'Sign-ups are open.' : 'Sign-ups are closed.')} />
              Allow people to sign up
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left">
                <tr><th className="px-4 py-2">Person</th><th className="px-4 py-2">Role</th><th className="px-4 py-2">Last sign-in</th><th className="px-4 py-2">Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const self = u.email === me?.email;
                  const locked = u.isSuperAdmin;
                  return (
                    <tr key={u.email} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{u.displayName || '—'} {u.isSuperAdmin && <span className="eyebrow ml-1 text-[0.6rem] text-brand-gold-text">Super admin</span>}</p>
                        <p className="text-muted">{u.email}</p>
                        {u.disabled && <p className="text-xs font-semibold text-brand-magenta">Disabled</p>}
                        {u.mustChangePassword && <p className="text-xs text-muted">Must set a new password</p>}
                      </td>
                      <td className="px-4 py-3">
                        <select aria-label={`Role for ${u.email}`} value={u.role} disabled={locked}
                          className="rounded border border-line bg-white px-2 py-1 disabled:opacity-60"
                          onChange={(e) => run(() => api(`/api/users/${enc(u.email)}`, { method: 'PATCH', body: { role: e.target.value } }), `${u.email} is now ${e.target.value}.`)}>
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted">{fmt(u.lastLoginAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="rounded border border-line px-2 py-1 hover:border-brand-violet" onClick={() => resetLink(u.email)}>Reset link</button>
                          {!locked && !self && (
                            <button type="button" className="rounded border border-line px-2 py-1 hover:border-brand-violet"
                              onClick={() => run(() => api(`/api/users/${enc(u.email)}`, { method: 'PATCH', body: { disabled: !u.disabled } }), u.disabled ? `${u.email} enabled.` : `${u.email} disabled.`)}>
                              {u.disabled ? 'Enable' : 'Disable'}
                            </button>
                          )}
                          {!locked && !self && (confirmRemove === u.email ? (
                            <>
                              <button type="button" className="rounded bg-brand-magenta px-2 py-1 font-semibold text-white"
                                onClick={() => { setConfirmRemove(null); run(() => api(`/api/users/${enc(u.email)}`, { method: 'DELETE' }), `${u.email} removed.`); }}>Confirm remove</button>
                              <button type="button" className="rounded px-2 py-1" onClick={() => setConfirmRemove(null)}>Cancel</button>
                            </>
                          ) : (
                            <button type="button" className="rounded border border-line px-2 py-1 text-brand-magenta hover:border-brand-magenta" onClick={() => setConfirmRemove(u.email)}>Remove</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          {link && (
            <section className="rounded-2xl border border-brand-teal bg-white p-5">
              <h2 className="text-xl font-semibold text-brand-plum">Reset link for {link.email}</h2>
              <p className="mt-1 text-sm text-muted">Send this to them (e.g. WhatsApp). It works once, for 24 hours.</p>
              <textarea readOnly value={link.url} className={`${inputClass} mt-3 h-24 text-xs`} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className="btn btn-outline mt-2 !py-2 text-sm" onClick={() => navigator.clipboard?.writeText(link.url).then(() => setNotice('Link copied.'))}>Copy link</button>
            </section>
          )}
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-xl font-semibold text-brand-plum">Password reset requests</h2>
            {requests.length === 0 ? <p className="mt-2 text-sm text-muted">No requests waiting.</p> : (
              <ul className="mt-3 space-y-2 text-sm">
                {requests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-cream px-3 py-2">
                    <span><span className="font-semibold">{r.email}</span><br /><span className="text-xs text-muted">{fmt(r.createdAt)}</span></span>
                    <button type="button" className="btn btn-primary !px-3 !py-1.5 text-xs" onClick={() => resetLink(r.email)}>Create link</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <AddUser onAdded={(email) => run(async () => undefined, `${email} added — they must set a new password at first sign-in.`)} />
        </div>
      </div>
    </div>
  );
}

function AddUser({ onAdded }: { onAdded: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('customer');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      await api('/api/users', { body: { email, name, role, password } });
      onAdded(email); setEmail(''); setName(''); setPassword(''); setRole('customer');
    } catch (err) { setError((err as Error).message); }
  }
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-xl font-semibold text-brand-plum">Add a person</h2>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <FormMessage error={error} />
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm"><span className="mb-1 block font-semibold">Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value as User['role'])} className={inputClass}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <PasswordField label="Temporary password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
          hint="They’ll be asked to choose their own at first sign-in." />
        <button type="submit" className="btn btn-primary w-full">Add person</button>
      </form>
    </section>
  );
}
