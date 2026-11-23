'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { useAuth } from '@/components/AuthProvider';
import type { Doc } from '@/components/admin';
import { Icon } from '@/components/icons';
import { Monogram } from '@/components/Monogram';
import { activePromotions, todayIso } from '@/domain/promotions';
import type { Promotion } from '@/domain/promotions';
import { api } from '@/lib/api';
import { ADMIN_BACKEND } from '@/lib/content-client';
import { asset } from '@/lib/paths';
import { content } from '@/lib/content-client';

export default function AdminHome() {
  return <AdminGuard><Dashboard /></AdminGuard>;
}

type Inquiry = { id: string; createdAt: string; name: string; country: string; status: string; photoCount: number; items: { item: string; quantity: number }[]; message: string };

function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Doc[] | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [promos, setPromos] = useState<Promotion[] | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    content.list('products').then(setProducts).catch(() => setProducts([]));
    if (ADMIN_BACKEND === 'api') api<{ inquiries: Inquiry[] }>('/api/inquiries').then((r) => setInquiries(r.inquiries)).catch(() => setInquiries([]));
    else setInquiries([]);
    content.list('promotions').then((r) => setPromos(r as Promotion[])).catch(() => setPromos([]));
    if (user?.role === 'admin' && ADMIN_BACKEND === 'api') api<{ users: unknown[] }>('/api/users').then((r) => setUserCount(r.users.length)).catch(() => {});
  }, [user]);

  const live = (products ?? []).filter((p) => p.status !== 'hidden');
  const hidden = (products ?? []).length - live.length;
  const featured = live.filter((p) => p.featured).length;
  const newReq = (inquiries ?? []).filter((i) => i.status === 'new');
  const attention = (products ?? []).flatMap((p) => {
    const issues = [!p.images?.length && 'no photo', !p.price && 'no price', !p.description && 'no description', p.status === 'hidden' && 'hidden'].filter(Boolean) as string[];
    return issues.length ? [{ p, issues }] : [];
  });
  const today = todayIso();
  const running = promos ? [...activePromotions(promos, today, 'banner'), ...activePromotions(promos, today, 'video')] : [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Live products', value: live.length, icon: 'products', tone: 'from-brand-violet to-brand-magenta', href: '/admin/products/' },
    ADMIN_BACKEND === 'api'
      ? { label: 'New requests', value: newReq.length, icon: 'requests', tone: 'from-brand-magenta to-[#F58529]', href: '/admin/inquiries/' }
      : { label: 'Hidden products', value: hidden, icon: 'eyeoff', tone: 'from-brand-magenta to-[#F58529]', href: '/admin/products/' },
    { label: 'Featured on home', value: featured, icon: 'star', tone: 'from-brand-gold to-[#B8860B]', href: '/admin/products/' },
    userCount !== null
      ? { label: 'People with accounts', value: userCount, icon: 'users', tone: 'from-brand-blue to-brand-teal', href: '/admin/users/' }
      : { label: 'Hidden products', value: hidden, icon: 'eyeoff', tone: 'from-brand-blue to-brand-teal', href: '/admin/products/' },
  ];
  const actions = [
    { title: 'Add a product', text: 'Photos, price, description — from your phone.', href: '/admin/products/edit/', icon: 'add' },
    ...(ADMIN_BACKEND === 'api' ? [{ title: 'Reply to requests', text: 'Customers’ photos and reels, one tap to WhatsApp.', href: '/admin/inquiries/', icon: 'requests' }] : []),
    { title: 'Update offers', text: 'Banner, video panel and the announcement bar.', href: '/admin/website/', icon: 'megaphone' },
    { title: 'Organise categories', text: 'Add, rename or reorder — menus update themselves.', href: '/admin/categories/', icon: 'categories' },
  ];

  return (
    <div className="space-y-6 px-4 py-6 lg:px-0 lg:py-2">
      {/* Welcome band */}
      <section className="heritage relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="hidden rounded-full p-2 ring-1 ring-brand-gold-light sm:block"><Monogram variant="light" size={88} /></div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-brand-gold-light">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">{greeting}, {user?.displayName || 'there'}</h1>
            <p className="mt-2 text-[#F3E3C3]">
              {ADMIN_BACKEND !== 'api' ? 'Changes you save go live on the website in about a minute.' : newReq.length ? `You have ${newReq.length} new custom-order request${newReq.length > 1 ? 's' : ''} waiting.` : 'No new requests right now — a good moment to add new designs.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products/edit/" className="btn btn-gold"><Icon name="add" />Add product</Link>
            {newReq.length > 0 && <Link href="/admin/inquiries/" className="btn btn-ghost-light"><Icon name="requests" />View requests</Link>}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group relative overflow-hidden rounded-2xl border border-brand-gold/60 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-15 transition group-hover:scale-125`} />
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.tone} text-white shadow`}><Icon name={s.icon} /></span>
            <p className="mt-4 font-heading text-4xl font-semibold text-brand-plum">{products === null ? '…' : s.value}</p>
            <p className="text-sm font-semibold text-muted">{s.label}</p>
          </Link>
        ))}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((a) => (
          <Link key={a.title} href={a.href} className="group flex items-start gap-4 rounded-2xl border border-line bg-white/90 p-5 transition hover:border-brand-violet hover:bg-white hover:shadow-lg">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream text-brand-violet ring-1 ring-brand-gold transition group-hover:bg-brand-violet group-hover:text-white"><Icon name={a.icon} className="h-6 w-6" /></span>
            <span>
              <span className="block font-heading text-xl font-semibold text-brand-plum">{a.title}</span>
              <span className="mt-1 block text-sm text-muted">{a.text}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className={`grid gap-6 ${ADMIN_BACKEND === 'api' ? 'xl:grid-cols-[3fr_2fr]' : 'xl:grid-cols-2'}`}>
        {/* Latest requests (server-backed; on the live site requests arrive on WhatsApp) */}
        {ADMIN_BACKEND === 'api' && <section className="overflow-hidden rounded-2xl border border-brand-gold bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-brand-plum"><Icon name="requests" className="h-6 w-6 text-brand-violet" />Latest requests</h2>
            <Link href="/admin/inquiries/" className="text-sm font-semibold text-brand-blue hover:underline">See all →</Link>
          </div>
          {!inquiries ? <p className="p-5 text-muted">Loading…</p> : inquiries.length === 0 ? (
            <p className="p-5 text-muted">No requests yet. When customers send photos for custom orders, they’ll appear here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {inquiries.slice(0, 5).map((i) => (
                <li key={i.id}>
                  <Link href="/admin/inquiries/" className="flex items-center gap-4 px-5 py-3 hover:bg-cream">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-violet font-heading text-lg font-semibold text-white">{i.name[0]?.toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{i.name}{i.country ? ` · ${i.country}` : ''}</span>
                      <span className="block truncate text-sm text-muted">{i.items[0] ? `${i.items[0].item} × ${i.items[0].quantity}` : i.message || 'Reference photos'}{i.photoCount ? ` · ${i.photoCount} photo${i.photoCount > 1 ? 's' : ''}` : ''}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${i.status === 'new' ? 'bg-brand-magenta text-white' : i.status === 'replied' ? 'bg-[#E4F4F0] text-brand-teal-text' : 'bg-cream text-muted'}`}>{i.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>}

        <div className={ADMIN_BACKEND === 'api' ? 'space-y-6' : 'contents'}>
          {/* Needs attention */}
          <section className="overflow-hidden rounded-2xl border border-brand-gold bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-brand-plum"><Icon name="alert" className="h-6 w-6 text-brand-magenta" />Needs attention</h2>
            </div>
            {!products ? <p className="p-5 text-muted">Loading…</p> : attention.length === 0 ? (
              <p className="p-5 text-muted">Every product has a photo, price and description. Lovely!</p>
            ) : (
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {attention.map(({ p, issues }) => (
                  <li key={p.slug}>
                    <Link href={`/admin/products/edit/?id=${p.slug}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-cream">
                      {p.images?.[0] ? <img src={asset(p.images[0].src)} alt="" className="h-10 w-10 rounded border border-line bg-white object-contain" /> : <span className="h-10 w-10 rounded border border-dashed border-line" />}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.title}</span>
                      <span className="flex shrink-0 flex-wrap justify-end gap-1">{issues.map((x) => <span key={x} className="rounded-full bg-[#FCE8F1] px-2 py-0.5 text-[0.65rem] font-bold text-[#9C1458]">{x}</span>)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Running promotions */}
          <section className="overflow-hidden rounded-2xl border border-brand-gold bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-brand-plum"><Icon name="megaphone" className="h-6 w-6 text-brand-gold-text" />On the home page now</h2>
              <Link href="/admin/website/" className="text-sm font-semibold text-brand-blue hover:underline">Edit →</Link>
            </div>
            {!promos ? <p className="p-5 text-muted">Loading…</p> : running.length === 0 ? <p className="p-5 text-muted">No offers running. Add one to brighten the home page.</p> : (
              <ul className="divide-y divide-line">
                {running.map((pr) => (
                  <li key={pr.id} className="flex items-center gap-3 px-5 py-3">
                    {pr.image ? <img src={asset(pr.image.src)} alt="" className="h-10 w-10 rounded bg-white object-contain" /> : <span className="h-10 w-10 rounded bg-cream" />}
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{pr.title}</span>
                      <span className="text-xs text-muted">{pr.placement === 'video' ? (pr.video ? 'Video panel' : 'Video panel — no video yet') : 'Offers banner'}{pr.endDate ? ` · until ${pr.endDate}` : ''}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
