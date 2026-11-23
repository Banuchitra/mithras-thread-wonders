import { describe, expect, it } from 'vitest';
import { seal, unseal } from '@/lib/admin-crypto';
import { parseFrontmatter, stringifyFrontmatter } from '@/lib/frontmatter';

describe('admin key sealing', () => {
  it('only the right password unlocks the token', async () => {
    const box = await seal('github_pat_example123', 'Peacock-Jasmine-River-47', 1000);
    expect(JSON.stringify(box)).not.toContain('github_pat');
    expect(await unseal(box, 'Peacock-Jasmine-River-47')).toBe('github_pat_example123');
    await expect(unseal(box, 'wrong password')).rejects.toThrow();
  });
  it('uses a fresh salt each time', async () => {
    const a = await seal('t', 'p', 1000); const b = await seal('t', 'p', 1000);
    expect(a.salt).not.toBe(b.salt);
  });
});

describe('frontmatter', () => {
  it('round-trips product files written by the site', () => {
    const src = "---\nsku: PERUMAL-001A\ntitle: 'Perumal Set'\nprice: '35.00'\nbullets:\n  - A\n  - B\n---\n";
    const data = parseFrontmatter(src);
    expect(data).toMatchObject({ sku: 'PERUMAL-001A', price: '35.00', bullets: ['A', 'B'] });
    expect(parseFrontmatter(stringifyFrontmatter(data))).toEqual(data);
  });
});

import { withSlash } from '@/lib/api';
describe('API paths', () => {
  it('always end with a slash (no redirect for Safari), keeping query strings', () => {
    expect(withSlash('/api/content/products')).toBe('/api/content/products/');
    expect(withSlash('/api/users/a%40b.com')).toBe('/api/users/a%40b.com/');
    expect(withSlash('/api/me/')).toBe('/api/me/');
    expect(withSlash('/api/x?y=1')).toBe('/api/x/?y=1');
  });
});
