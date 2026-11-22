// In-memory ContentStore for tests.
import type { ContentStore } from '../domain/ports';

type Type = 'products' | 'categories' | 'collections' | 'promotions';

export class MemoryContentStore implements ContentStore {
  files: Record<string, string> = {};
  constructor(public data: Record<Type, Record<string, Record<string, unknown>>>, public settings: Record<string, unknown>) {}
  async list(type: Type) { return Object.values(this.data[type]); }
  async put(type: Type, id: string, d: Record<string, unknown>) { this.data[type][id] = d; }
  async remove(type: Type, id: string) { delete this.data[type][id]; }
  async getSettings() { return this.settings; }
  async putSettings(d: Record<string, unknown>) { this.settings = d; }
  async putFile(path: string, base64: string) { this.files[path] = base64; }
}
