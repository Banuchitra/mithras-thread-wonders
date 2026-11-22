// Validation for owner-edited site content (products, categories, collections, promotions, settings).
// Pure TypeScript. Everything is checked here before the API writes it, so the public site never breaks.
import { AccessError } from './users';

export const CONTENT_TYPES = ['products', 'categories', 'collections', 'promotions'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export type Doc = Record<string, unknown>;

export const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_SRC_RE = /^\/images\/(products|promotions|collections)\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|jpe?g|png)$/;
const FONT_PAIRINGS = ['heritage', 'temple', 'royal'];

const bad = (msg: string): never => { throw new AccessError(400, msg); };
const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bool = (v: unknown) => v === true;
const num = (v: unknown, dflt = 0) => (Number.isFinite(Number(v)) ? Number(v) : dflt);
const id = (v: unknown, label: string) => { const s = str(v, 120); if (!ID_RE.test(s)) bad(`${label}: use lowercase letters, numbers and hyphens only`); return s; };
const images = (v: unknown) => {
  if (!Array.isArray(v)) return [];
  return v.map((img) => {
    const src = str((img as Doc)?.src, 300);
    if (!IMAGE_SRC_RE.test(src)) bad('Each photo must be uploaded through the admin');
    return { src, alt: str((img as Doc)?.alt, 200) };
  });
};

export function validateProduct(d: Doc, categoryIds: string[]): Doc {
  const sku = str(d.sku, 60);
  if (!sku) bad('SKU is required');
  const title = str(d.title, 200);
  if (!title) bad('Title is required');
  const slug = id(d.slug, 'Web address');
  const price = str(d.price, 20);
  if (price && !(/^\d+(\.\d{1,2})?$/.test(price) && Number(price) >= 0)) bad('Price must be a number like 24.99 (or empty for "Price on request")');
  const categoryId = str(d.categoryId, 120);
  if (!categoryIds.includes(categoryId)) bad('Choose a category');
  const availability = d.availability === 'ships-from-canada' ? 'ships-from-canada' : 'made-to-order';
  const specs: Record<string, string> = {};
  if (d.specs && typeof d.specs === 'object') for (const [k, v] of Object.entries(d.specs as Doc)) { const key = str(k, 60); if (key) specs[key] = str(v, 300); }
  const listings = Array.isArray(d.listings)
    ? d.listings.map((l) => ({ channel: 'amazon', marketplace: str((l as Doc).marketplace, 5) || 'ca', asin: str((l as Doc).asin, 20) })).filter((l) => /^[A-Z0-9]{10}$/.test(l.asin))
    : [];
  return {
    sku, slug, title, subtitle: str(d.subtitle, 300) || undefined, price, currency: 'CAD', categoryId, availability,
    customisable: d.customisable !== false, featured: bool(d.featured), status: d.status === 'hidden' ? 'hidden' : 'active',
    description: str(d.description), bullets: Array.isArray(d.bullets) ? d.bullets.map((b) => str(b, 500)).filter(Boolean) : [],
    specs, images: images(d.images), listings, video: str(d.video, 300),
  };
}

export function validateCategory(d: Doc, collectionIds: string[]): Doc {
  const cid = id(d.id, 'ID');
  const name = str(d.name, 100) || bad('Name is required');
  const collectionId = str(d.collectionId, 120);
  if (!collectionIds.includes(collectionId)) bad('Choose a collection');
  return { id: cid, name, collectionId, order: num(d.order, 99), hidden: bool(d.hidden) };
}

export function validateCollection(d: Doc): Doc {
  return { id: id(d.id, 'ID'), name: str(d.name, 100) || bad('Name is required'), description: str(d.description, 300), order: num(d.order, 99), hidden: bool(d.hidden) };
}

export function validatePromotion(d: Doc): Doc {
  const placement = d.placement === 'video' ? 'video' : 'banner';
  const date = (v: unknown, label: string) => { const s = str(v, 10); if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) bad(`${label} must be a date`); return s || undefined; };
  const href = str(d.ctaHref, 300);
  if (href && !/^(\/|https:\/\/)/.test(href)) bad('Button link must start with / or https://');
  const imgs = d.image && (d.image as Doc).src ? images([d.image]) : [];
  return {
    id: id(d.id, 'ID'), title: str(d.title, 120) || bad('Headline is required'), subtitle: str(d.subtitle, 300), placement,
    ctaLabel: str(d.ctaLabel, 60), ctaHref: href, video: str(d.video, 300), ...(imgs[0] ? { image: imgs[0] } : {}),
    startDate: date(d.startDate, 'Start date'), endDate: date(d.endDate, 'End date'), order: num(d.order, 99), hidden: bool(d.hidden),
  };
}

export function validateSettings(d: Doc): Doc {
  const fontPairing = str(d.fontPairing, 20);
  if (!FONT_PAIRINGS.includes(fontPairing)) bad('Choose a font style');
  const whatsapp = str(d.whatsapp, 30);
  if (!/^\+?[\d\s-]{7,20}$/.test(whatsapp)) bad('WhatsApp number must include the country code, e.g. +91 80156 18956');
  return {
    brandName: str(d.brandName, 80) || bad('Brand name is required'), tagline: str(d.tagline, 120), whatsapp,
    instagram: str(d.instagram, 60).replace(/^@/, ''), currencyLocale: str(d.currencyLocale, 10) || 'en', fontPairing,
    aboutText: str(d.aboutText, 3000), announcement: str(d.announcement, 160),
  };
}

export function idOf(type: ContentType, d: Doc): string {
  return String(type === 'products' ? d.slug : d.id);
}
