'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage, Toggle, panel, smallBtn, useContent, type Doc } from '@/components/admin';
import { Field, FormMessage, inputClass } from '@/components/forms';
import { api } from '@/lib/api';
import { resizeToWebp, slugify } from '@/lib/image';
import { asset } from '@/lib/paths';

export default function EditProductPage() {
  return <AdminGuard><Editor /></AdminGuard>;
}

const blank: Doc = {
  sku: '', slug: '', title: '', subtitle: '', price: '', currency: 'CAD', categoryId: '', availability: 'made-to-order',
  customisable: true, featured: false, status: 'active', description: '', bullets: [], specs: {}, images: [], listings: [], video: '',
};

function Editor() {
  const router = useRouter();
  const products = useContent('products');
  const categories = useContent('categories');
  const collections = useContent('collections');
  const [id, setId] = useState<string | null | undefined>(undefined); // undefined = reading URL, null = new
  const [p, setP] = useState<Doc>(blank);
  const [bulletsText, setBulletsText] = useState('');
  const [specRows, setSpecRows] = useState<[string, string][]>([]);
  const [asin, setAsin] = useState('');
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [busy, setBusy] = useState('');

  useEffect(() => { setId(new URLSearchParams(window.location.search).get('id')); }, []);
  useEffect(() => {
    if (!id || !products.items) return;
    const found = products.items.find((x) => x.slug === id);
    if (!found) { setMsg({ error: 'Product not found', success: '' }); return; }
    setP({ ...blank, ...found });
    setBulletsText((found.bullets ?? []).join('\n'));
    setSpecRows(Object.entries(found.specs ?? {}) as [string, string][]);
    setAsin(found.listings?.[0]?.asin ?? '');
  }, [id, products.items]);

  const isNew = id === null;
  const set = (k: string, v: unknown) => setP((x) => ({ ...x, [k]: v }));
  const slug = isNew ? (p.slug || slugify(p.title)) : p.slug;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (!slug) { setMsg({ error: 'Enter the product title first (it sets the web address used for photos).', success: '' }); return; }
    setBusy(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…`);
    try {
      const added: Doc[] = [];
      for (const f of Array.from(files)) {
        const { src } = await api<{ src: string }>('/api/uploads', { body: { folder: 'products', slug, dataUrl: await resizeToWebp(f) } });
        added.push({ src, alt: p.title || f.name });
      }
      setP((x) => ({ ...x, images: [...(x.images ?? []), ...added] }));
      setMsg({ error: '', success: `${added.length} photo(s) uploaded — remember to Save.` });
    } catch (e) { setMsg({ error: (e as Error).message, success: '' }); }
    setBusy('');
  }

  const moveImage = (i: number, d: -1 | 1) => setP((x) => {
    const imgs = [...x.images]; const j = i + d; if (j < 0 || j >= imgs.length) return x;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; return { ...x, images: imgs };
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy('Saving…'); setMsg({ error: '', success: '' });
    const data = {
      ...p, slug, title: p.title,
      bullets: bulletsText.split('\n').map((b) => b.trim()).filter(Boolean),
      specs: Object.fromEntries(specRows.filter(([k]) => k.trim())),
      listings: asin.trim() ? [{ channel: 'amazon', marketplace: 'ca', asin: asin.trim().toUpperCase() }] : [],
    };
    try {
      await api(`/api/content/products/${slug}`, { method: 'PUT', body: data });
      setMsg({ error: '', success: 'Saved.' });
      if (isNew) {
        await products.reload(); // refresh the list first, so the editor finds the new product
        setId(slug);
        router.replace(`/admin/products/edit/?id=${slug}`);
      }
    } catch (err) { setMsg({ error: (err as Error).message, success: '' }); }
    setBusy('');
  }

  if (id === undefined || (id && !products.items)) return <p className="py-20 text-center text-muted">Loading…</p>;
  const collectionName = (cid: string) => collections.items?.find((c) => c.id === cid)?.name ?? '';

  return (
    <AdminPage title={isNew ? 'Add a product' : `Edit: ${p.title}`} crumb="Products"
      actions={<div className="flex gap-2">{!isNew && <Link href={`/products/${p.slug}/`} target="_blank" className="btn btn-outline">View on site</Link>}<Link href="/admin/products/" className="btn btn-outline">Back to list</Link></div>}>
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className={`${panel} space-y-4 p-6`}>
            <h2 className="text-2xl font-semibold text-brand-plum">Details</h2>
            <Field label="Title" required value={p.title} onChange={(e) => set('title', e.target.value)} />
            <Field label="Subtitle (optional)" value={p.subtitle ?? ''} onChange={(e) => set('subtitle', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SKU" required value={p.sku} onChange={(e) => set('sku', e.target.value)} hint="Exactly as in Amazon Seller Central, if listed there." />
              <Field label="Price (CAD)" value={p.price} onChange={(e) => set('price', e.target.value)} placeholder="24.99" hint="Leave empty for “Price on request”." />
            </div>
            {isNew
              ? <Field label="Web address" value={slug} onChange={(e) => set('slug', slugify(e.target.value))} hint="Set from the title. Can’t be changed after saving." />
              : <p className="text-sm"><span className="font-semibold">Web address:</span> <span className="text-muted">/products/{p.slug}/</span></p>}
            <label className="block text-sm"><span className="mb-1 block font-semibold">Category</span>
              <select required value={p.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputClass}>
                <option value="">Choose…</option>
                {(categories.items ?? []).sort((a, b) => `${collectionName(a.collectionId)}${a.name}`.localeCompare(`${collectionName(b.collectionId)}${b.name}`)).map((c) => (
                  <option key={c.id} value={c.id}>{collectionName(c.collectionId)} › {c.name}</option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-muted">Need a new one? <Link href="/admin/categories/" className="underline">Manage categories</Link></span>
            </label>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Description</span>
              <textarea value={p.description} onChange={(e) => set('description', e.target.value)} rows={6} className={inputClass} />
            </label>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Key points (one per line)</span>
              <textarea value={bulletsText} onChange={(e) => setBulletsText(e.target.value)} rows={4} className={inputClass} placeholder={'Handmade in India\nLightweight and comfortable'} />
            </label>
          </section>

          <section className={`${panel} space-y-3 p-6`}>
            <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold text-brand-plum">Details table</h2>
              <button type="button" className={smallBtn} onClick={() => setSpecRows((r) => [...r, ['', '']])}>+ Add row</button></div>
            {specRows.length === 0 && <p className="text-sm text-muted">Optional: material, colour, size, chain length…</p>}
            {specRows.map(([k, v], i) => (
              <div key={i} className="grid grid-cols-[2fr_3fr_auto] gap-2">
                <input aria-label="Detail name" value={k} placeholder="e.g. Colour" className={inputClass} onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} />
                <input aria-label="Detail value" value={v} placeholder="e.g. Red, Gold" className={inputClass} onChange={(e) => setSpecRows((r) => r.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} />
                <button type="button" className={`${smallBtn} text-brand-magenta`} onClick={() => setSpecRows((r) => r.filter((_, j) => j !== i))} aria-label="Remove row">×</button>
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${panel} space-y-3 p-6`}>
            <h2 className="text-2xl font-semibold text-brand-plum">Photos</h2>
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-brand-gold bg-cream p-5 text-center text-sm hover:bg-white">
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
              <span className="font-semibold text-brand-violet">Choose photos</span> or take them with your phone<br />
              <span className="text-xs text-muted">They’re resized automatically. The first photo is the main one.</span>
            </label>
            <ul className="space-y-2">
              {(p.images ?? []).map((img: Doc, i: number) => (
                <li key={img.src} className="flex items-center gap-3 rounded-lg border border-line p-2">
                  <img src={asset(img.src)} alt="" className="h-16 w-16 rounded bg-white object-contain" />
                  <input aria-label="Photo description" value={img.alt} placeholder="Describe the photo" className={`${inputClass} !py-1.5 text-sm`}
                    onChange={(e) => setP((x) => ({ ...x, images: x.images.map((m: Doc, j: number) => (j === i ? { ...m, alt: e.target.value } : m)) }))} />
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" className={smallBtn} onClick={() => moveImage(i, -1)} aria-label="Move up">↑</button>
                    <button type="button" className={smallBtn} onClick={() => moveImage(i, 1)} aria-label="Move down">↓</button>
                  </div>
                  <button type="button" className={`${smallBtn} text-brand-magenta`} aria-label="Remove photo" onClick={() => setP((x) => ({ ...x, images: x.images.filter((_: Doc, j: number) => j !== i) }))}>×</button>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${panel} space-y-4 p-6`}>
            <h2 className="text-2xl font-semibold text-brand-plum">Selling</h2>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Availability</span>
              <select value={p.availability} onChange={(e) => set('availability', e.target.value)} className={inputClass}>
                <option value="ships-from-canada">In stock — ships within Canada</option>
                <option value="made-to-order">Made to order</option>
              </select>
            </label>
            <Toggle label="Show on the website" checked={p.status !== 'hidden'} onChange={(v) => set('status', v ? 'active' : 'hidden')} />
            <Toggle label="Featured on the home page" checked={!!p.featured} onChange={(v) => set('featured', v)} />
            <Toggle label="Offer custom colours / bulk quote" checked={p.customisable !== false} onChange={(v) => set('customisable', v)} />
            <Field label="Amazon.ca ASIN (optional)" value={asin} onChange={(e) => setAsin(e.target.value)} placeholder="B0HNPBWRK6" hint="Shows a “Buy on Amazon.ca” button." />
            <Field label="Product video (optional)" value={p.video ?? ''} onChange={(e) => set('video', e.target.value)} placeholder="Instagram reel or YouTube link" />
          </section>

          <div className="sticky bottom-4 space-y-2 rounded-2xl border border-brand-gold bg-white/95 p-4 shadow-lg backdrop-blur">
            <FormMessage error={msg.error} success={busy || msg.success} />
            <button type="submit" disabled={!!busy} className="btn btn-primary w-full disabled:opacity-60">{isNew ? 'Create product' : 'Save changes'}</button>
          </div>
        </div>
      </form>
    </AdminPage>
  );
}
