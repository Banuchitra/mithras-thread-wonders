'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ADMIN_BACKEND } from '@/lib/content-client';
import { useAuth } from './AuthProvider';
import { Icon } from './icons';
import { Monogram } from './Monogram';

// Admin frame: purple sidebar with the monogram, account card and icon navigation (top bar on phones).
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const [newRequests, setNewRequests] = useState(0);
  const staff = !!user && !user.mustChangePassword && (user.role === 'admin' || user.role === 'editor');
  useEffect(() => {
    if (!staff || ADMIN_BACKEND !== 'api') return;
    api<{ inquiries: { status: string }[] }>('/api/inquiries').then((r) => setNewRequests(r.inquiries.filter((i) => i.status === 'new').length)).catch(() => {});
  }, [staff, pathname]);
  if (!staff) return <>{children}</>;

  const nav = [
    { href: '/admin/', label: 'Dashboard', icon: 'dashboard', exact: true },
    ...(ADMIN_BACKEND === 'api' ? [{ href: '/admin/inquiries/', label: 'Requests', icon: 'requests', badge: newRequests }] : []),
    { href: '/admin/products/', label: 'Products', icon: 'products', exact: true },
    { href: '/admin/products/edit/', label: 'Add product', icon: 'add' },
    { href: '/admin/categories/', label: 'Categories', icon: 'categories' },
    { href: '/admin/website/', label: 'Website', icon: 'website' },
    ...(user.role === 'admin' && ADMIN_BACKEND === 'api' ? [{ href: '/admin/users/', label: 'Users', icon: 'users' }] : []),
  ];
  const active = (href: string, exact?: boolean) => (exact ? pathname === href || pathname === href.slice(0, -1) : pathname.startsWith(href.slice(0, -1)));

  return (
    <div className="mx-auto flex max-w-[96rem] flex-col gap-0 lg:flex-row lg:gap-6 lg:px-4 lg:py-6">
      {/* sticky wrapper is separate: .heritage sets position:relative, which would cancel sticky */}
      <aside className="lg:sticky lg:top-28 lg:w-64 lg:shrink-0 lg:self-start">
        <div className="heritage overflow-hidden lg:rounded-2xl lg:ring-1 lg:ring-brand-gold/40">
        <div className="hidden items-center gap-3 border-b border-white/10 px-5 py-5 lg:flex">
          <Monogram variant="light" size={48} />
          <div className="min-w-0">
            <p className="font-heading text-xl font-semibold leading-tight text-white">Admin</p>
            <p className="truncate text-xs text-[#F3E3C3]">{user.displayName || user.email}</p>
            <p className="eyebrow text-[0.55rem] text-brand-gold-light">{user.isSuperAdmin ? 'Super admin' : user.role}</p>
          </div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 py-2 lg:flex-col lg:px-3 lg:py-4">
          {nav.map((n) => {
            const on = active(n.href, n.exact);
            return (
              <Link key={n.href} href={n.href} aria-current={on ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${on ? 'bg-white text-brand-plum shadow' : 'text-[#F3E3C3] hover:bg-white/10 hover:text-white'}`}>
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {!!n.badge && <span className="ml-auto rounded-full bg-brand-magenta px-2 py-0.5 text-[0.65rem] font-bold text-white">{n.badge} new</span>}
              </Link>
            );
          })}
          <Link href="/" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#F3E3C3] hover:bg-white/10 hover:text-white lg:mt-4 lg:border-t lg:border-white/10 lg:pt-4">
            <Icon name="view" /><span>View website</span>
          </Link>
        </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
