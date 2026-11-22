import { describe, expect, it } from 'vitest';
import { activePromotions, parseVideo } from '@/domain/promotions';
import type { Promotion } from '@/domain/promotions';

const promo = (over: Partial<Promotion> = {}): Promotion => ({
  id: 'p', title: 'Offer', placement: 'banner', order: 1, ...over,
});

describe('activePromotions', () => {
  it('keeps promotions whose dates include today, sorted by order', () => {
    const list = [
      promo({ id: 'b', order: 2 }),
      promo({ id: 'a', order: 1, startDate: '2026-11-01', endDate: '2026-11-30' }),
      promo({ id: 'future', startDate: '2026-12-01' }),
      promo({ id: 'expired', endDate: '2026-11-21' }),
      promo({ id: 'hidden', hidden: true }),
    ];
    expect(activePromotions(list, '2026-11-22').map((p) => p.id)).toEqual(['a', 'b']);
  });
  it('treats the end date as inclusive', () => {
    expect(activePromotions([promo({ endDate: '2026-11-22' })], '2026-11-22')).toHaveLength(1);
  });
  it('filters by placement', () => {
    const list = [promo({ id: 'v', placement: 'video' }), promo({ id: 'b' })];
    expect(activePromotions(list, '2026-11-22', 'video').map((p) => p.id)).toEqual(['v']);
  });
});

describe('parseVideo', () => {
  it('recognises YouTube links in every common form', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=abc',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    ]) expect(parseVideo(url)).toEqual({ kind: 'youtube', id: 'dQw4w9WgXcQ' });
  });
  it('turns Instagram reels and posts into embed URLs', () => {
    expect(parseVideo('https://www.instagram.com/reel/C9xYz12AbCd/?igsh=1')).toEqual({
      kind: 'instagram', embedUrl: 'https://www.instagram.com/reel/C9xYz12AbCd/embed',
    });
    expect(parseVideo('https://instagram.com/p/C9xYz12AbCd')?.kind).toBe('instagram');
  });
  it('accepts uploaded video files', () => {
    expect(parseVideo('/videos/new-bangles.mp4')).toEqual({ kind: 'file', src: '/videos/new-bangles.mp4' });
  });
  it('returns null for anything else', () => {
    expect(parseVideo('https://example.com/page')).toBeNull();
    expect(parseVideo('')).toBeNull();
  });
});
