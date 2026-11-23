'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { answer, type AssistantProduct } from '@/domain/assistant';
import { whatsappUrl } from '@/domain/channels';
import { asset } from '@/lib/paths';
import { Monogram } from './Monogram';
import { WithCanadaFlag } from './CanadaFlag';
import { AdminAssistant } from './AdminAssistant';
import { useAuth } from './AuthProvider';

type Msg = { from: 'bot' | 'you'; text: string; products?: AssistantProduct[]; whatsapp?: string; link?: { href: string; label: string } };

const price = (c?: number) => (c === undefined ? 'Price on request' : `CA$${(c / 100).toFixed(2)}`);
const SUGGESTIONS = ['Bridal bangles', 'Green bangles', 'Necklace with earrings', 'Under $30', 'Custom order'];

// Floating shopping assistant on every page. Matches questions to the catalogue in the browser; anything it
// can't answer goes to WhatsApp with the question pre-filled.
export function ChatWidget({ catalogue, whatsapp }: { catalogue: AssistantProduct[]; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: 'Hi! I can help you find designs. What are you looking for? Try a colour, an occasion or a price.' },
  ]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);
  const pathname = usePathname();
  const { user } = useAuth();
  // One assistant in one place (bottom-right): signed-in staff get the Admin Assistant on every page.
  if (user && !user.mustChangePassword && (user.role === 'admin' || user.role === 'editor')) return <AdminAssistant />;
  if (pathname?.startsWith('/admin')) return null;

  function ask(q: string) {
    const question = q.trim();
    if (!question) return;
    const r = answer(question, catalogue);
    const wa = whatsappUrl(whatsapp, `Hi! ${question}`);
    const reply: Msg =
      r.intent === 'products' ? { from: 'bot', text: `Here ${r.products.length === 1 ? 'is a design' : `are ${r.products.length} designs`} you might like:`, products: r.products, whatsapp: wa }
      : r.intent === 'custom' ? { from: 'bot', text: 'Yes — Mithra makes designs in any colour and size, and bulk orders too. Send your reference photos or reels with the quote form, or message her on WhatsApp.', link: { href: '/wholesale/', label: 'Open the custom / bulk quote form' }, whatsapp: wa }
      : r.intent === 'shipping' ? { from: 'bot', text: 'Pieces marked “Ships within Canada” are in stock in Canada. Custom and wholesale orders are handmade in India and shipped worldwide — ask for delivery times.', whatsapp: wa }
      : r.intent === 'contact' ? { from: 'bot', text: `You can reach Mithra on WhatsApp (${whatsapp}) or Instagram.`, whatsapp: wa }
      : r.intent === 'greeting' ? { from: 'bot', text: 'Hello! Tell me what you’re looking for — for example “pink bangles” or “bridal set”.' }
      : { from: 'bot', text: 'I couldn’t find that in the catalogue. Mithra can tell you what’s available or make it for you:', whatsapp: wa, link: { href: '/shop/', label: 'Browse all designs' } };
    setMsgs((m) => [...m, { from: 'you', text: question }, reply]);
    setInput('');
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label="Shopping Assistant" className="flex h-[min(34rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-brand-gold bg-white shadow-2xl">
          <header className="heritage flex items-center gap-3 px-4 py-3">
            <Monogram variant="light" size={34} />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg font-semibold leading-tight text-white">Shopping Assistant</p>
              <p className="text-xs text-[#F3E3C3]">Find designs · custom orders</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="carousel-arrow">×</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-cream px-3 py-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'you' ? 'flex justify-end' : ''}>
                <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${m.from === 'you' ? 'bg-brand-violet text-white' : 'bg-white text-ink shadow-sm'}`}>
                  <p><WithCanadaFlag text={m.text} /></p>
                  {m.products && (
                    <ul className="mt-2 space-y-2">
                      {m.products.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/products/${p.slug}/`} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg border border-line p-1.5 hover:border-brand-violet">
                            {p.image && <img src={asset(p.image)} alt="" className="h-12 w-12 shrink-0 rounded bg-white object-contain" />}
                            <span className="min-w-0"><span className="line-clamp-2 font-semibold">{p.title}</span><span className="text-brand-violet">{price(p.price)}</span></span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.link && <Link href={m.link.href} onClick={() => setOpen(false)} className="mt-2 block font-semibold text-brand-blue underline">{m.link.label}</Link>}
                  {m.whatsapp && <a href={m.whatsapp} target="_blank" rel="noopener" className="mt-2 block font-semibold text-brand-teal-text underline">Ask Mithra on WhatsApp</a>}
                </div>
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="chip text-xs">{s}</button>)}
              </div>
            )}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-line p-2">
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <input id="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. green bangles under $30"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-violet" autoComplete="off" />
            <button type="submit" className="btn btn-primary !px-4 !py-2 text-sm">Send</button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close shopping assistant' : 'Open shopping assistant'}
        className="heritage flex items-center gap-3 rounded-full p-1.5 text-white shadow-2xl ring-2 ring-brand-gold-light transition hover:-translate-y-0.5 sm:py-2 sm:pl-2 sm:pr-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-brand-gold-light">
          <Monogram variant="light" size={46} />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block font-heading text-xl font-semibold">{open ? 'Close' : 'Ask us'}</span>
          {!open && <span className="hidden text-xs text-[#F3E3C3] sm:block">Find designs · custom orders</span>}
        </span>
      </button>
    </div>
  );
}
