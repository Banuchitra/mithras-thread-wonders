'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';

export default function AdminHome() {
  return <AdminGuard><Dashboard /></AdminGuard>;
}

function Dashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => {
    if (user?.role === 'admin') api<{ requests: unknown[] }>('/api/reset-requests').then((r) => setPending(r.requests.length)).catch(() => setPending(null));
  }, [user]);
  const cards = [
    { title: 'Custom-order requests', text: 'Customers’ requests with reference photos and reels — reply on WhatsApp, track status.', href: '/admin/inquiries/', soon: '' },
    { title: 'Add a product', text: 'Upload photos and fill in the product form.', href: '/admin/products/edit/', soon: '' },
    { title: 'Products', text: 'Search, edit prices, photos, descriptions and videos; hide or delete products.', href: '/admin/products/', soon: '' },
    { title: 'Collections & categories', text: 'Add, rename, reorder or hide — the shop menus update automatically.', href: '/admin/categories/', soon: '' },
    { title: 'Customise the website', text: 'Offers banner, video panel, announcement bar, contact details, fonts, about text.', href: '/admin/website/', soon: '' },
    ...(user?.role === 'admin' ? [{ title: 'Users', text: `Add or remove people, set roles, reset passwords, open or close sign-ups.${pending ? ` ${pending} reset request${pending > 1 ? 's' : ''} waiting.` : ''}`, href: '/admin/users/', soon: '' }] : []),
  ];
  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10">
      <p className="eyebrow text-brand-gold-text">Admin</p>
      <h1 className="mt-1 text-4xl font-semibold text-brand-plum">Welcome, {user?.displayName || user?.email}</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <h2 className="text-2xl font-semibold text-brand-plum">{c.title}</h2>
              <p className="mt-2 text-sm text-muted">{c.text}</p>
              {c.soon && <span className="eyebrow mt-4 inline-block text-[0.62rem] text-brand-gold-text">{c.soon}</span>}
            </>
          );
          return c.href
            ? <Link key={c.title} href={c.href} className="rounded-2xl border border-brand-gold bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">{inner}</Link>
            : <div key={c.title} className="rounded-2xl border border-line bg-white p-6 opacity-80">{inner}</div>;
        })}
      </div>
    </div>
  );
}
