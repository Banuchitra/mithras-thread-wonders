// InquiryStore on D1 (Drizzle) and PhotoStore on R2 — private storage for customers' reference photos.
import { desc, eq } from 'drizzle-orm';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import type { Inquiry, InquiryStore, PhotoStore } from '../domain/ports';
import { inquiries } from './schema';

export class D1InquiryStore implements InquiryStore {
  private db: DrizzleD1Database;
  constructor(d1: D1Database) { this.db = drizzle(d1); }
  async add(i: Inquiry) { await this.db.insert(inquiries).values(i); }
  async list() { return (await this.db.select().from(inquiries).orderBy(desc(inquiries.createdAt))) as Inquiry[]; }
  async get(id: string) { const [r] = await this.db.select().from(inquiries).where(eq(inquiries.id, id)); return (r as Inquiry | undefined) ?? null; }
  async update(id: string, patch: Partial<Pick<Inquiry, 'status' | 'notes'>>) {
    if (Object.keys(patch).length) await this.db.update(inquiries).set(patch).where(eq(inquiries.id, id));
    return this.get(id);
  }
}

export class R2PhotoStore implements PhotoStore {
  constructor(private bucket: R2Bucket) {}
  async put(key: string, bytes: Uint8Array, contentType: string) { await this.bucket.put(key, bytes, { httpMetadata: { contentType } }); }
  async get(key: string) {
    const obj = await this.bucket.get(key);
    return obj ? { bytes: new Uint8Array(await obj.arrayBuffer()), contentType: obj.httpMetadata?.contentType ?? 'application/octet-stream' } : null;
  }
}
