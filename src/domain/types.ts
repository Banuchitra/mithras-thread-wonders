import type { Promotion } from './promotions';

// Core domain types. Pure TypeScript — no framework or vendor imports (see ADR-003).

/** Exact Amazon Seller SKU — the permanent product ID (ADR-001). */
export type Sku = string;

/** Amount in minor units (cents) plus ISO currency code (ADR-002). */
export interface Money {
  amount: number;
  currency: string;
}

export type ChannelListing =
  | { channel: 'amazon'; marketplace: string; asin: string };

export type Availability = 'ships-from-canada' | 'made-to-order';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  sku: Sku;
  slug: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  description: string;
  /** Missing = "Price on request" (e.g. made-to-order designs not priced yet). */
  price?: Money;
  categoryId: string;
  availability: Availability;
  customisable: boolean;
  featured?: boolean;
  images: ProductImage[];
  specs: Record<string, string>;
  listings: ChannelListing[];
  /** Optional Instagram reel, YouTube link or uploaded video file. */
  video?: string;
  status: 'active' | 'hidden';
}

export interface Collection {
  id: string;
  name: string;
  order: number;
  description?: string;
  image?: string;
  hidden?: boolean;
}

export interface Category {
  id: string;
  name: string;
  collectionId: string;
  order: number;
  hidden?: boolean;
}

export type FontPairing = 'heritage' | 'temple' | 'royal';

export interface SiteSettings {
  brandName: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  currencyLocale: string;
  fontPairing: FontPairing;
  aboutText: string;
  /** Short line in the bar above the header (offers, shipping notes). Empty = hidden. */
  announcement?: string;
}

/** Port: where the catalogue comes from (Markdown today, Amazon SP-API later). */
export interface CatalogSource {
  listProducts(): Product[];
  listPromotions(): Promotion[];
  listCollections(): Collection[];
  listCategories(): Category[];
  getSettings(): SiteSettings;
}
