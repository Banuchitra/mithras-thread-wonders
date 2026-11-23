'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { content } from '@/lib/content-client';

export type Doc = Record<string, any>;

/** Loads a content list from the API, with a reload function. */
export function useContent(type: 'products' | 'categories' | 'collections' | 'promotions') {
  const [items, setItems] = useState<Doc[] | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    try { setItems(await content.list(type)); setError(''); }
    catch (e) { setError((e as Error).message); }
  }, [type]);
  useEffect(() => { reload(); }, [reload]);
  return { items, error, reload };
}

export function AdminPage({ title, crumb, actions, children }: { title: string; crumb?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 lg:px-0 lg:py-2">
      <p className="eyebrow text-brand-gold-text"><Link href="/admin/" className="hover:underline">Admin</Link>{crumb ? ` / ${crumb}` : ''}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-semibold text-brand-plum">{title}</h1>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export const panel = 'rounded-2xl border border-brand-gold bg-white';
export const smallBtn = 'rounded border border-line bg-white px-2.5 py-1 text-sm hover:border-brand-violet';

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#6A2C91]" />
      {label}
    </label>
  );
}
