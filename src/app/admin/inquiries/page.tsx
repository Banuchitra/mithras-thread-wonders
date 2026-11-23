'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminPage, panel, smallBtn } from '@/components/admin';
import { FormMessage, inputClass } from '@/components/forms';
import { whatsappUrl } from '@/domain/channels';
import { API_URL, api, getToken } from '@/lib/api';

type Inquiry = {
  id: string; createdAt: string; name: string; contact: string; country: string; business: string; message: string;
  items: { item: string; quantity: number; notes: string; likeSku: string }[]; links: string[]; photoCount: number;
  status: 'new' | 'replied' | 'closed'; notes: string;
};

export default function InquiriesAdmin() {
  return <AdminGuard><Inquiries /></AdminGuard>;
}

function Inquiries() {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setRows((await api<{ inquiries: Inquiry[] }>('/api/inquiries')).inquiries); } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const shown = (rows ?? []).filter((r) => filter === 'all' || r.status !== 'closed');
  const newCount = (rows ?? []).filter((r) => r.status === 'new').length;

  return (
    <AdminPage title="Custom-order requests" crumb="Requests"
      actions={<div className="flex gap-2">{(['open', 'all'] as const).map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={`chip text-sm ${filter === f ? '' : ''}`} aria-current={filter === f ? 'page' : undefined}>{f === 'open' ? `Open${newCount ? ` (${newCount} new)` : ''}` : 'All'}</button>)}</div>}>
      <FormMessage error={error} />
      {!rows ? <p className="text-muted">Loading…</p> : shown.length === 0 ? <p className={`${panel} p-6 text-muted`}>No requests yet. They appear here when customers use the Wholesale &amp; custom orders form.</p> : (
        <div className="space-y-5">{shown.map((r) => <Card key={r.id} r={r} onChange={load} />)}</div>
      )}
    </AdminPage>
  );
}

function Card({ r, onChange }: { r: Inquiry; onChange: () => void }) {
  const [notes, setNotes] = useState(r.notes);
  const [msg, setMsg] = useState('');
  const phone = r.contact.replace(/[^\d+]/g, '');
  const isPhone = phone.replace(/\D/g, '').length >= 8 && !r.contact.includes('@');
  const save = async (patch: Partial<Inquiry>) => {
    try { await api(`/api/inquiries/${r.id}`, { method: 'PATCH', body: patch }); setMsg('Saved.'); onChange(); } catch (e) { setMsg((e as Error).message); }
  };
  return (
    <article className={`${panel} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-[0.62rem] text-brand-gold-text">#{r.id} · {new Date(r.createdAt).toLocaleString()}</p>
          <h2 className="text-2xl font-semibold text-brand-plum">{r.name}{r.business ? ` — ${r.business}` : ''}</h2>
          <p className="text-sm text-muted">{r.contact}{r.country ? ` · ${r.country}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Status" value={r.status} onChange={(e) => save({ status: e.target.value as Inquiry['status'] })} className="rounded border border-line bg-white px-2 py-1 text-sm">
            <option value="new">New</option><option value="replied">Replied</option><option value="closed">Closed</option>
          </select>
          {isPhone
            ? <a className="btn btn-primary !py-2 text-sm" target="_blank" rel="noopener" href={whatsappUrl(phone, `Hi ${r.name}! Thank you for your request #${r.id} to Mithra's Thread Wonders.`)}>Reply on WhatsApp</a>
            : <a className="btn btn-primary !py-2 text-sm" href={`mailto:${r.contact}?subject=Your request %23${r.id}`}>Reply by email</a>}
        </div>
      </div>
      {r.items.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {r.items.map((it, i) => <li key={i}>• <strong>{it.item}</strong> × {it.quantity}{it.notes ? ` — ${it.notes}` : ''}{it.likeSku ? ` (like ${it.likeSku})` : ''}</li>)}
        </ul>
      )}
      {r.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-cream p-3 text-sm">{r.message}</p>}
      {r.photoCount > 0 && <Photos id={r.id} count={r.photoCount} />}
      {r.links.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">{r.links.map((l) => <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" className="break-all text-brand-blue underline">{l}</a></li>)}</ul>
      )}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-sm"><span className="mb-1 block font-semibold">Private notes</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} placeholder="e.g. Quoted CA$480, delivery 30 days" /></label>
        <button type="button" className={smallBtn} onClick={() => save({ notes })} disabled={notes === r.notes}>Save note</button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </article>
  );
}

// Photos are private: fetched with the admin's login and shown from memory (never public URLs).
function Photos({ id, count }: { id: string; count: number }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    let alive = true; const made: string[] = [];
    Promise.all(Array.from({ length: count }, (_, n) =>
      fetch(`${API_URL}/api/inquiries/${id}/photos/${n}/`, { headers: { authorization: `Bearer ${getToken()}` } })
        .then((res) => (res.ok ? res.blob() : null)).then((b) => (b ? URL.createObjectURL(b) : '')),
    )).then((list) => { made.push(...list); if (alive) setUrls(list); });
    return () => { alive = false; made.forEach((u) => u && URL.revokeObjectURL(u)); };
  }, [id, count]);
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {urls.map((u, i) => u && (
        <li key={i}><a href={u} target="_blank" rel="noopener"><img src={u} alt={`Reference photo ${i + 1}`} className="h-28 w-28 rounded-lg border border-line bg-white object-cover hover:border-brand-violet" /></a></li>
      ))}
    </ul>
  );
}
