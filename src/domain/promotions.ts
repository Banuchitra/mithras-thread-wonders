// "What's New" promotions: offer banners and promo videos the owner manages. Pure TypeScript.
import type { ProductImage } from './types';

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: ProductImage;
  /** YouTube / Instagram link or an uploaded video file path. */
  video?: string;
  placement: 'banner' | 'video';
  /** Inclusive ISO dates (YYYY-MM-DD). Missing = no limit. */
  startDate?: string;
  endDate?: string;
  order: number;
  hidden?: boolean;
}

export function activePromotions(list: Promotion[], today: string, placement?: Promotion['placement']): Promotion[] {
  return list
    .filter((p) => !p.hidden)
    .filter((p) => !placement || p.placement === placement)
    .filter((p) => (!p.startDate || p.startDate <= today) && (!p.endDate || p.endDate >= today))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export type VideoSource =
  | { kind: 'youtube'; id: string }
  | { kind: 'instagram'; embedUrl: string }
  | { kind: 'file'; src: string };

export function parseVideo(url: string | undefined): VideoSource | null {
  const u = (url ?? '').trim();
  if (!u) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { kind: 'youtube', id: yt[1] };
  const ig = u.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) return { kind: 'instagram', embedUrl: `https://www.instagram.com/${ig[1]}/${ig[2]}/embed` };
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(u)) return { kind: 'file', src: u };
  return null;
}

export const todayIso = (d = new Date()) => d.toISOString().slice(0, 10);
