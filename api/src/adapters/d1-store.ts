// Store adapter backed by Cloudflare D1 through Drizzle ORM.
import { and, asc, eq, isNull } from 'drizzle-orm';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { ResetRequest, Settings, Store } from '../domain/ports';
import { normaliseEmail, type UserRecord } from '../domain/users';
import { passwordResets, settings, users } from './schema';

export class D1Store implements Store {
  private db: DrizzleD1Database;
  constructor(d1: D1Database) { this.db = drizzle(d1); }

  async getUser(email: string) {
    const [row] = await this.db.select().from(users).where(eq(users.email, normaliseEmail(email)));
    return (row as UserRecord | undefined) ?? null;
  }
  async createUser(u: UserRecord) { await this.db.insert(users).values({ ...u, email: normaliseEmail(u.email) }); }
  async updateUser(email: string, patch: Partial<UserRecord>) {
    const { email: _ignored, ...rest } = patch;
    if (Object.keys(rest).length) await this.db.update(users).set(rest).where(eq(users.email, normaliseEmail(email)));
    return this.getUser(email);
  }
  async deleteUser(email: string) { await this.db.delete(users).where(eq(users.email, normaliseEmail(email))); }
  async listUsers() { return (await this.db.select().from(users).orderBy(asc(users.email))) as UserRecord[]; }

  async addReset(r: ResetRequest) { await this.db.insert(passwordResets).values(r); }
  async findResetByTokenHash(h: string) {
    const [row] = await this.db.select().from(passwordResets).where(eq(passwordResets.tokenHash, h));
    return row ?? null;
  }
  async closeResets(email: string, now: string) {
    await this.db.update(passwordResets).set({ usedAt: now })
      .where(and(eq(passwordResets.email, normaliseEmail(email)), isNull(passwordResets.usedAt)));
  }
  async listPendingResets() {
    return this.db.select().from(passwordResets)
      .where(and(isNull(passwordResets.usedAt), isNull(passwordResets.tokenHash))).orderBy(asc(passwordResets.createdAt));
  }

  async getSettings(): Promise<Settings> {
    const [row] = await this.db.select().from(settings).where(eq(settings.key, 'allowSignups'));
    return { allowSignups: row ? row.value === 'true' : true };
  }
  async saveSettings(s: Settings) {
    await this.db.insert(settings).values({ key: 'allowSignups', value: String(s.allowSignups) })
      .onConflictDoUpdate({ target: settings.key, set: { value: String(s.allowSignups) } });
  }
}
