'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

// Top-right account icon: sign-in link when signed out; menu with admin options when signed in.
export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const icon = (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v1.5h16V19c0-2.8-3.6-5-8-5Z" />
    </svg>
  );
  const btn = 'flex h-12 w-12 items-center justify-center rounded-full text-brand-plum transition hover:bg-cream hover:text-brand-violet';

  if (!user) return <Link href="/account/" aria-label="Sign in" title="Sign in" className={btn}>{icon}</Link>;

  const staff = user.role === 'admin' || user.role === 'editor';
  const initial = (user.displayName || user.email)[0]?.toUpperCase();
  const item = 'block rounded px-3 py-2 text-sm hover:bg-cream';
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Account menu"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-violet font-heading text-xl font-semibold text-white ring-2 ring-brand-gold-light">
        {initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-brand-gold bg-white p-2 shadow-xl">
          <div className="border-b border-line px-3 py-2">
            <p className="font-semibold">{user.displayName || 'My account'}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {staff && <p className="eyebrow mt-1 text-[0.6rem] text-brand-gold-text">{user.isSuperAdmin ? 'Super admin' : user.role}</p>}
          </div>
          {staff && (
            <>
              <Link role="menuitem" href="/admin/" className={item} onClick={() => setOpen(false)}>Admin dashboard</Link>
              <Link role="menuitem" href="/admin/inquiries/" className={item} onClick={() => setOpen(false)}>Custom-order requests</Link>
              <Link role="menuitem" href="/admin/products/edit/" className={item} onClick={() => setOpen(false)}>Add product</Link>
              <Link role="menuitem" href="/admin/products/" className={item} onClick={() => setOpen(false)}>Edit products</Link>
              <Link role="menuitem" href="/admin/categories/" className={item} onClick={() => setOpen(false)}>Categories</Link>
              <Link role="menuitem" href="/admin/website/" className={item} onClick={() => setOpen(false)}>Customise website</Link>
              {user.role === 'admin' && <Link role="menuitem" href="/admin/users/" className={item} onClick={() => setOpen(false)}>Users</Link>}
            </>
          )}
          <Link role="menuitem" href="/account/" className={item} onClick={() => setOpen(false)}>My account</Link>
          <button role="menuitem" type="button" className={`${item} w-full text-left text-brand-magenta`} onClick={() => { signOut(); setOpen(false); }}>Sign out</button>
        </div>
      )}
    </div>
  );
}
