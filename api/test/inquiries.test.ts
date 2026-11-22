import { beforeEach, describe, expect, it } from 'vitest';
import { hashPassword } from '../src/domain/passwords';
import { MemoryStore } from '../src/adapters/memory-store';
import { MemoryInquiryStore, MemoryPhotoStore } from '../src/adapters/memory-inquiries';
import { createApp } from '../src/app';

const TINY = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
const good = {
  name: 'Asha', contact: '+44 7700 900123', country: 'UK', business: 'Asha Boutique',
  message: 'Like the photos, in teal and gold', items: [{ item: 'Silk thread bangles', quantity: 24, notes: 'size 2.6', likeSku: '' }],
  links: ['https://www.instagram.com/reel/C9xYz12AbCd/'], photos: [TINY, TINY], website: '',
};

describe('custom order inquiries', () => {
  let users: MemoryStore; let inquiries: MemoryInquiryStore; let photos: MemoryPhotoStore;
  const app = () => createApp({ store: users, inquiries, photos, sessionSecret: 'test-secret-test-secret-test-secret-0123', superAdminEmail: 'banu_c@yahoo.com', allowedOrigins: [], iterations: 1000, siteUrl: 'http://x' });
  const call = async (path: string, init: { method?: string; body?: object; token?: string } = {}) => {
    const res = await app().request(path, {
      method: init.method ?? (init.body ? 'POST' : 'GET'),
      headers: { 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const type = res.headers.get('content-type') ?? '';
    return { status: res.status, type, body: type.includes('json') ? ((await res.json()) as Record<string, any>) : await res.arrayBuffer() };
  };
  const staff = async (role: 'admin' | 'editor' | 'customer') => {
    const email = `${role}@example.com`;
    await users.createUser({ email, displayName: role, role, disabled: false, passwordHash: await hashPassword('pass-word-1', 1000), mustChangePassword: false, tokenVersion: 0, failedLogins: 0, lockedUntil: null, createdAt: '', lastLoginAt: null });
    return ((await call('/api/auth/login', { body: { email, password: 'pass-word-1' } })).body as any).token as string;
  };

  beforeEach(() => { users = new MemoryStore(); inquiries = new MemoryInquiryStore(); photos = new MemoryPhotoStore(); });

  it('anyone can send a request with photos and links; photos are stored privately', async () => {
    const r = await call('/api/inquiries', { body: good });
    expect(r.status).toBe(201);
    expect((r.body as any).id).toMatch(/^[A-Z0-9]{6}$/);
    expect(Object.keys(photos.files)).toHaveLength(2);
  });

  it('validates: needs a name, a way to reply, something to make; max 5 photos; https links only', async () => {
    expect((await call('/api/inquiries', { body: { ...good, name: '' } })).status).toBe(400);
    expect((await call('/api/inquiries', { body: { ...good, contact: '' } })).status).toBe(400);
    expect((await call('/api/inquiries', { body: { ...good, message: '', items: [], photos: [], links: [] } })).status).toBe(400);
    expect((await call('/api/inquiries', { body: { ...good, photos: Array(6).fill(TINY) } })).status).toBe(400);
    expect((await call('/api/inquiries', { body: { ...good, links: ['javascript:alert(1)'] } })).status).toBe(400);
    expect((await call('/api/inquiries', { body: { ...good, photos: ['data:text/html;base64,PGgxPg=='] } })).status).toBe(400);
  });

  it('silently drops bot submissions that fill the hidden field', async () => {
    const r = await call('/api/inquiries', { body: { ...good, website: 'http://spam.example' } });
    expect(r.status).toBe(201);
    expect(inquiries.rows).toHaveLength(0);
  });

  it('staff see requests and photos and can update status/notes; customers and visitors cannot', async () => {
    const id = ((await call('/api/inquiries', { body: good })).body as any).id;
    const customer = await staff('customer');
    const editor = await staff('editor');
    expect((await call('/api/inquiries')).status).toBe(401);
    expect((await call('/api/inquiries', { token: customer })).status).toBe(403);
    const list = await call('/api/inquiries', { token: editor });
    expect((list.body as any).inquiries[0]).toMatchObject({ id, name: 'Asha', status: 'new', photoCount: 2 });
    const photo = await call(`/api/inquiries/${id}/photos/0`, { token: editor });
    expect(photo.status).toBe(200);
    expect(photo.type).toBe('image/webp');
    expect((await call(`/api/inquiries/${id}/photos/0`)).status).toBe(401);
    const upd = await call(`/api/inquiries/${id}`, { method: 'PATCH', token: editor, body: { status: 'replied', notes: 'Quoted CA$480' } });
    expect((upd.body as any).inquiry).toMatchObject({ status: 'replied', notes: 'Quoted CA$480' });
  });
});
