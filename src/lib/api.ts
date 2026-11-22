// Browser client for the in-house API (api/). Session token kept in localStorage (per browser).
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
/** False on the public site until the API is deployed — account/admin/upload features then show a fallback. */
export const API_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_API_URL) || process.env.NODE_ENV !== 'production';
const KEY = 'mtw-session';

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t: string | null) => { try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch { /* storage blocked */ } };

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? (init.body !== undefined ? 'POST' : 'GET'),
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError('Can’t reach the account server. Is it running? (cd api && npm run dev)', 0);
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong', res.status);
  return data;
}

export interface User {
  email: string;
  displayName: string;
  role: 'admin' | 'editor' | 'customer';
  disabled: boolean;
  mustChangePassword: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
export interface Session { token: string; user: User }
