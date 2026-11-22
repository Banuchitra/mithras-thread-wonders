import { describe, expect, it } from 'vitest';
import { formatMoney, moneyFromDecimal } from '@/domain/money';
import { buildCollectionTree, productsInCategory, visibleProducts } from '@/domain/catalog';
import { amazonUrl, instagramDmUrl, whatsappUrl, productOrderMessage } from '@/domain/channels';
import { formatQuoteMessage } from '@/domain/quote';
import type { Category, Collection, Product } from '@/domain/types';

const product = (over: Partial<Product> = {}): Product => ({
  sku: 'PERUMAL-001A',
  slug: 'perumal-set',
  title: 'MITHRAS CANADA Perumal Temple Jewelry Pearl Bead Necklace Set',
  bullets: [],
  description: '',
  price: { amount: 3500, currency: 'CAD' },
  categoryId: 'korean-chains',
  availability: 'ships-from-canada',
  customisable: true,
  images: [],
  specs: {},
  listings: [{ channel: 'amazon', marketplace: 'ca', asin: 'B0HNPBWRK6' }],
  status: 'active',
  ...over,
});

describe('money', () => {
  it('formats CAD minor units', () => {
    expect(formatMoney({ amount: 3500, currency: 'CAD' })).toBe('CA$35.00');
  });
  it('formats other currencies from data, not code', () => {
    expect(formatMoney({ amount: 129900, currency: 'INR' }, 'en-IN')).toBe('₹1,299.00');
  });
  it('converts decimal input to minor units without float drift', () => {
    expect(moneyFromDecimal('29.49', 'CAD')).toEqual({ amount: 2949, currency: 'CAD' });
    expect(moneyFromDecimal(0.1 + 0.2, 'CAD')).toEqual({ amount: 30, currency: 'CAD' });
  });
  it('rejects negative or non-numeric prices', () => {
    expect(() => moneyFromDecimal('-1', 'CAD')).toThrow();
    expect(() => moneyFromDecimal('abc', 'CAD')).toThrow();
  });
});

describe('catalog', () => {
  const collections: Collection[] = [
    { id: 'kids', name: 'Kids Accessories', order: 2 },
    { id: 'chains', name: 'Chains & Anklets', order: 1 },
    { id: 'old', name: 'Old', order: 0, hidden: true },
  ];
  const categories: Category[] = [
    { id: 'korean-chains', name: 'Korean chains', collectionId: 'chains', order: 2 },
    { id: 'invisible-chains', name: 'Invisible chains', collectionId: 'chains', order: 1 },
    { id: 'tiktok', name: 'Tiktok clips', collectionId: 'kids', order: 1 },
    { id: 'gone', name: 'Gone', collectionId: 'chains', order: 3, hidden: true },
  ];

  it('builds a sorted tree and drops hidden collections and categories', () => {
    const tree = buildCollectionTree(collections, categories);
    expect(tree.map((c) => c.id)).toEqual(['chains', 'kids']);
    expect(tree[0].categories.map((c) => c.id)).toEqual(['invisible-chains', 'korean-chains']);
  });

  it('hides hidden products', () => {
    const list = [product(), product({ sku: 'X', slug: 'x', status: 'hidden' })];
    expect(visibleProducts(list).map((p) => p.sku)).toEqual(['PERUMAL-001A']);
  });

  it('filters by category', () => {
    const list = [product(), product({ sku: 'LEAF-001A', slug: 'leaf', categoryId: 'invisible-chains' })];
    expect(productsInCategory(list, 'invisible-chains').map((p) => p.sku)).toEqual(['LEAF-001A']);
  });
});

describe('channels', () => {
  it('builds the Amazon URL for a marketplace listing', () => {
    expect(amazonUrl(product())).toBe('https://www.amazon.ca/dp/B0HNPBWRK6');
  });
  it('returns null when the product has no Amazon listing', () => {
    expect(amazonUrl(product({ listings: [] }))).toBeNull();
  });
  it('builds an Instagram DM link', () => {
    expect(instagramDmUrl('mithras_thread_wonders')).toBe('https://ig.me/m/mithras_thread_wonders');
  });
  it('builds a WhatsApp link with digits only and an encoded message', () => {
    expect(whatsappUrl('+91 80156 18956', 'Hi & hello')).toBe('https://wa.me/918015618956?text=Hi%20%26%20hello');
  });
  it('writes an order message with name, SKU, price and link', () => {
    const msg = productOrderMessage(product(), 'https://example.com/products/perumal-set/');
    expect(msg).toContain('PERUMAL-001A');
    expect(msg).toContain('CA$35.00');
    expect(msg).toContain('https://example.com/products/perumal-set/');
  });
});

describe('quote', () => {
  it('formats a bulk quote request like the owner order sheet', () => {
    const msg = formatQuoteMessage(
      { name: 'Asha', business: 'Asha Boutique', country: 'UK' },
      [
        { item: 'Silk thread bangles', quantity: 24, notes: 'Size 2.6, 12 pairs' },
        { item: 'Saree pins', likeSku: 'PIN-001A', quantity: 12, notes: '' },
      ],
    );
    expect(msg).toContain('Wholesale quote request');
    expect(msg).toContain('1. Silk thread bangles × 24 (Size 2.6, 12 pairs)');
    expect(msg).toContain('2. Saree pins × 12 [like PIN-001A]');
    expect(msg).toContain('Asha Boutique');
  });
  it('ignores empty lines and rejects a request with no items', () => {
    expect(() => formatQuoteMessage({ name: 'A', country: 'CA' }, [{ item: ' ', quantity: 0, notes: '' }])).toThrow();
  });
});
