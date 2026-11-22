import { formatMoney } from './money';
import type { Product } from './types';

const AMAZON_HOSTS: Record<string, string> = {
  ca: 'www.amazon.ca',
  us: 'www.amazon.com',
  uk: 'www.amazon.co.uk',
  in: 'www.amazon.in',
};

export function amazonUrl(product: Product, marketplace = 'ca'): string | null {
  const listing = product.listings.find((l) => l.channel === 'amazon' && l.marketplace === marketplace);
  const host = AMAZON_HOSTS[marketplace];
  return listing && host ? `https://${host}/dp/${listing.asin}` : null;
}

export function instagramDmUrl(handle: string): string {
  return `https://ig.me/m/${handle.replace(/^@/, '')}`;
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function productOrderMessage(product: Product, pageUrl: string): string {
  const price = product.price ? formatMoney(product.price) : 'price on request';
  return `Hi! I'd like to order "${product.title}" (SKU ${product.sku}) — ${price}.\n${pageUrl}`;
}

export function productQuoteMessage(product: Product, pageUrl: string): string {
  return `Hi! I'm interested in a custom / bulk order based on "${product.title}" (SKU ${product.sku}).\nColours, sizes and quantity: \n${pageUrl}`;
}
