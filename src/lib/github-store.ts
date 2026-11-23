// Browser-side content store for the live site: reads and writes the repo's content files through the GitHub
// API with the unlocked access key. Every save is a commit; the deploy workflow republishes (~1 minute).
import { parseFrontmatter, stringifyFrontmatter } from './frontmatter';

export const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? 'Banuchitra/mithras-thread-wonders';
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH ?? 'main';
const API = `https://api.github.com/repos/${REPO}/contents`;

type Doc = Record<string, unknown>;
type Type = 'products' | 'categories' | 'collections' | 'promotions';

const toB64 = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
const fromB64 = (b: string) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

export class GitHubStore {
  constructor(private token: string) {}

  private async gh<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const res = await fetch(`${API}/${path}${init.method ? '' : `?ref=${BRANCH}`}`, {
      method: init.method ?? 'GET',
      headers: { authorization: `Bearer ${this.token}`, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });
    if (res.status === 401) throw new Error('The admin key has expired or was revoked — see “Renew the admin key” in the guide.');
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.json().catch(() => ({}))).message ?? 'request failed'}`);
    return res.json() as Promise<T>;
  }

  private async sha(path: string): Promise<string | undefined> {
    try { return (await this.gh<{ sha: string }>(path)).sha; } catch { return undefined; }
  }

  private async write(path: string, base64: string, message: string) {
    await this.gh(path, { method: 'PUT', body: { message, content: base64, branch: BRANCH, sha: await this.sha(path) } });
  }

  /** Confirms the key works (used at sign-in). */
  async check(): Promise<void> { await this.gh('content/settings/site.json'); }

  async list(type: Type): Promise<Doc[]> {
    const files = await this.gh<{ name: string; path: string }[]>(`content/${type}`);
    const md = files.filter((f) => f.name.endsWith('.md'));
    return Promise.all(md.map(async (f) => parseFrontmatter(fromB64((await this.gh<{ content: string }>(f.path)).content))));
  }

  async put(type: Type, id: string, data: Doc) {
    await this.write(`content/${type}/${id}.md`, toB64(stringifyFrontmatter(data)), `Admin: save ${type.slice(0, -1)} ${id}`);
  }

  async remove(type: Type, id: string) {
    const path = `content/${type}/${id}.md`;
    const sha = await this.sha(path);
    if (sha) await this.gh(path, { method: 'DELETE', body: { message: `Admin: delete ${type.slice(0, -1)} ${id}`, sha, branch: BRANCH } });
  }

  async getSettings(): Promise<Doc> {
    return JSON.parse(fromB64((await this.gh<{ content: string }>('content/settings/site.json')).content));
  }

  async putSettings(data: Doc) {
    await this.write('content/settings/site.json', toB64(JSON.stringify(data, null, 2) + '\n'), 'Admin: update site settings');
  }

  /** path like "images/products/<slug>/<name>.webp" under public/. */
  async putFile(path: string, base64: string) {
    await this.write(`public/${path}`, base64, `Admin: upload ${path.split('/').pop()}`);
  }
}
