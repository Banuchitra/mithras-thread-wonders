// In-memory inquiry + photo stores for tests.
import type { Inquiry, InquiryStore, PhotoStore } from '../domain/ports';

export class MemoryInquiryStore implements InquiryStore {
  rows: Inquiry[] = [];
  async add(i: Inquiry) { this.rows.push(i); }
  async list() { return [...this.rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  async get(id: string) { return this.rows.find((r) => r.id === id) ?? null; }
  async update(id: string, patch: Partial<Pick<Inquiry, 'status' | 'notes'>>) {
    const r = this.rows.find((x) => x.id === id); if (!r) return null; Object.assign(r, patch); return r;
  }
}

export class MemoryPhotoStore implements PhotoStore {
  files: Record<string, { bytes: Uint8Array; contentType: string }> = {};
  async put(key: string, bytes: Uint8Array, contentType: string) { this.files[key] = { bytes, contentType }; }
  async get(key: string) { return this.files[key] ?? null; }
}
