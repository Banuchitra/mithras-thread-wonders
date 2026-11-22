// ContentStore adapter for local development: talks to scripts/content-bridge.mjs, which reads/writes the
// site's content/ and public/images/ files. (Production adapter: commits to GitHub — same port.)
import type { ContentStore } from '../domain/ports';

type Type = 'products' | 'categories' | 'collections' | 'promotions';

export class BridgeContentStore implements ContentStore {
  constructor(private url: string, private secret: string) {}

  private async call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const res = await fetch(`${this.url}${path}`, {
      method: init.method ?? 'GET',
      headers: { 'content-type': 'application/json', 'x-bridge-secret': this.secret },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    }).catch(() => { throw new Error('Content bridge is not running (npm run content:bridge)'); });
    if (!res.ok) throw new Error(`Content bridge error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  async list(type: Type) { return (await this.call<{ items: Record<string, unknown>[] }>(`/content/${type}`)).items; }
  async put(type: Type, id: string, data: Record<string, unknown>) { await this.call(`/content/${type}/${id}`, { method: 'PUT', body: data }); }
  async remove(type: Type, id: string) { await this.call(`/content/${type}/${id}`, { method: 'DELETE' }); }
  async getSettings() { return this.call<Record<string, unknown>>('/settings'); }
  async putSettings(data: Record<string, unknown>) { await this.call('/settings', { method: 'PUT', body: data }); }
  async putFile(path: string, base64: string) { await this.call('/files', { method: 'PUT', body: { path, base64 } }); }
}
