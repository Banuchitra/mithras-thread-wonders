// One content API for the admin screens, with two back ends:
//  - "api"    → the local Worker API (development, `npm run dev:all`)
//  - "github" → straight to GitHub from the browser with the unlocked key (the live site; no server)
// The github path runs the same validation rules as the API (api/src/domain/content.ts).
import {
  ID_RE, idOf, validateCategory, validateCollection, validateProduct, validatePromotion, validateSettings, type ContentType,
} from '../../api/src/domain/content';
import { api } from './api';
import { GitHubStore } from './github-store';

type Doc = Record<string, any>;
export const ADMIN_BACKEND: 'api' | 'github' =
  (process.env.NEXT_PUBLIC_ADMIN_BACKEND as 'api' | 'github' | undefined) ?? (process.env.NODE_ENV === 'production' ? 'github' : 'api');

const TOKEN_KEY = 'mtw-admin-key';
export const getAdminKey = () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setAdminKey = (t: string | null) => { try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch { /* blocked */ } };

const gh = () => { const t = getAdminKey(); if (!t) throw new Error('Please sign in again'); return new GitHubStore(t); };
const friendly = (e: unknown) => { const m = (e as { message?: string })?.message ?? String(e); throw new Error(m); };

export const content = {
  async list(type: ContentType): Promise<Doc[]> {
    if (ADMIN_BACKEND === 'api') return (await api<{ items: Doc[] }>(`/api/content/${type}`)).items;
    return gh().list(type);
  },

  async put(type: ContentType, id: string, body: Doc): Promise<Doc> {
    if (ADMIN_BACKEND === 'api') return api<Doc>(`/api/content/${type}/${id}`, { method: 'PUT', body });
    try {
      const store = gh();
      const ids = async (t: ContentType) => (await store.list(t)).map((d) => idOf(t, d));
      const data = type === 'products' ? validateProduct(body, await ids('categories'))
        : type === 'categories' ? validateCategory(body, await ids('collections'))
        : type === 'collections' ? validateCollection(body) : validatePromotion(body);
      if (idOf(type, data) !== id) throw new Error('The ID/web address cannot be changed after creating');
      if (type === 'products' && (await store.list('products')).some((p) => p.sku === data.sku && p.slug !== data.slug)) {
        throw new Error(`SKU ${String(data.sku)} is already used by another product`);
      }
      await store.put(type, id, data);
      return data;
    } catch (e) { return friendly(e); }
  },

  async remove(type: ContentType, id: string): Promise<void> {
    if (ADMIN_BACKEND === 'api') { await api(`/api/content/${type}/${id}`, { method: 'DELETE' }); return; }
    const store = gh();
    if (type === 'categories' && (await store.list('products')).some((p) => p.categoryId === id)) throw new Error('Move or delete the products in this category first');
    if (type === 'collections' && (await store.list('categories')).some((c) => c.collectionId === id)) throw new Error('Move or delete the categories in this collection first');
    await store.remove(type, id);
  },

  async getSettings(): Promise<Doc> {
    return ADMIN_BACKEND === 'api' ? api<Doc>('/api/content/settings') : gh().getSettings();
  },

  async putSettings(body: Doc): Promise<Doc> {
    if (ADMIN_BACKEND === 'api') return api<Doc>('/api/content/settings', { method: 'PUT', body });
    try { const data = validateSettings(body); await gh().putSettings(data); return data; } catch (e) { return friendly(e); }
  },

  async upload(folder: 'products' | 'promotions' | 'collections' | 'site', slug: string, dataUrl: string): Promise<string> {
    if (ADMIN_BACKEND === 'api') return (await api<{ src: string }>('/api/uploads', { body: { folder, slug, dataUrl } })).src;
    const m = /^data:image\/(webp|jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m || !ID_RE.test(slug)) throw new Error('Only WebP, JPEG or PNG images can be uploaded');
    const name = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const path = `images/${folder}/${slug}/${name}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
    await gh().putFile(path, m[2]);
    return `/${path}`;
  },
};
