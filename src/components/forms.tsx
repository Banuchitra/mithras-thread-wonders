'use client';

import Link from 'next/link';
import { useState } from 'react';

export const inputClass = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 focus:border-brand-violet';

export function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input className={inputClass} {...props} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function PasswordField({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <span className="relative block">
        <input className={`${inputClass} pr-16`} type={show ? 'text' : 'password'} {...props} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-xs font-semibold text-brand-violet hover:bg-cream">
          {show ? 'Hide' : 'Show'}
        </button>
      </span>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="rounded-lg bg-[#FCE8F1] px-3 py-2 text-sm text-[#9C1458]">{error}</p>;
  if (success) return <p role="status" className="rounded-lg bg-[#E4F4F0] px-3 py-2 text-sm text-brand-teal-text">{success}</p>;
  return null;
}

/** Shown on the public site while accounts aren't online yet. */
export function AccountsComingSoon() {
  return (
    <AuthCard title="Accounts coming soon" subtitle="Sign-in for customers and the shop owner is being set up.">
      <p className="text-center text-sm text-muted">You don’t need an account to order — use <strong>Order on WhatsApp</strong> on any design, or send a custom / bulk request.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/shop/" className="btn btn-primary">Browse designs</Link></div>
    </AuthCard>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-brand-gold bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-3xl font-semibold text-brand-plum">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

/** Rough strength hint shown while choosing a password. */
export function strength(pw: string): { label: string; ok: boolean } {
  if (pw.length < 8) return { label: 'At least 8 characters', ok: false };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  return kinds >= 3 || pw.length >= 14 ? { label: 'Strong password', ok: true } : { label: 'OK — longer or mixed characters is stronger', ok: true };
}
