import { describe, expect, it } from 'vitest';
import { answer, type AssistantProduct } from '@/domain/assistant';

const p = (over: Partial<AssistantProduct>): AssistantProduct => ({
  slug: 'x', title: 'X', category: 'Silk thread bangles', collection: 'Bangles', text: '', price: 2499, ...over,
});
const catalogue: AssistantProduct[] = [
  p({ slug: 'green', title: 'Emerald Green Kundan Bangles', text: 'emerald green kundan stones pearl' }),
  p({ slug: 'pink', title: 'Pink Kundan Silk Thread Bangles', text: 'pink floral crystal' }),
  p({ slug: 'bridal', title: 'Red & Gold Bridal Silk Thread Bangle Set', category: 'Bridal bangles', text: 'red gold wedding', price: 12999 }),
  p({ slug: 'perumal', title: 'Perumal Temple Pearl Bead Necklace Set', category: 'Necklace earring sets', collection: 'Chains & Necklaces', text: 'temple pearl earrings', price: 3500 }),
  p({ slug: 'clip', title: 'Ruby & Pearl Kundan Center Clip', category: 'Center clips', collection: 'Kundan Accessories', text: 'hair', price: 1299 }),
  p({ slug: 'onrequest', title: 'Green Mystery Bangles', text: 'green', price: undefined }),
];

describe('shopping assistant', () => {
  it('finds products by colour and type', () => {
    const r = answer('green bangles', catalogue);
    expect(r.products.map((x) => x.slug)).toEqual(expect.arrayContaining(['green', 'onrequest']));
    expect(r.products.map((x) => x.slug)).not.toContain('pink');
  });
  it('understands synonyms like wedding → bridal and hair clip → clip', () => {
    expect(answer('something for my wedding', catalogue).products[0].slug).toBe('bridal');
    expect(answer('hair clip', catalogue).products[0].slug).toBe('clip');
  });
  it('applies price limits like "under $40"', () => {
    const r = answer('necklace under $40', catalogue);
    expect(r.products.map((x) => x.slug)).toEqual(['perumal']);
    expect(answer('bangles under 20', catalogue).products).toHaveLength(0);
  });
  it('recognises custom-order requests', () => {
    expect(answer('can you make this in blue? I have a photo', catalogue).intent).toBe('custom');
    expect(answer('bulk order for my shop', catalogue).intent).toBe('custom');
  });
  it('answers shipping and contact questions', () => {
    expect(answer('do you ship to canada?', catalogue).intent).toBe('shipping');
    expect(answer('how do I contact you', catalogue).intent).toBe('contact');
  });
  it('falls back gracefully when nothing matches', () => {
    const r = answer('xyzzy', catalogue);
    expect(r.products).toHaveLength(0);
    expect(r.intent).toBe('unknown');
  });
});
