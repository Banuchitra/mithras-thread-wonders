'use client';

import { useEffect, useState } from 'react';
import { whatsappUrl } from '@/domain/channels';
import { formatQuoteMessage, type QuoteLine } from '@/domain/quote';
import { api } from '@/lib/api';
import { resizeToWebp } from '@/lib/image';

const emptyLine = (): QuoteLine => ({ item: '', quantity: 12, notes: '' });
const MAX_PHOTOS = 5;

// Custom-order / wholesale request: items, reference photos and reel links. Saved to the shop (photos kept
// private for the owner), with an optional WhatsApp copy. Falls back to WhatsApp only if the server is down.
export function QuoteBuilder({ whatsapp, categories }: { whatsapp: string; categories: string[] }) {
  const [lines, setLines] = useState<QuoteLine[]>([emptyLine()]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [business, setBusiness] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [links, setLinks] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [trap, setTrap] = useState(''); // hidden field: only bots fill it
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [sent, setSent] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const sku = new URLSearchParams(window.location.search).get('sku');
    if (sku) setLines([{ item: 'Custom version of this design', quantity: 12, notes: '', likeSku: sku }]);
  }, []);

  const update = (i: number, patch: Partial<QuoteLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const linkList = () => links.split(/\s+/).map((l) => l.trim()).filter(Boolean);
  const filled = lines.filter((l) => l.item.trim() && l.quantity > 0);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { setError(`You can attach up to ${MAX_PHOTOS} photos.`); return; }
    setBusy('Preparing photos…'); setError('');
    try {
      const resized = await Promise.all(Array.from(files).slice(0, room).map((f) => resizeToWebp(f, 1400, 0.8)));
      setPhotos((p) => [...p, ...resized]);
    } catch { setError('One of those files is not a photo we can read.'); }
    setBusy('');
  }

  const whatsappMessage = (ref?: string) => {
    const text = filled.length
      ? formatQuoteMessage({ name, business, country }, filled)
      : `Hi! Custom order request from ${name}${country ? ` (${country})` : ''}.`;
    const extra = [message && `\n${message}`, linkList().length ? `\nReferences:\n${linkList().join('\n')}` : '', photos.length ? `\n(${photos.length} photo${photos.length > 1 ? 's' : ''} attached on the website)` : '', ref ? `\nReference: ${ref}` : ''].filter(Boolean).join('');
    return text + extra;
  };

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setBusy('Sending your request…');
    try {
      const r = await api<{ id: string }>('/api/inquiries', {
        body: { name, contact, country, business, message, items: filled.map((l) => ({ ...l, likeSku: l.likeSku ?? '' })), links: linkList(), photos, website: trap },
      });
      setSent(r);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.startsWith('Can’t reach')) {
        setError('We couldn’t save your request online right now — please send it on WhatsApp instead (you can attach your photos there).');
      } else setError(msg);
    }
    setBusy('');
  }

  const input = 'w-full rounded-lg border border-line bg-white px-3 py-2 focus:border-brand-violet';

  if (sent) {
    return (
      <div className="space-y-4 rounded-2xl border border-brand-gold bg-white p-6 text-center shadow-sm">
        <h2 className="text-3xl font-semibold text-brand-plum">Request sent — thank you!</h2>
        <p className="text-muted">Your reference number is <strong className="text-brand-violet">{sent.id}</strong>. Mithra will reply on {contact} with photos, pricing and delivery time.</p>
        <a className="btn btn-primary" target="_blank" rel="noopener" href={whatsappUrl(whatsapp, whatsappMessage(sent.id))}>Also send on WhatsApp</a>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-6 rounded-lg border border-brand-gold bg-white p-5 shadow-sm sm:p-6">
      <fieldset className="space-y-4">
        <legend className="font-heading text-2xl font-semibold text-brand-plum">What would you like?</legend>
        <datalist id="quote-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        {lines.map((line, i) => (
          <div key={i} className="grid gap-3 rounded-lg bg-cream p-3 sm:grid-cols-[2fr_1fr_3fr_auto] sm:items-end">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Item {i + 1}{line.likeSku ? ` (like ${line.likeSku})` : ''}</span>
              <input className={input} list="quote-categories" value={line.item} placeholder="e.g. Silk thread bangles" onChange={(e) => update(i, { item: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Quantity</span>
              <input className={input} type="number" min={1} value={line.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Colours, sizes, design notes</span>
              <input className={input} value={line.notes} placeholder="e.g. Size 2.6, 12 pairs, your choice" onChange={(e) => update(i, { notes: e.target.value })} />
            </label>
            <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} disabled={lines.length === 1}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-magenta disabled:opacity-40" aria-label={`Remove item ${i + 1}`}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, emptyLine()])} className="btn btn-outline !py-2 text-sm">+ Add another item</button>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-heading text-2xl font-semibold text-brand-plum">Reference photos &amp; reels</legend>
        <p className="text-sm text-muted">Have a picture of what you’d like? Attach up to {MAX_PHOTOS} photos or screenshots, or paste Instagram / Pinterest / YouTube links.</p>
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-brand-gold bg-cream p-5 text-center text-sm hover:bg-white">
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
          <span className="font-semibold text-brand-violet">Attach photos</span> <span className="text-muted">({photos.length}/{MAX_PHOTOS})</span>
        </label>
        {photos.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {photos.map((src, i) => (
              <li key={i} className="relative">
                <img src={src} alt={`Reference photo ${i + 1}`} className="h-20 w-20 rounded-lg border border-line bg-white object-cover" />
                <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-brand-magenta text-sm font-bold text-white">×</button>
              </li>
            ))}
          </ul>
        )}
        <label className="block text-sm"><span className="mb-1 block font-medium">Links to reels or pictures (one per line)</span>
          <textarea className={input} rows={2} value={links} onChange={(e) => setLinks(e.target.value)} placeholder="https://www.instagram.com/reel/…" />
        </label>
        <label className="block text-sm"><span className="mb-1 block font-medium">Anything else? (optional)</span>
          <textarea className={input} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Occasion, date needed, budget…" />
        </label>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-heading text-2xl font-semibold text-brand-plum">About you</legend>
        <label className="text-sm"><span className="mb-1 block font-medium">Your name</span>
          <input className={input} value={name} required autoComplete="name" onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium">WhatsApp number or email</span>
          <input className={input} value={contact} required onChange={(e) => setContact(e.target.value)} placeholder="So Mithra can reply" /></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Business (optional)</span>
          <input className={input} value={business} onChange={(e) => setBusiness(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Country</span>
          <input className={input} value={country} required autoComplete="country-name" onChange={(e) => setCountry(e.target.value)} /></label>
        <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
      </fieldset>

      {error && <p role="alert" className="rounded-lg bg-[#FCE8F1] px-3 py-2 text-sm text-[#9C1458]">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!!busy} className="btn btn-primary disabled:opacity-60">{busy || 'Send request'}</button>
        <a className="btn btn-outline" target="_blank" rel="noopener" href={whatsappUrl(whatsapp, whatsappMessage())}>Send on WhatsApp instead</a>
      </div>
      <p className="text-xs text-muted">Your photos are only visible to the shop owner.</p>
    </form>
  );
}
