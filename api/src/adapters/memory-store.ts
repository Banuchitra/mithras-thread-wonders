// In-memory Store for tests.
import type { ResetRequest, Settings, Store } from '../domain/ports';
import { normaliseEmail, type UserRecord } from '../domain/users';

export class MemoryStore implements Store {
  private users = new Map<string, UserRecord>();
  private resets: ResetRequest[] = [];
  private settings: Settings = { allowSignups: true };

  async getUser(email: string) { return this.users.get(normaliseEmail(email)) ?? null; }
  async createUser(u: UserRecord) { this.users.set(normaliseEmail(u.email), { ...u, email: normaliseEmail(u.email) }); }
  async updateUser(email: string, patch: Partial<UserRecord>) {
    const key = normaliseEmail(email); const u = this.users.get(key);
    if (!u) return null;
    const next = { ...u, ...patch }; this.users.set(key, next); return next;
  }
  async deleteUser(email: string) { this.users.delete(normaliseEmail(email)); }
  async listUsers() { return [...this.users.values()].sort((a, b) => a.email.localeCompare(b.email)); }

  async addReset(r: ResetRequest) { this.resets.push(r); }
  async findResetByTokenHash(h: string) { return this.resets.find((r) => r.tokenHash === h) ?? null; }
  async closeResets(email: string, now: string) {
    for (const r of this.resets) if (r.email === normaliseEmail(email) && !r.usedAt) r.usedAt = now;
  }
  async listPendingResets() { return this.resets.filter((r) => !r.usedAt && r.tokenHash === null); }

  async getSettings() { return this.settings; }
  async saveSettings(s: Settings) { this.settings = s; }
}
