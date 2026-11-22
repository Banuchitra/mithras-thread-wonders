// HTTP API (Hono). Dependencies are injected so tests run without Cloudflare.
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { signSession, verifySession } from './adapters/sessions';
import type { Store } from './domain/ports';
import { MIN_PASSWORD_LENGTH, hashPassword, randomToken, sha256, verifyPassword } from './domain/passwords';
import {
  AccessError, ROLES, assertAdmin, assertCanChange, effectiveAccess, isValidEmail, normaliseEmail, publicUser,
  type Actor, type Role, type UserRecord,
} from './domain/users';

export interface Deps {
  store: Store;
  sessionSecret: string;
  superAdminEmail: string;
  allowedOrigins: string[];
  /** Base URL of the website, used to build reset links. */
  siteUrl: string;
  iterations?: number;
  now?: () => Date;
}

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const RESET_HOURS = 24;

type Env = { Variables: { actor: Actor; user: UserRecord } };

export function createApp(deps: Deps) {
  const now = () => (deps.now ? deps.now() : new Date());
  const iso = () => now().toISOString();
  const { store } = deps;
  const app = new Hono<Env>();
  const out = (u: UserRecord) => publicUser(u, deps.superAdminEmail);
  const checkPassword = (pw: unknown) => {
    if (typeof pw !== 'string' || pw.length < MIN_PASSWORD_LENGTH) {
      throw new AccessError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    return pw;
  };
  const newUser = (email: string, displayName: string, role: Role, passwordHash: string | null, mustChangePassword: boolean): UserRecord => ({
    email, displayName, role, disabled: false, passwordHash, mustChangePassword, tokenVersion: 0, failedLogins: 0,
    lockedUntil: null, createdAt: iso(), lastLoginAt: null,
  });
  const session = async (u: UserRecord) => ({ token: await signSession(u.email, u.tokenVersion, deps.sessionSecret), user: out(u) });

  app.use('/api/*', cors({
    origin: (origin) => (deps.allowedOrigins.includes(origin) ? origin : null),
    allowHeaders: ['authorization', 'content-type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 600,
  }));

  app.onError((err, c) => {
    if (err instanceof AccessError) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: 'Something went wrong' }, 500);
  });

  // ---------- public ----------
  app.get('/', (c) => c.text("Mithra's Thread Wonders API"));
  app.get('/api/settings/public', async (c) => c.json({ allowSignups: (await store.getSettings()).allowSignups }));

  app.post('/api/auth/signup', async (c) => {
    if (!(await store.getSettings()).allowSignups) throw new AccessError(403, 'Sign-ups are currently closed');
    const body = await c.req.json<{ name?: string; email?: string; password?: string }>();
    const email = normaliseEmail(body.email ?? '');
    if (!isValidEmail(email)) throw new AccessError(400, 'Enter a valid email');
    const password = checkPassword(body.password);
    if (await store.getUser(email)) throw new AccessError(409, 'An account with this email already exists — sign in instead');
    const user = newUser(email, (body.name ?? '').trim(), 'customer', await hashPassword(password, deps.iterations), false);
    user.lastLoginAt = iso();
    await store.createUser(user);
    return c.json(await session(user), 201);
  });

  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json<{ email?: string; password?: string }>();
    const email = normaliseEmail(body.email ?? '');
    const user = await store.getUser(email);
    const wrong = new AccessError(400, 'Email or password is incorrect');
    if (!user) { await verifyPassword(String(body.password ?? ''), null); throw wrong; }
    if (user.lockedUntil && user.lockedUntil > iso()) throw new AccessError(429, `Too many attempts — try again in ${LOCK_MINUTES} minutes`);
    if (!(await verifyPassword(String(body.password ?? ''), user.passwordHash))) {
      const failed = user.failedLogins + 1;
      await store.updateUser(email, failed >= MAX_FAILED
        ? { failedLogins: 0, lockedUntil: new Date(now().getTime() + LOCK_MINUTES * 60_000).toISOString() }
        : { failedLogins: failed });
      throw wrong;
    }
    effectiveAccess(user, deps.superAdminEmail); // throws if disabled
    const updated = (await store.updateUser(email, { failedLogins: 0, lockedUntil: null, lastLoginAt: iso() }))!;
    return c.json(await session(updated));
  });

  // Always answers the same way so nobody can probe which emails have accounts.
  app.post('/api/auth/forgot', async (c) => {
    const email = normaliseEmail((await c.req.json<{ email?: string }>()).email ?? '');
    if (isValidEmail(email) && (await store.getUser(email))) {
      await store.addReset({ id: randomToken(12), email, tokenHash: null, createdAt: iso(), expiresAt: null, usedAt: null });
    }
    return c.json({ message: 'If that email has an account, the shop owner will send you a reset link.' });
  });

  app.post('/api/auth/reset', async (c) => {
    const body = await c.req.json<{ token?: string; password?: string }>();
    const reset = body.token ? await store.findResetByTokenHash(await sha256(body.token)) : null;
    if (!reset || reset.usedAt || !reset.expiresAt || reset.expiresAt < iso()) {
      throw new AccessError(400, 'This reset link is invalid or has expired — ask for a new one');
    }
    const password = checkPassword(body.password);
    const user = await store.getUser(reset.email);
    if (!user) throw new AccessError(400, 'This reset link is invalid or has expired — ask for a new one');
    await store.updateUser(user.email, {
      passwordHash: await hashPassword(password, deps.iterations), mustChangePassword: false,
      tokenVersion: user.tokenVersion + 1, failedLogins: 0, lockedUntil: null,
    });
    await store.closeResets(user.email, iso());
    return c.json({ message: 'Password updated — you can sign in now.' });
  });

  // ---------- signed-in ----------
  const authed = new Hono<Env>();
  authed.use('*', async (c, next) => {
    const header = c.req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new AccessError(401, 'Please sign in');
    const s = await verifySession(token, deps.sessionSecret).catch(() => { throw new AccessError(401, 'Your session has expired — please sign in again'); });
    const user = await store.getUser(s.email);
    if (!user) throw new AccessError(401, 'Your session has expired — please sign in again');
    const access = effectiveAccess(user, deps.superAdminEmail); // a disabled account gets a clear 403 first
    if (user.tokenVersion !== s.tokenVersion) throw new AccessError(401, 'Your session has expired — please sign in again');
    c.set('actor', { ...access, email: user.email });
    c.set('user', user);
    await next();
  });

  authed.get('/me', (c) => c.json(out(c.get('user'))));

  authed.post('/auth/change-password', async (c) => {
    const user = c.get('user');
    const body = await c.req.json<{ currentPassword?: string; newPassword?: string }>();
    if (!(await verifyPassword(String(body.currentPassword ?? ''), user.passwordHash))) throw new AccessError(400, 'Current password is incorrect');
    const password = checkPassword(body.newPassword);
    const updated = (await store.updateUser(user.email, {
      passwordHash: await hashPassword(password, deps.iterations), mustChangePassword: false, tokenVersion: user.tokenVersion + 1,
    }))!;
    return c.json(await session(updated));
  });

  // ---------- admin ----------
  authed.get('/users', async (c) => {
    assertAdmin(c.get('actor'));
    return c.json({ users: (await store.listUsers()).map(out) });
  });

  authed.post('/users', async (c) => {
    const actor = c.get('actor');
    const body = await c.req.json<{ email?: string; name?: string; role?: Role; password?: string }>();
    const email = normaliseEmail(body.email ?? '');
    if (!isValidEmail(email)) throw new AccessError(400, 'Enter a valid email');
    const role = body.role ?? 'customer';
    assertCanChange(actor, email, { role }, deps.superAdminEmail);
    if (await store.getUser(email)) throw new AccessError(409, 'That person already has an account');
    const hash = body.password ? await hashPassword(checkPassword(body.password), deps.iterations) : null;
    const user = newUser(email, (body.name ?? '').trim(), role, hash, true);
    await store.createUser(user);
    return c.json({ user: out(user) }, 201);
  });

  authed.patch('/users/:email', async (c) => {
    const email = normaliseEmail(decodeURIComponent(c.req.param('email')));
    const body = await c.req.json<{ role?: Role; disabled?: boolean }>();
    const change = { ...(body.role !== undefined ? { role: body.role } : {}), ...(body.disabled !== undefined ? { disabled: Boolean(body.disabled) } : {}) };
    assertCanChange(c.get('actor'), email, change, deps.superAdminEmail);
    const user = await store.getUser(email);
    if (!user) throw new AccessError(404, 'No such user');
    const updated = await store.updateUser(email, { ...change, ...(change.disabled ? { tokenVersion: user.tokenVersion + 1 } : {}) });
    return c.json({ user: out(updated!) });
  });

  authed.delete('/users/:email', async (c) => {
    const email = normaliseEmail(decodeURIComponent(c.req.param('email')));
    assertCanChange(c.get('actor'), email, { remove: true }, deps.superAdminEmail);
    if (!(await store.getUser(email))) throw new AccessError(404, 'No such user');
    await store.deleteUser(email);
    await store.closeResets(email, iso());
    return c.json({ removed: email });
  });

  authed.post('/users/:email/reset-link', async (c) => {
    assertAdmin(c.get('actor'));
    const email = normaliseEmail(decodeURIComponent(c.req.param('email')));
    if (!(await store.getUser(email))) throw new AccessError(404, 'No such user');
    await store.closeResets(email, iso());
    const token = randomToken();
    const expiresAt = new Date(now().getTime() + RESET_HOURS * 3_600_000).toISOString();
    await store.addReset({ id: randomToken(12), email, tokenHash: await sha256(token), createdAt: iso(), expiresAt, usedAt: null });
    return c.json({ link: `${deps.siteUrl}/account/reset/?token=${token}`, expiresAt });
  });

  authed.get('/reset-requests', async (c) => {
    assertAdmin(c.get('actor'));
    return c.json({ requests: await store.listPendingResets() });
  });

  authed.patch('/settings', async (c) => {
    assertAdmin(c.get('actor'));
    const body = await c.req.json<{ allowSignups?: boolean }>();
    const next = { ...(await store.getSettings()), ...(body.allowSignups !== undefined ? { allowSignups: Boolean(body.allowSignups) } : {}) };
    await store.saveSettings(next);
    return c.json(next);
  });

  authed.get('/roles', (c) => c.json({ roles: ROLES }));

  app.route('/api', authed);
  return app;
}
