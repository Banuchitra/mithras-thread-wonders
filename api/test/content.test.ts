import { beforeEach, describe, expect, it } from 'vitest';
import { hashPassword } from '../src/domain/passwords';
import { validateProduct, validateCategory, validateSettings } from '../src/domain/content';
import { MemoryStore } from '../src/adapters/memory-store';
import { MemoryContentStore } from '../src/adapters/memory-content-store';
import { createApp } from '../src/app';
import type { UserRecord } from '../src/domain/users';

const SUPER = 'banu_c@yahoo.com';
const ITER = 1000;
const goodProduct = {
  sku: 'BANGLE-011A', slug: 'teal-bangles', title: 'Teal Bangles', price: '24.99', currency: 'CAD',
  categoryId: 'silk-thread-bangles', availability: 'made-to-order', status: 'active', customisable: true, featured: false,
  description: 'Lovely.', bullets: ['Handmade'], specs: { Colour: 'Teal' },
  images: [{ src: '/images/products/teal-bangles/1.webp', alt: 'Teal bangles' }], listings: [], video: '',
};

describe('content validation', () => {
  it('accepts a good product and normalises it', () => {
    const p = validateProduct({ ...goodProduct, title: '  Teal Bangles ' }, ['silk-thread-bangles']);
    expect(p.title).toBe('Teal Bangles');
  });
  it('rejects bad slugs, prices, categories and image paths', () => {
    const cats = ['silk-thread-bangles'];
    expect(() => validateProduct({ ...goodProduct, slug: '../etc/passwd' }, cats)).toThrow(/web address/i);
    expect(() => validateProduct({ ...goodProduct, price: '-3' }, cats)).toThrow(/price/i);
    expect(() => validateProduct({ ...goodProduct, categoryId: 'nope' }, cats)).toThrow(/category/i);
    expect(() => validateProduct({ ...goodProduct, images: [{ src: 'https://evil.example/x.png', alt: '' }] }, cats)).toThrow(/photo/i);
    expect(() => validateProduct({ ...goodProduct, sku: '' }, cats)).toThrow(/SKU/);
  });
  it('allows "price on request" (empty price)', () => {
    expect(validateProduct({ ...goodProduct, price: '' }, ['silk-thread-bangles']).price).toBe('');
  });
  it('keeps in-place edits (page text, photos, links) and rejects unsafe ones', () => {
    const base = { brandName: 'M', tagline: '', whatsapp: '+91 80156 18956', instagram: 'm', fontPairing: 'heritage', aboutText: '', currencyLocale: 'en' };
    const s = validateSettings({ ...base, texts: { 'home.hero.title': 'Bangles for every bride', 'bad key!': 'x' }, images: { 'home.hero.image': '/images/site/home-hero-image/a1.webp' }, links: { 'home.hero.cta': '/shop/bangles/' } });
    expect(s.texts).toEqual({ 'home.hero.title': 'Bangles for every bride' });
    expect(s.images).toEqual({ 'home.hero.image': '/images/site/home-hero-image/a1.webp' });
    expect(s.links).toEqual({ 'home.hero.cta': '/shop/bangles/' });
    expect(() => validateSettings({ ...base, links: { 'home.hero.cta': 'javascript:alert(1)' } })).toThrow(/link/i);
    expect(() => validateSettings({ ...base, images: { 'home.hero.image': 'https://evil.example/x.png' } })).toThrow(/photo/i);
  });
  it('validates categories and settings', () => {
    expect(() => validateCategory({ id: 'x y', name: 'X', collectionId: 'bangles', order: 1 }, ['bangles'])).toThrow(/ID/);
    expect(() => validateSettings({ brandName: 'M', tagline: '', whatsapp: '+91 1', instagram: 'm', fontPairing: 'comic', aboutText: '', currencyLocale: 'en' })).toThrow(/font/i);
  });
});

describe('content API', () => {
  let users: MemoryStore;
  let content: MemoryContentStore;
  const app = () => createApp({ store: users, content, sessionSecret: 'test-secret-test-secret-test-secret-0123', superAdminEmail: SUPER, allowedOrigins: [], iterations: ITER, siteUrl: 'http://localhost:3000' });
  const call = async (path: string, init: { method?: string; body?: object; token?: string } = {}) => {
    const res = await app().request(path, {
      method: init.method ?? (init.body ? 'POST' : 'GET'),
      headers: { 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, any> };
  };
  const user = async (email: string, role: UserRecord['role']) => {
    await users.createUser({ email, displayName: email, role, disabled: false, passwordHash: await hashPassword('pass-word-1', ITER), mustChangePassword: false, tokenVersion: 0, failedLogins: 0, lockedUntil: null, createdAt: '', lastLoginAt: null });
    return (await call('/api/auth/login', { body: { email, password: 'pass-word-1' } })).body.token as string;
  };

  beforeEach(async () => {
    users = new MemoryStore();
    content = new MemoryContentStore({
      collections: { bangles: { id: 'bangles', name: 'Bangles', order: 1 } },
      categories: { 'silk-thread-bangles': { id: 'silk-thread-bangles', name: 'Silk thread bangles', collectionId: 'bangles', order: 1 } },
      products: {}, promotions: {},
    }, { brandName: "Mithra's Thread Wonders", tagline: 't', whatsapp: '+91 80156 18956', instagram: 'm', fontPairing: 'heritage', aboutText: '', currencyLocale: 'en' });
  });

  it('editors add, edit and delete products; customers cannot', async () => {
    const editor = await user('ed@example.com', 'editor');
    const customer = await user('cu@example.com', 'customer');
    expect((await call('/api/content/products/teal-bangles', { method: 'PUT', token: customer, body: goodProduct })).status).toBe(403);
    expect((await call('/api/content/products/teal-bangles', { method: 'PUT', token: editor, body: goodProduct })).status).toBe(200);
    expect((await call('/api/content/products', { token: editor })).body.items.map((p: any) => p.slug)).toEqual(['teal-bangles']);
    expect((await call('/api/content/products/teal-bangles', { method: 'PUT', token: editor, body: { ...goodProduct, slug: 'other' } })).status).toBe(400);
    expect((await call('/api/content/products/teal-bangles', { method: 'DELETE', token: editor })).status).toBe(200);
    expect(content.data.products['teal-bangles']).toBeUndefined();
  });

  it('refuses to delete a category that still has products', async () => {
    const admin = await user('ad@example.com', 'admin');
    await call('/api/content/products/teal-bangles', { method: 'PUT', token: admin, body: goodProduct });
    expect((await call('/api/content/categories/silk-thread-bangles', { method: 'DELETE', token: admin })).status).toBe(409);
  });

  it('only admins change site settings', async () => {
    const editor = await user('ed@example.com', 'editor');
    const admin = await user('ad@example.com', 'admin');
    const settings = { ...content.settings, announcement: 'Diwali offer!' };
    expect((await call('/api/content/settings', { method: 'PUT', token: editor, body: settings })).status).toBe(403);
    expect((await call('/api/content/settings', { method: 'PUT', token: admin, body: settings })).status).toBe(200);
    expect(content.settings.announcement).toBe('Diwali offer!');
  });

  it('uploads photos only as images into a safe, server-chosen path', async () => {
    const editor = await user('ed@example.com', 'editor');
    const tiny = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    const ok = await call('/api/uploads', { token: editor, body: { folder: 'products', slug: 'teal-bangles', dataUrl: tiny } });
    expect(ok.status).toBe(201);
    expect(ok.body.src).toMatch(/^\/images\/products\/teal-bangles\/[a-z0-9]+\.webp$/);
    expect((await call('/api/uploads', { token: editor, body: { folder: '../../etc', slug: 'x', dataUrl: tiny } })).status).toBe(400);
    expect((await call('/api/uploads', { token: editor, body: { folder: 'products', slug: 'x', dataUrl: 'data:text/html;base64,PGgxPg==' } })).status).toBe(400);
  });
});
