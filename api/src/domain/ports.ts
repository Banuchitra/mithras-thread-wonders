import type { UserRecord } from './users';

export interface ResetRequest {
  id: string;
  email: string;
  /** null while it's only a customer's "forgot password" request awaiting an admin. */
  tokenHash: string | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
}

export interface Settings {
  allowSignups: boolean;
}

/** Port: account storage (D1 today; DynamoDB/Aurora later). */
export interface Store {
  getUser(email: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<void>;
  updateUser(email: string, patch: Partial<UserRecord>): Promise<UserRecord | null>;
  deleteUser(email: string): Promise<void>;
  listUsers(): Promise<UserRecord[]>;

  addReset(r: ResetRequest): Promise<void>;
  findResetByTokenHash(tokenHash: string): Promise<ResetRequest | null>;
  /** Marks every open request for this email as used (after a reset, or when an admin issues a link). */
  closeResets(email: string, now: string): Promise<void>;
  listPendingResets(): Promise<ResetRequest[]>;

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
}
