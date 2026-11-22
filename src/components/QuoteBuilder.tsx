'use client';

import { useEffect, useState } from 'react';
import { whatsappUrl } from '@/domain/channels';
import { formatQuoteMessage, type QuoteLine } from '@/domain/quote';

const emptyLine = (): QuoteLine => ({ item: '', quantity: 12, notes: '' });

export function QuoteBuilder({ whatsapp, categories }: { whatsapp: string; categories: string[] }) {
  const [lines, setLines] = useState<QuoteLine[]>([emptyLine()]);
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  // "Request a quote" on a product page links here with ?sku=…
  useEffect(() => {
    const sku = new URLSearchParams(window.location.search).get('sku');
    if (sku) setLines([{ item: 'Custom version of this design', quantity: 12, notes: '', likeSku: sku }]);
  }, []);

  const update = (i: number, patch: Partial<QuoteLine>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  function send(e: React.FormEvent) {
    e.preventDefault();
    try {
      const message = formatQuoteMessage({ name, business, country }, lines);
      setError('');
      window.open(whatsappUrl(whatsapp, message), '_blank', 'noopener');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const input = 'w-full rounded-lg border border-line bg-white px-3 py-2 focus:border-brand-violet';

  return (
    <form onSubmit={send} className="space-y-6 rounded-lg border border-brand-gold bg-white p-5 shadow-sm sm:p-6">
      <fieldset className="space-y-4">
        <legend className="font-heading text-2xl font-semibold text-brand-plum">What would you like?</legend>
        <datalist id="quote-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        {lines.map((line, i) => (
          <div key={i} className="grid gap-3 rounded-lg bg-cream p-3 sm:grid-cols-[2fr_1fr_3fr_auto] sm:items-end">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Item {i + 1}{line.likeSku ? ` (like ${line.likeSku})` : ''}</span>
              <input className={input} list="quote-categories" value={line.item} required
                placeholder="e.g. Silk thread bangles" onChange={(e) => update(i, { item: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Quantity</span>
              <input className={input} type="number" min={1} value={line.quantity} required
                onChange={(e) => update(i, { quantity: Number(e.target.value) })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Colours, sizes, design notes</span>
              <input className={input} value={line.notes} placeholder="e.g. Size 2.6, 12 pairs, your choice"
                onChange={(e) => update(i, { notes: e.target.value })} />
            </label>
            <button type="button" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} disabled={lines.length === 1}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-magenta disabled:opacity-40" aria-label={`Remove item ${i + 1}`}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, emptyLine()])}
          className="btn btn-outline !py-2 text-sm">
          + Add another item
        </button>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="mb-2 font-heading text-2xl font-semibold text-brand-plum">About you</legend>
        <label className="text-sm"><span className="mb-1 block font-medium">Your name</span>
          <input className={input} value={name} required onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Business (optional)</span>
          <input className={input} value={business} onChange={(e) => setBusiness(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-medium">Country</span>
          <input className={input} value={country} required onChange={(e) => setCountry(e.target.value)} /></label>
      </fieldset>

      {error && <p role="alert" className="text-sm font-medium text-brand-magenta">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary">
          Send request on WhatsApp
        </button>
        <p className="text-sm text-muted">Opens WhatsApp with your list ready to send. Nothing is stored on this site.</p>
      </div>
    </form>
  );
}
