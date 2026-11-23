import { describe, expect, it } from 'vitest';
import { parseCommand } from '@/domain/admin-commands';

const products = [
  { slug: 'peacock-choker-necklace-with-pearl-drops', title: 'MITHRA CANADA Peacock Choker Necklace with Pearl Drops' },
  { slug: 'gold-toned-temple-lakshmi-coin-necklace-with-pearl', title: 'MITHRAS CANADA Gold-Toned Temple Lakshmi Coin Necklace with Pearl & Stone Drops' },
  { slug: 'emerald-green-kundan-bangles', title: 'Emerald Green Kundan Bangles' },
  { slug: 'pink-kundan-silk-thread-bangles', title: 'Pink Kundan Silk Thread Bangles' },
];
const collections = [{ id: 'chains-and-necklaces', name: 'Chains & Necklaces' }, { id: 'bangles', name: 'Bangles' }];
const parse = (t: string) => parseCommand(t, products, collections);

describe('admin assistant commands', () => {
  it('hides, shows, deletes and features products by name', () => {
    expect(parse('hide peacock necklace')).toEqual({ kind: 'product', action: 'hide', slug: 'peacock-choker-necklace-with-pearl-drops' });
    expect(parse('Show the emerald bangles')).toMatchObject({ action: 'show', slug: 'emerald-green-kundan-bangles' });
    expect(parse('delete pink bangles')).toMatchObject({ action: 'delete', slug: 'pink-kundan-silk-thread-bangles' });
    expect(parse('feature lakshmi necklace')).toMatchObject({ action: 'feature' });
    expect(parse('unfeature lakshmi')).toMatchObject({ action: 'unfeature' });
  });
  it('sets prices', () => {
    expect(parse('price of lakshmi necklace to 31.99')).toEqual({ kind: 'price', slug: 'gold-toned-temple-lakshmi-coin-necklace-with-pearl', price: '31.99' });
    expect(parse('set emerald bangles price $26')).toMatchObject({ kind: 'price', price: '26' });
  });
  it('asks which one when a name matches several products', () => {
    const r = parse('hide bangles');
    expect(r.kind).toBe('choose');
    if (r.kind === 'choose') expect(r.options.map((o) => o.slug)).toEqual(expect.arrayContaining(['emerald-green-kundan-bangles', 'pink-kundan-silk-thread-bangles']));
  });
  it('updates the announcement and adds categories', () => {
    expect(parse('announcement: Diwali sale — 10% off')).toEqual({ kind: 'announcement', text: 'Diwali sale — 10% off' });
    expect(parse('change the announcement to Free shipping in Halifax')).toEqual({ kind: 'announcement', text: 'Free shipping in Halifax' });
    expect(parse('add category Anklets to Chains & Necklaces')).toEqual({ kind: 'category', name: 'Anklets', collectionId: 'chains-and-necklaces' });
  });
  it('navigates and helps', () => {
    expect(parse('add a product')).toEqual({ kind: 'go', href: '/admin/products/edit/', label: 'Add a product' });
    expect(parse('open categories')).toMatchObject({ kind: 'go', href: '/admin/categories/' });
    expect(parse('help')).toEqual({ kind: 'help' });
    expect(parse('make me a sandwich')).toEqual({ kind: 'unknown' });
    expect(parse('hide xyzzy')).toEqual({ kind: 'notfound', query: 'xyzzy' });
  });
});
