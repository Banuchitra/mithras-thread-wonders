// Validation for customers' custom-order / wholesale requests. Pure TypeScript.
import { AccessError } from './users';
import type { InquiryItem } from './ports';

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_B64 = 2_000_000; // ~1.5 MB after in-browser resizing
const bad = (m: string): never => { throw new AccessError(400, m); };
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export interface ValidInquiry {
  name: string; contact: string; country: string; business: string; message: string;
  items: InquiryItem[]; links: string[]; photos: { bytes: Uint8Array; contentType: string; ext: string }[];
}

export function validateInquiry(d: Record<string, unknown>): ValidInquiry {
  const name = str(d.name, 100) || bad('Please enter your name');
  const contact = str(d.contact, 120) || bad('Please add your WhatsApp number or email so we can reply');
  const items = (Array.isArray(d.items) ? d.items : [])
    .map((l) => ({ item: str((l as Record<string, unknown>).item, 120), quantity: Math.max(0, Math.min(100000, Math.round(Number((l as Record<string, unknown>).quantity) || 0))), notes: str((l as Record<string, unknown>).notes, 300), likeSku: str((l as Record<string, unknown>).likeSku, 60) }))
    .filter((l) => l.item)
    .slice(0, 30);
  const links = (Array.isArray(d.links) ? d.links : []).map((l) => str(l, 300)).filter(Boolean);
  if (links.length > 10) bad('Please share at most 10 links');
  for (const l of links) if (!/^https:\/\/[^\s]+$/.test(l)) bad('Links must start with https://');
  const raw = Array.isArray(d.photos) ? d.photos : [];
  if (raw.length > MAX_PHOTOS) bad(`Please attach at most ${MAX_PHOTOS} photos`);
  const photos = raw.map((p) => {
    const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(String(p));
    if (!m) bad('Photos must be images');
    if (m![2].length > MAX_PHOTO_B64) bad('One of the photos is too large');
    return { bytes: Uint8Array.from(atob(m![2]), (c) => c.charCodeAt(0)), contentType: `image/${m![1]}`, ext: m![1] === 'jpeg' ? 'jpg' : m![1] };
  });
  const message = str(d.message, 3000);
  if (!message && items.length === 0 && photos.length === 0 && links.length === 0) bad('Tell us what you’d like, or attach a photo');
  return { name, contact, country: str(d.country, 80), business: str(d.business, 120), message, items, links, photos };
}

/** Short, readable reference like "K7Q2MX" for WhatsApp messages. */
export function inquiryId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => chars[b % chars.length]).join('');
}
