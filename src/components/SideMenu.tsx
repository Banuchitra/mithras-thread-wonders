'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CollectionNode } from '@/domain/catalog';
import { Monogram } from './Monogram';

// ☰ button on the left of the header (all screen sizes) opening a slide-in panel from the left with every
// collection and category — grows automatically as the owner adds categories.
export function SideMenu({ tree, brandName }: { tree: CollectionNode[]; brandName: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const link = 'block rounded-lg px-3 py-2 hover:bg-cream';
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-plum transition hover:bg-cream">
        <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {/* Portal: the header's backdrop blur would otherwise trap this fixed panel inside the header. */}
      {mounted && createPortal(<div className={`fixed inset-0 z-50 transition ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-brand-plum/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
        <nav aria-label="Shop menu"
          className={`absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="heritage flex items-center gap-3 px-5 py-4">
            <Monogram variant="light" size={44} />
            <p className="flex-1 font-heading text-xl font-semibold text-white">{brandName}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="carousel-arrow">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <Link href="/" className={`${link} font-semibold`}>Home</Link>
            <Link href="/shop/" className={`${link} font-semibold`}>All designs</Link>
            <p className="eyebrow mt-4 px-3 text-[0.65rem] text-brand-gold-text">Shop by collection</p>
            <ul className="mt-1">
              {tree.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setExpanded((e) => (e === c.id ? null : c.id))} aria-expanded={expanded === c.id}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-heading text-lg font-semibold text-brand-plum hover:bg-cream">
                    {c.name}<span aria-hidden="true" className={`text-brand-gold-text transition ${expanded === c.id ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {expanded === c.id && (
                    <ul className="mb-2 ml-4 border-l border-brand-gold pl-3">
                      <li><Link href={`/shop/${c.id}/`} className={`${link} text-sm font-semibold text-brand-violet`}>All {c.name}</Link></li>
                      {c.categories.map((cat) => (
                        <li key={cat.id}><Link href={`/shop/${c.id}/${cat.id}/`} className={`${link} text-sm`}>{cat.name}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-line pt-3">
              <Link href="/wholesale/" className={link}>Wholesale &amp; custom orders</Link>
              <Link href="/about/" className={link}>About us</Link>
              <Link href="/account/" className={link}>My account</Link>
            </div>
          </div>
        </nav>
      </div>, document.body)}
    </>
  );
}
