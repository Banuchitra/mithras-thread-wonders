'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProductImage } from '@/domain/types';
import { asset } from '@/lib/paths';
import { ArchImage } from './ArchImage';

// Product photos: swipe or use thumbnails (the page never jumps), tap a photo for a full-screen viewer
// where the whole piece fits the screen.
export function Gallery({ images }: { images: ProductImage[] }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);

  const goTo = useCallback((i: number) => {
    const el = strip.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, []);
  const onScroll = () => {
    const el = strip.current;
    if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };

  return (
    <div>
      <div ref={strip} onScroll={onScroll} className="gallery arch bg-white" aria-label="Product photos — swipe, or tap to enlarge">
        {images.map((img, i) => (
          <button key={img.src} type="button" onClick={() => setViewer(i)} className="block aspect-[4/5] w-full cursor-zoom-in" aria-label={`Enlarge photo ${i + 1}`}>
            <ArchImage src={img.src} alt={img.alt} eager={i === 0} />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <div className="mt-2 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((img, i) => <span key={img.src} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-brand-violet' : 'w-1.5 bg-line'}`} />)}
          </div>
          <ul className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <li key={img.src} className="shrink-0">
                <button type="button" onClick={() => goTo(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index}
                  className={`block overflow-hidden rounded-md border-2 ${i === index ? 'border-brand-violet' : 'border-brand-gold/50 hover:border-brand-violet'}`}>
                  <img src={asset(img.src)} alt="" loading="lazy" className="h-14 w-14 bg-white object-contain sm:h-16 sm:w-16" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {viewer !== null && <Viewer images={images} start={viewer} onClose={(i) => { setViewer(null); goTo(i); }} />}
    </div>
  );
}

function Viewer({ images, start, onClose }: { images: ProductImage[]; start: number; onClose: (i: number) => void }) {
  const [i, setI] = useState(start);
  const touchX = useRef<number | null>(null);
  const prev = useCallback(() => setI((x) => (x - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setI((x) => (x + 1) % images.length), [images.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(i);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [i, onClose, prev, next]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[60] flex flex-col bg-brand-plum"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}>
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm">{i + 1} / {images.length}</span>
        <button type="button" onClick={() => onClose(i)} aria-label="Close photo viewer" className="carousel-arrow !h-11 !w-11 !text-2xl">×</button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6">
        <img src={asset(images[i].src)} alt={images[i].alt} className="max-h-full max-w-full rounded-lg bg-white object-contain p-2" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className="carousel-arrow absolute left-3 top-1/2 !h-11 !w-11 -translate-y-1/2 !text-2xl">‹</button>
            <button type="button" onClick={next} aria-label="Next photo" className="carousel-arrow absolute right-3 top-1/2 !h-11 !w-11 -translate-y-1/2 !text-2xl">›</button>
          </>
        )}
      </div>
    </div>
  );
}
