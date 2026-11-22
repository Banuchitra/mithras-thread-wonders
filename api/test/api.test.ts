import { beforeEach, describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/domain/passwords';
import { AccessError, assertCanChange, effectiveAccess, type UserRecord } from '../src/domain/users';
import { MemoryStore } from '../src/adapters/memory-store';
import { createApp } from '../src/app';

const SUPER = 'banu_c@yahoo.com';
const SECRET = 'test-secret-test-secret-test-secret-0123';
const ITER = 1000; // fast hashing in tests

const rec = (over: Partial<UserRecord> = {}): UserRecord => ({
  email: 'someone@example.com', displayName: 'Someone', role: 'customer', disabled: false, passwordHash: null,
  mustChangePassword: false, tokenVersion: 0, failedLogins: 0, lockedUntil: null, createdAt: '2026-11-22T00:00:00Z',
  lastLoginAt: null, ...over,
});

describe('passwords', () => {
  it('hashes with a random salt and verifies only the right password', async () => {
    const a = await hashPassword('correct horse', ITER);
    const b = await hashPassword('correct horse', ITER);
    expect(a).not.toBe(b);
    expect(a).not.toContain('correct horse');
    expect(await verifyPassword('correct horse', a)).toBe(true);
    expect(await verifyPassword('wrong', a)).toBe(false);
    expect(await verifyPassword('x', 'garbage')).toBe(false);
  });
});

describe('access rules', () => {
  it('the super admin email is always admin, even if stored data says otherwise', () => {
    expect(effectiveAccess(rec({ email: 'Banu_C@yahoo.com', role: 'customer', disabled: true }), SUPER)).toEqual({ role: 'admin', isSuperAdmin: true });
  });
  it('blocks disabled users', () => {
    expect(() => effectiveAccess(rec({ disabled: true }), SUPER)).toThrow(AccessError);
  });
  it('nobody can change or remove the super admin; admins cannot remove themselves', () => {
    const admin = { email: 'admin@example.com', role: 'admin' as const, isSuperAdmin: false };
    expect(() => assertCanChange(admin, SUPER, { role: 'customer' }, SUPER)).toThrow(/super admin/i);
    expect(() => assertCanChange(admin, admin.email, { remove: true }, SUPER)).toThrow(/yourself/);
    expect(() => assertCanChange({ ...admin, role: 'editor' }, 'x@example.com', { role: 'editor' }, SUPER)).toThrow(/Admins only/);
  });
});

describe('API', () => {
  let store: MemoryStore;
  const app = () => createApp({ store, sessionSecret: SECRET, superAdminEmail: SUPER, allowedOrigins: ['http://localhost:3000'], iterations: ITER, siteUrl: 'http://localhost:3000' });
  const call = async (path: string, init: { method?: string; body?: object; token?: string } = {}) => {
    const res = await app().request(path, {
      method: init.method ?? (init.body ? 'POST' : 'GET'),
      headers: { 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, any> };
  };
  const login = async (email: string, password: string) => (await call('/api/auth/login', { body: { email, password } })).body.token as string;
  /** Signs in a seeded admin and replaces the temporary password, as the UI forces. */
  const adminToken = async (email = 'mithras.canada@gmail.com') => {
    const t = await login(email, 'admin');
    return (await call('/api/auth/change-password', { token: t, body: { currentPassword: 'admin', newPassword: 'a-strong-new-pass' } })).body.token as string;
  };

  beforeEach(async () => {
    store = new MemoryStore();
    for (const email of ['mithras.canada@gmail.com', SUPER]) {
      await store.createUser(rec({ email, role: 'admin', passwordHash: await hashPassword('admin', ITER), mustChangePassword: true }));
    }
  });

  it('seeded admin signs in with the temporary password and is told to change it', async () => {
    const r = await call('/api/auth/login', { body: { email: 'Mithras.Canada@gmail.com', password: 'admin' } });
    expect(r.status).toBe(200);
    expect(r.body.user).toMatchObject({ email: 'mithras.canada@gmail.com', role: 'admin', mustChangePassword: true });
  });

  it('rejects wrong passwords with a generic message and locks after 5 failures', async () => {
    for (let i = 0; i < 5; i++) expect((await call('/api/auth/login', { body: { email: SUPER, password: 'nope' } })).body.error).toBe('Email or password is incorrect');
    const locked = await call('/api/auth/login', { body: { email: SUPER, password: 'admin' } });
    expect(locked.status).toBe(429);
  });

  it('until the temporary password is changed, only /me and change-password work', async () => {
    const t = await login('mithras.canada@gmail.com', 'admin');
    expect((await call('/api/me', { token: t })).status).toBe(200);
    expect((await call('/api/users', { token: t })).status).toBe(403);
  });

  it('change password requires the current one, clears the flag and invalidates old sessions', async () => {
    const t = await login(SUPER, 'admin');
    expect((await call('/api/auth/change-password', { token: t, body: { currentPassword: 'bad', newPassword: 'a-much-better-one' } })).status).toBe(400);
    expect((await call('/api/auth/change-password', { token: t, body: { currentPassword: 'admin', newPassword: 'short' } })).status).toBe(400);
    const ok = await call('/api/auth/change-password', { token: t, body: { currentPassword: 'admin', newPassword: 'a-much-better-one' } });
    expect(ok.status).toBe(200);
    expect(ok.body.user.mustChangePassword).toBe(false);
    expect((await call('/api/me', { token: t })).status).toBe(401); // old session revoked
    expect((await call('/api/me', { token: ok.body.token })).status).toBe(200);
  });

  it('sign-up creates a customer, refuses duplicates, and can be switched off by an admin', async () => {
    const s = await call('/api/auth/signup', { body: { name: 'Asha', email: 'asha@example.com', password: 'lovely-bangles' } });
    expect(s.status).toBe(201);
    expect(s.body.user).toMatchObject({ role: 'customer' });
    expect((await call('/api/auth/signup', { body: { name: 'X', email: SUPER, password: 'takeover-attempt' } })).status).toBe(409);
    const admin = await adminToken();
    await call('/api/settings', { method: 'PATCH', token: admin, body: { allowSignups: false } });
    expect((await call('/api/settings/public')).body.allowSignups).toBe(false);
    expect((await call('/api/auth/signup', { body: { name: 'B', email: 'b@example.com', password: 'another-pass' } })).status).toBe(403);
  });

  it('admin adds, changes, disables and removes people; customers cannot', async () => {
    const admin = await adminToken();
    const add = await call('/api/users', { token: admin, body: { email: 'helper@example.com', name: 'Helper', role: 'editor', password: 'temp-pass-123' } });
    expect(add.status).toBe(201);
    const helper = await login('helper@example.com', 'temp-pass-123');
    expect((await call('/api/me', { token: helper })).body).toMatchObject({ role: 'editor', mustChangePassword: true });
    expect((await call('/api/users', { token: helper })).status).toBe(403);

    expect((await call('/api/users/helper%40example.com', { method: 'PATCH', token: admin, body: { disabled: true } })).status).toBe(200);
    expect((await call('/api/me', { token: helper })).status).toBe(403);
    expect((await call('/api/users/helper%40example.com', { method: 'DELETE', token: admin })).status).toBe(200);
    expect((await call('/api/users', { token: admin })).body.users.map((u: { email: string }) => u.email)).not.toContain('helper@example.com');
    expect((await call(`/api/users/${encodeURIComponent(SUPER)}`, { method: 'DELETE', token: admin })).status).toBe(403);
  });

  it('forgot → admin sees the request → one-time reset link → new password works once', async () => {
    await call('/api/auth/signup', { body: { name: 'Asha', email: 'asha@example.com', password: 'lovely-bangles' } });
    expect((await call('/api/auth/forgot', { body: { email: 'asha@example.com' } })).status).toBe(200);
    expect((await call('/api/auth/forgot', { body: { email: 'nobody@example.com' } })).status).toBe(200); // no account enumeration

    const admin = await adminToken();
    const pending = await call('/api/reset-requests', { token: admin });
    expect(pending.body.requests.map((r: { email: string }) => r.email)).toEqual(['asha@example.com']);

    const link = await call('/api/users/asha%40example.com/reset-link', { token: admin, body: {} });
    const token = new URL(link.body.link).searchParams.get('token')!;
    expect((await call('/api/auth/reset', { body: { token, password: 'brand-new-pass' } })).status).toBe(200);
    expect((await call('/api/auth/reset', { body: { token, password: 'again-again-1' } })).status).toBe(400); // single use
    expect(await login('asha@example.com', 'brand-new-pass')).toBeTruthy();
    expect((await call('/api/reset-requests', { token: admin })).body.requests).toHaveLength(0);
  });

  it('rejects missing or tampered session tokens', async () => {
    expect((await call('/api/me')).status).toBe(401);
    const t = await login(SUPER, 'admin');
    expect((await call('/api/me', { token: t.slice(0, -2) + 'xx' })).status).toBe(401);
  });

  it('answers CORS preflight only for allowed origins', async () => {
    const ok = await app().request('/api/me', { method: 'OPTIONS', headers: { origin: 'http://localhost:3000', 'access-control-request-method': 'GET' } });
    expect(ok.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    const put = await app().request('/api/content/products/x', { method: 'OPTIONS', headers: { origin: 'http://localhost:3000', 'access-control-request-method': 'PUT' } });
    expect(put.headers.get('access-control-allow-methods')).toContain('PUT'); // admin saves use PUT
    const bad = await app().request('/api/me', { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' } });
    expect(bad.headers.get('access-control-allow-origin')).toBeNull();
  });
});
