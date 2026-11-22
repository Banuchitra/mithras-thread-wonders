'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage, panel, smallBtn, useContent } from '@/components/admin';
import { FormMessage, inputClass } from '@/components/forms';
import { api } from '@/lib/api';
import { asset } from '@/lib/paths';

export default function ProductsAdmin() {
  return <AdminGuard><Products /></AdminGuard>;
}

function Products() {
  const { items, error, reload } = useContent('products');
  const cats = useContent('categories');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [confirm, setConfirm] = useState<string | null>(null);
  const catName = (id: string) => cats.items?.find((c) => c.id === id)?.name ?? id;
  const list = useMemo(() => (items ?? [])
    .filter((p) => !q || `${p.title} ${p.sku} ${catName(p.categoryId)}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => String(a.title).localeCompare(String(b.title))), [items, q, cats.items]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn: () => Promise<unknown>, success: string) => {
    try { await fn(); setMsg({ error: '', success }); await reload(); } catch (e) { setMsg({ error: (e as Error).message, success: '' }); }
  };

  return (
    <AdminPage title="Products" crumb="Products" actions={<Link href="/admin/products/edit/" className="btn btn-primary">+ Add product</Link>}>
      <div className="space-y-3"><FormMessage error={error || msg.error} success={msg.success} /></div>
      <div className={`${panel} mt-4 overflow-hidden`}>
        <div className="border-b border-line p-4">
          <label className="sr-only" htmlFor="q">Search products</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${items?.length ?? ''} products by name, SKU or category`} className={inputClass} />
        </div>
        {!items ? <p className="p-6 text-muted">Loading…</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left"><tr><th className="px-4 py-2">Product</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Price</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.slug} className="border-t border-line align-middle">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? <img src={asset(p.images[0].src)} alt="" className="h-14 w-14 rounded border border-line bg-white object-contain" /> : <span className="h-14 w-14 rounded border border-dashed border-line" />}
                        <span><span className="font-semibold">{p.title}</span><br /><span className="text-xs text-muted">SKU {p.sku}</span></span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{catName(p.categoryId)}</td>
                    <td className="px-4 py-2">{p.price ? `CA$${p.price}` : <span className="text-muted">On request</span>}</td>
                    <td className="px-4 py-2">{p.status === 'hidden' ? <span className="font-semibold text-brand-magenta">Hidden</span> : 'Live'}{p.featured && <span className="eyebrow ml-2 text-[0.6rem] text-brand-gold-text">Featured</span>}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/products/edit/?id=${p.slug}`} className={smallBtn}>Edit</Link>
                        <button type="button" className={smallBtn} onClick={() => act(() => api(`/api/content/products/${p.slug}`, { method: 'PUT', body: { ...p, status: p.status === 'hidden' ? 'active' : 'hidden' } }), p.status === 'hidden' ? 'Product is live.' : 'Product hidden.')}>{p.status === 'hidden' ? 'Show' : 'Hide'}</button>
                        {confirm === p.slug
                          ? <><button type="button" className="rounded bg-brand-magenta px-2.5 py-1 text-sm font-semibold text-white" onClick={() => { setConfirm(null); act(() => api(`/api/content/products/${p.slug}`, { method: 'DELETE' }), 'Product deleted.'); }}>Confirm delete</button>
                              <button type="button" className="px-2 text-sm" onClick={() => setConfirm(null)}>Cancel</button></>
                          : <button type="button" className={`${smallBtn} text-brand-magenta`} onClick={() => setConfirm(p.slug)}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">Changes save to the site’s content files. On localhost, refresh the shop to see them; new product pages may need the dev server restarted.</p>
    </AdminPage>
  );
}
