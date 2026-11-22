'use client';

import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage, Toggle, panel, smallBtn, useContent, type Doc } from '@/components/admin';
import { Field, FormMessage, inputClass } from '@/components/forms';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { resizeToWebp, slugify } from '@/lib/image';
import { asset } from '@/lib/paths';

export default function WebsiteAdmin() {
  return <AdminGuard><Website /></AdminGuard>;
}

function Website() {
  const { user } = useAuth();
  return (
    <AdminPage title="Customise the website" crumb="Website">
      <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
        {user?.role === 'admin' ? <Settings /> : <p className={`${panel} p-6 text-muted`}>Only admins can change site settings.</p>}
        <Promotions />
      </div>
    </AdminPage>
  );
}

const FONTS = [
  { value: 'heritage', label: 'Heritage — Cormorant Garamond + Lato' },
  { value: 'temple', label: 'Temple — Marcellus + Mulish' },
  { value: 'royal', label: 'Royal — Playfair Display + Source Sans' },
];

function Settings() {
  const [s, setS] = useState<Doc | null>(null);
  const [msg, setMsg] = useState({ error: '', success: '' });
  useEffect(() => { api<Doc>('/api/content/settings').then(setS).catch((e) => setMsg({ error: e.message, success: '' })); }, []);
  if (!s) return <section className={`${panel} p-6`}><FormMessage error={msg.error} />{!msg.error && <p className="text-muted">Loading…</p>}</section>;
  const set = (k: string, v: string) => setS({ ...s, [k]: v });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try { setS(await api<Doc>('/api/content/settings', { method: 'PUT', body: s })); setMsg({ error: '', success: 'Saved — refresh the site to see it.' }); }
    catch (err) { setMsg({ error: (err as Error).message, success: '' }); }
  }
  return (
    <form onSubmit={save} className={`${panel} space-y-4 p-6`}>
      <h2 className="text-2xl font-semibold text-brand-plum">Site settings</h2>
      <Field label="Announcement bar (top of every page)" value={s.announcement ?? ''} onChange={(e) => set('announcement', e.target.value)} hint="Leave empty to hide the bar." />
      <Field label="Brand name" required value={s.brandName} onChange={(e) => set('brandName', e.target.value)} />
      <Field label="Tagline" value={s.tagline} onChange={(e) => set('tagline', e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp (with country code)" required value={s.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
        <Field label="Instagram handle" value={s.instagram} onChange={(e) => set('instagram', e.target.value)} />
      </div>
      <label className="block text-sm"><span className="mb-1 block font-semibold">Font style</span>
        <select value={s.fontPairing} onChange={(e) => set('fontPairing', e.target.value)} className={inputClass}>
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </label>
      <label className="block text-sm"><span className="mb-1 block font-semibold">About us text</span>
        <textarea value={s.aboutText} onChange={(e) => set('aboutText', e.target.value)} rows={6} className={inputClass} />
      </label>
      <FormMessage error={msg.error} success={msg.success} />
      <button type="submit" className="btn btn-primary w-full">Save settings</button>
    </form>
  );
}

const blankPromo: Doc = { id: '', title: '', subtitle: '', placement: 'banner', ctaLabel: '', ctaHref: '', video: '', startDate: '', endDate: '', order: 1, hidden: false };

function Promotions() {
  const { items, reload } = useContent('promotions');
  const [editing, setEditing] = useState<Doc | null>(null);
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [confirm, setConfirm] = useState<string | null>(null);
  const list = [...(items ?? [])].sort((a, b) => (a.placement === b.placement ? a.order - b.order : a.placement === 'banner' ? -1 : 1));

  async function remove(id: string) {
    try { await api(`/api/content/promotions/${id}`, { method: 'DELETE' }); setMsg({ error: '', success: 'Deleted.' }); reload(); }
    catch (e) { setMsg({ error: (e as Error).message, success: '' }); }
  }

  return (
    <section className={`${panel} p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-brand-plum">What’s New — offers banner & video panel</h2>
        <button type="button" className="btn btn-primary !py-2 text-sm" onClick={() => setEditing({ ...blankPromo })}>+ New promotion</button>
      </div>
      <div className="mt-3"><FormMessage error={msg.error} success={msg.success} /></div>
      {editing && <PromoForm promo={editing} onDone={(ok) => { setEditing(null); if (ok) { setMsg({ error: '', success: ok }); reload(); } }} />}
      <ul className="mt-4 space-y-2">
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
            {p.image ? <img src={asset(p.image.src)} alt="" className="h-14 w-14 rounded bg-white object-contain" /> : <span className="flex h-14 w-14 items-center justify-center rounded bg-cream text-xs text-muted">{p.placement === 'video' ? 'Video' : '—'}</span>}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.title} {p.hidden && <span className="text-xs text-brand-magenta">(hidden)</span>}</p>
              <p className="text-xs text-muted">{p.placement === 'video' ? 'Video panel' : 'Offers banner'} · order {p.order}{p.startDate ? ` · from ${p.startDate}` : ''}{p.endDate ? ` · until ${p.endDate}` : ''}</p>
            </div>
            <button type="button" className={smallBtn} onClick={() => setEditing({ ...blankPromo, ...p })}>Edit</button>
            {confirm === p.id
              ? <><button type="button" className="rounded bg-brand-magenta px-2.5 py-1 text-sm font-semibold text-white" onClick={() => { setConfirm(null); remove(p.id); }}>Confirm</button><button type="button" className="text-sm" onClick={() => setConfirm(null)}>Cancel</button></>
              : <button type="button" className={`${smallBtn} text-brand-magenta`} onClick={() => setConfirm(p.id)}>Delete</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PromoForm({ promo, onDone }: { promo: Doc; onDone: (ok?: string) => void }) {
  const [p, setP] = useState<Doc>(promo);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const isNew = !promo.id;
  const id = isNew ? slugify(p.title) : p.id;
  const set = (k: string, v: unknown) => setP({ ...p, [k]: v });

  async function upload(file?: File) {
    if (!file) return;
    if (!id) { setError('Enter the headline first.'); return; }
    setBusy('Uploading…');
    try { const { src } = await api<{ src: string }>('/api/uploads', { body: { folder: 'promotions', slug: id, dataUrl: await resizeToWebp(file, 1600) } }); set('image', { src, alt: p.title }); }
    catch (e) { setError((e as Error).message); }
    setBusy('');
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try { await api(`/api/content/promotions/${id}`, { method: 'PUT', body: { ...p, id } }); onDone(isNew ? 'Promotion added.' : 'Promotion saved.'); }
    catch (err) { setError((err as Error).message); }
  }

  return (
    <form onSubmit={save} className="mt-4 space-y-3 rounded-xl border border-brand-gold bg-cream p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Headline" required value={p.title} onChange={(e) => set('title', e.target.value)} />
        <label className="block text-sm"><span className="mb-1 block font-semibold">Where to show</span>
          <select value={p.placement} onChange={(e) => set('placement', e.target.value)} className={inputClass}>
            <option value="banner">Rotating offers banner</option><option value="video">Video panel</option>
          </select>
        </label>
      </div>
      <Field label="Text" value={p.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button text" value={p.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Shop now" />
        <Field label="Button link" value={p.ctaHref} onChange={(e) => set('ctaHref', e.target.value)} placeholder="/shop/bangles/" />
      </div>
      {p.placement === 'video' && <Field label="Video link" value={p.video} onChange={(e) => set('video', e.target.value)} placeholder="Instagram reel or YouTube link" />}
      <div className="flex flex-wrap items-center gap-3">
        {p.image && <img src={asset(p.image.src)} alt="" className="h-16 w-16 rounded bg-white object-contain" />}
        <label className="btn btn-outline cursor-pointer !py-2 text-sm">
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />{p.image ? 'Replace image' : 'Upload image'}
        </label>
        {busy && <span className="text-sm text-muted">{busy}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Show from" type="date" value={p.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} />
        <Field label="Show until" type="date" value={p.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)} />
        <Field label="Order" type="number" value={p.order} onChange={(e) => set('order', Number(e.target.value))} />
      </div>
      <Toggle label="Hide" checked={!!p.hidden} onChange={(v) => set('hidden', v)} />
      <FormMessage error={error} />
      <div className="flex gap-2"><button type="submit" className="btn btn-primary">Save</button><button type="button" className="btn btn-outline" onClick={() => onDone()}>Cancel</button></div>
    </form>
  );
}
