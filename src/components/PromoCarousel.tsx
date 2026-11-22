'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { activePromotions, todayIso, type Promotion } from '@/domain/promotions';
import { asset } from '@/lib/paths';
import { Monogram } from './Monogram';

export interface BrandSlide { tagline: string; logo: string }

// Rotating offers banner. The first slide is always the brand; owner promotions follow (expired ones hide
// themselves in the visitor's browser too, so an offer disappears on its end date even without a rebuild).
export function PromoCarousel({ promotions, brand }: { promotions: Promotion[]; brand: BrandSlide }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayIso()), []);
  const slides = useMemo(
    () => (today ? activePromotions(promotions, today, 'banner') : promotions.filter((p) => p.placement === 'banner' && !p.hidden)),
    [promotions, today],
  );
  const count = slides.length + 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || count < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);
  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);

  const go = (i: number) => setIndex((i + count) % count);

  return (
    <section aria-roledescription="carousel" aria-label="What's new"
      className="heritage relative h-full min-h-[26rem] overflow-hidden rounded-2xl ring-1 ring-brand-gold/40 sm:min-h-[28rem]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        <Slide active={index === 0} eyebrow="Handmade in India" title={'Handcrafted jewellery,\nwoven with tradition'}
          text="Chains, bangles, kundan accessories and flower clips — handmade for weddings, festivals and every day."
          cta={{ label: 'Explore the collection', href: '/shop/' }}
          secondary={{ label: 'Wholesale & custom', href: '/wholesale/' }}
          art={<div className="mx-auto w-48 rounded-full p-1.5 ring-1 ring-brand-gold-light sm:w-60 lg:w-64">
            <img src={asset(brand.logo)} alt="" className="rounded-full shadow-2xl" /></div>} />
        {slides.map((p, i) => (
          <Slide key={p.id} active={index === i + 1} eyebrow="What's new" title={p.title} text={p.subtitle}
            cta={p.ctaLabel && p.ctaHref ? { label: p.ctaLabel, href: p.ctaHref } : undefined}
            art={p.image ? (
              <div className="mx-auto aspect-[4/3] w-full max-w-sm rounded-xl bg-white p-3 ring-1 ring-brand-gold-light">
                <img src={asset(p.image.src)} alt={p.image.alt} className="h-full w-full object-contain" />
              </div>
            ) : <Monogram variant="light" size={140} />} />
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="carousel-arrow">‹</button>
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" onClick={() => go(i)} aria-label={`Slide ${i + 1} of ${count}`} aria-current={i === index}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-brand-gold-light' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
          ))}
          <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="carousel-arrow">›</button>
        </div>
      )}
    </section>
  );
}

function Slide({ active, eyebrow, title, text, cta, secondary, art }: {
  active: boolean; eyebrow: string; title: string; text?: string;
  cta?: { label: string; href: string }; secondary?: { label: string; href: string }; art: React.ReactNode;
}) {
  const external = (href: string) => /^https?:/.test(href);
  const btn = (c: { label: string; href: string }, cls: string) =>
    external(c.href)
      ? <a href={c.href} target="_blank" rel="noopener" className={cls} tabIndex={active ? 0 : -1}>{c.label}</a>
      : <Link href={c.href} className={cls} tabIndex={active ? 0 : -1}>{c.label}</Link>;
  return (
    <div className="grid w-full shrink-0 items-center gap-6 px-6 pb-14 pt-10 text-center sm:px-10 md:grid-cols-[1.25fr_1fr] md:text-left lg:px-14"
      aria-hidden={!active} role="group" aria-roledescription="slide">
      <div>
        <p className="eyebrow text-brand-gold-light">{eyebrow}</p>
        <h2 className="mt-3 whitespace-pre-line text-3xl font-semibold leading-tight text-white sm:text-4xl 2xl:text-5xl">{title}</h2>
        {text && <p className="mx-auto mt-4 max-w-md text-[#F3E3C3] md:mx-0">{text}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
          {cta && btn(cta, 'btn btn-gold')}
          {secondary && btn(secondary, 'btn btn-ghost-light')}
        </div>
      </div>
      <div className="hidden sm:block">{art}</div>
    </div>
  );
}
