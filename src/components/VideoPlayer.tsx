'use client';

import { useState } from 'react';
import { parseVideo } from '@/domain/promotions';
import { asset } from '@/lib/paths';

// Tap-to-play video (Instagram reel, YouTube or uploaded file). Nothing loads until the visitor taps.
export function VideoPlayer({ url, title, poster }: { url?: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideo(url);
  if (!video) return null;
  const thumb = video.kind === 'youtube' ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : poster ? asset(poster) : undefined;
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-brand-gold bg-cream sm:aspect-video">
      {playing && video.kind === 'youtube' && <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}
      {playing && video.kind === 'instagram' && <iframe className="absolute inset-0 h-full w-full" src={video.embedUrl} title={title} allowFullScreen />}
      {playing && video.kind === 'file' && <video className="absolute inset-0 h-full w-full object-contain" src={asset(video.src)} controls autoPlay playsInline />}
      {!playing && (
        <>
          {thumb && <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-contain p-4 opacity-80" />}
          <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}
            className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-violet/90 text-white shadow-xl ring-2 ring-brand-gold-light transition hover:scale-105">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <span className="eyebrow absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-[0.6rem] text-brand-plum">Watch video</span>
        </>
      )}
    </div>
  );
}
