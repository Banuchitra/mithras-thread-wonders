'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { parseCommand, type Command, type NamedProduct } from '@/domain/admin-commands';
import { content } from '@/lib/content-client';
import { slugify } from '@/lib/image';
import { Monogram } from './Monogram';

type Doc = Record<string, any>;
type Msg = { from: 'bot' | 'you'; text: string; confirm?: Command; options?: NamedProduct[]; then?: Extract<Command, { kind: 'choose' }>['then']; done?: boolean };

const HELP = [
  'hide peacock necklace · show rabbit · delete leaf set',
  'price of lakshmi necklace to 31.99',
  'feature emerald bangles · unfeature emerald bangles',
  'announcement: Diwali sale — 10% off this week',
  'add category Anklets to Chains & Necklaces',
  'add a product · open categories · open website',
];

// Admin helper (bottom-left, so it never covers Save bars). Understands simple instructions, shows the change,
// and only runs it after "Yes, do it". Rule-based — no AI service.
export function AdminAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<Doc[]>([]);
  const [collections, setCollections] = useState<Doc[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: 'Hi! Tell me what to change — for example “hide peacock necklace” or “price of lakshmi necklace to 31.99”. Type “help” for more.' }]);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);
  const load = async () => { const [p, c] = await Promise.all([content.list('products'), content.list('collections')]); setProducts(p); setCollections(c); return { p, c }; };
  useEffect(() => { if (open && products.length === 0) load().catch(() => {}); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = (slug: string) => products.find((p) => p.slug === slug)?.title ?? slug;
  const say = (m: Msg) => setMsgs((x) => [...x, m]);

  function describe(c: Command): string {
    switch (c.kind) {
      case 'product': return `${c.action === 'feature' ? 'Feature on the home page' : c.action === 'unfeature' ? 'Remove from featured' : c.action[0].toUpperCase() + c.action.slice(1)}: “${title(c.slug)}”?`;
      case 'price': return `Change the price of “${title(c.slug)}” to CA$${c.price}?`;
      case 'announcement': return `Set the announcement bar to: “${c.text}”?`;
      case 'category': return `Add the category “${c.name}” under ${collections.find((x) => x.id === c.collectionId)?.name ?? c.collectionId}?`;
      default: return '';
    }
  }

  async function ask(q: string) {
    const text = q.trim();
    if (!text) return;
    setInput('');
    say({ from: 'you', text });
    let list = products, cols = collections;
    if (list.length === 0) { try { const r = await load(); list = r.p; cols = r.c; } catch (e) { say({ from: 'bot', text: (e as Error).message }); return; } }
    const cmd = parseCommand(text, list.map((p) => ({ slug: p.slug, title: p.title })), cols.map((c) => ({ id: c.id, name: c.name })));
    if (cmd.kind === 'help') say({ from: 'bot', text: `I can do things like:\n• ${HELP.join('\n• ')}` });
    else if (cmd.kind === 'unknown') say({ from: 'bot', text: 'Sorry, I didn’t understand. Try “help” to see what I can do.' });
    else if (cmd.kind === 'notfound') say({ from: 'bot', text: `I couldn’t find “${cmd.query}”. Try a word from the product or collection name.` });
    else if (cmd.kind === 'go') { say({ from: 'bot', text: `Opening ${cmd.label}…` }); router.push(cmd.href); }
    else if (cmd.kind === 'choose') say({ from: 'bot', text: 'Which one do you mean?', options: cmd.options, then: cmd.then });
    else say({ from: 'bot', text: describe(cmd), confirm: cmd });
  }

  function choose(p: NamedProduct, then: NonNullable<Msg['then']>) {
    const cmd: Command = then.kind === 'product' ? { kind: 'product', action: then.action, slug: p.slug } : { kind: 'price', slug: p.slug, price: then.price };
    say({ from: 'you', text: p.title });
    say({ from: 'bot', text: describe(cmd), confirm: cmd });
  }

  async function run(c: Command, index: number) {
    setBusy(true);
    setMsgs((x) => x.map((m, i) => (i === index ? { ...m, done: true } : m)));
    try {
      if (c.kind === 'product' || c.kind === 'price') {
        const p = products.find((x) => x.slug === c.slug);
        if (!p) throw new Error('That product no longer exists');
        if (c.kind === 'price') await content.put('products', p.slug, { ...p, price: c.price });
        else if (c.action === 'delete') await content.remove('products', p.slug);
        else await content.put('products', p.slug, { ...p, ...(c.action === 'hide' ? { status: 'hidden' } : c.action === 'show' ? { status: 'active' } : { featured: c.action === 'feature' }) });
      } else if (c.kind === 'announcement') {
        await content.putSettings({ ...(await content.getSettings()), announcement: c.text });
      } else if (c.kind === 'category') {
        await content.put('categories', slugify(c.name), { id: slugify(c.name), name: c.name, collectionId: c.collectionId, order: 99, hidden: false });
      }
      await load();
      say({ from: 'bot', text: 'Done ✓ — it will show on the website in about a minute.' });
    } catch (e) {
      say({ from: 'bot', text: `That didn’t work: ${(e as Error).message}` });
    }
    setBusy(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label="Admin Assistant" className="flex h-[min(32rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-brand-gold bg-white shadow-2xl">
          <header className="heritage flex items-center gap-3 px-4 py-3">
            <Monogram variant="light" size={34} />
            <div className="min-w-0 flex-1"><p className="font-heading text-lg font-semibold text-white">Admin Assistant</p><p className="text-xs text-[#F3E3C3]">Tell me what to change</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="carousel-arrow">×</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-cream px-3 py-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'you' ? 'flex justify-end' : ''}>
                <div className={`max-w-[92%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.from === 'you' ? 'bg-brand-violet text-white' : 'bg-white text-ink shadow-sm'}`}>
                  {m.text}
                  {m.options && m.then && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {m.options.map((o) => <button key={o.slug} type="button" onClick={() => choose(o, m.then!)} className="rounded-lg border border-line px-2 py-1.5 text-left text-xs hover:border-brand-violet">{o.title}</button>)}
                    </div>
                  )}
                  {m.confirm && !m.done && (
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={busy} onClick={() => run(m.confirm!, i)} className="btn btn-primary !px-3 !py-1.5 text-xs">Yes, do it</button>
                      <button type="button" onClick={() => setMsgs((x) => x.map((mm, j) => (j === i ? { ...mm, done: true } : mm)))} className="btn btn-outline !px-3 !py-1.5 text-xs">Cancel</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-muted">Saving…</p>}
            <div ref={end} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2 border-t border-line p-2">
            <label htmlFor="admin-assistant-input" className="sr-only">Instruction</label>
            <input id="admin-assistant-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. hide peacock necklace" autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-violet" />
            <button type="submit" className="btn btn-primary !px-4 !py-2 text-sm">Send</button>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close admin assistant' : 'Open admin assistant'}
        className="flex items-center gap-3 rounded-full bg-brand-gold-light p-1.5 text-brand-plum shadow-2xl ring-2 ring-brand-plum transition hover:-translate-y-0.5 sm:py-2 sm:pl-2 sm:pr-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-plum ring-1 ring-white"><Monogram variant="light" size={40} /></span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block font-heading text-lg font-semibold">{open ? 'Close' : 'Admin Assistant'}</span>
          {!open && <span className="text-xs text-brand-plum/80">Tell me what to change</span>}
        </span>
      </button>
    </div>
  );
}
