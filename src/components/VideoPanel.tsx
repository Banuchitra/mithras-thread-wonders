'use client';

import Link from 'next/link';
import { useState } from 'react';
import { activePromotions, parseVideo, todayIso, type Promotion } from '@/domain/promotions';
import { asset } from '@/lib/paths';

// Promo video panel. Videos load only when tapped (fast page, no third-party trackers until then).
// With no video set yet it shows the promotion image and a link (e.g. to Instagram).
export function VideoPanel({ promotions }: { promotions: Promotion[] }) {
  const promo = activePromotions(promotions, todayIso(), 'video')[0];
  const [playing, setPlaying] = useState(false);
  if (!promo) return null;
  const video = parseVideo(promo.video);
  const poster = video?.kind === 'youtube' ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : promo.image ? asset(promo.image.src) : undefined;

  return (
    <section aria-label="Video" className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-gold bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-heading text-xl font-semibold text-brand-plum">{promo.title}</h2>
        <span className="eyebrow text-[0.62rem] text-brand-gold-text">{video ? 'Video' : 'Latest'}</span>
      </div>
      <div className="relative flex-1 bg-cream" style={{ minHeight: '16rem' }}>
        {playing && video?.kind === 'youtube' && (
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={promo.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        )}
        {playing && video?.kind === 'instagram' && (
          <iframe className="absolute inset-0 h-full w-full" src={video.embedUrl} title={promo.title} allowFullScreen />
        )}
        {playing && video?.kind === 'file' && (
          <video className="absolute inset-0 h-full w-full object-contain" src={asset(video.src)} controls autoPlay playsInline />
        )}
        {!playing && (
          <>
            {poster && (promo.productSlug && !video ? (
              <Link href={`/products/${promo.productSlug}/`} className="group absolute inset-0 block" aria-label={`Shop: ${promo.image?.alt ?? promo.title}`}>
                <img src={poster} alt={promo.image?.alt ?? ''} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
                <span className="eyebrow absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 text-[0.62rem] text-brand-plum shadow">Tap to shop</span>
              </Link>
            ) : <img src={poster} alt={promo.image?.alt ?? ''} className="absolute inset-0 h-full w-full object-contain p-3" />)}
            {video && (
              <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${promo.title}`}
                className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-violet/90 text-white shadow-xl ring-2 ring-brand-gold-light transition hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </button>
            )}
          </>
        )}
      </div>
      {(promo.subtitle || promo.ctaHref || promo.productSlug) && (
        <div className="space-y-3 px-4 py-4 text-sm">
          {promo.subtitle && <p className="text-muted">{promo.subtitle}</p>}
          {promo.productSlug && (
            <Link href={`/products/${promo.productSlug}/`} className="btn btn-primary w-full">Shop this design</Link>
          )}
          {promo.ctaHref && promo.ctaLabel && (
            <a href={promo.ctaHref} target={/^https?:/.test(promo.ctaHref) ? '_blank' : undefined} rel="noopener"
              className="btn mt-1 w-full text-white shadow-md"
              style={{ backgroundImage: /instagram\.com/.test(promo.ctaHref) ? 'linear-gradient(45deg,#F58529,#DD2A7B 45%,#8134AF 75%,#515BD4)' : undefined, backgroundColor: '#6A2C91' }}>
              {/instagram\.com/.test(promo.ctaHref) && (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="fill-current" />
                </svg>
              )}
              {promo.ctaLabel}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
