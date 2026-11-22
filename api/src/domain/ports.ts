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

/** Port: where site content lives (local files via the content bridge today; GitHub commits in production). */
export interface ContentStore {
  list(type: 'products' | 'categories' | 'collections' | 'promotions'): Promise<Record<string, unknown>[]>;
  put(type: 'products' | 'categories' | 'collections' | 'promotions', id: string, data: Record<string, unknown>): Promise<void>;
  remove(type: 'products' | 'categories' | 'collections' | 'promotions', id: string): Promise<void>;
  getSettings(): Promise<Record<string, unknown>>;
  putSettings(data: Record<string, unknown>): Promise<void>;
  /** path like "images/products/<slug>/<name>.webp" (relative to the site's public folder). */
  putFile(path: string, base64: string): Promise<void>;
}

export interface InquiryItem { item: string; quantity: number; notes: string; likeSku: string }
export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  country: string;
  business: string;
  message: string;
  items: InquiryItem[];
  links: string[];
  photoCount: number;
  status: 'new' | 'replied' | 'closed';
  notes: string;
}

/** Port: custom-order / wholesale requests (D1). */
export interface InquiryStore {
  add(i: Inquiry): Promise<void>;
  list(): Promise<Inquiry[]>;
  get(id: string): Promise<Inquiry | null>;
  update(id: string, patch: Partial<Pick<Inquiry, 'status' | 'notes'>>): Promise<Inquiry | null>;
}

/** Port: private photo storage (R2). Keys like "inquiries/<id>/<n>.webp". */
export interface PhotoStore {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<{ bytes: Uint8Array; contentType: string } | null>;
}
