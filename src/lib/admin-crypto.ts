// Locks the GitHub access key with the admin password (and unlocks it in the browser). WebCrypto only —
// the same code runs in the deploy workflow (Node) and in the browser. PBKDF2-SHA256 → AES-256-GCM.

export interface SealedKey { v: 1; iterations: number; salt: string; iv: string; data: string }

const enc = new TextEncoder();
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function keyFrom(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function seal(secret: string, password: string, iterations = 600_000): Promise<SealedKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(password, salt, iterations), enc.encode(secret)));
  return { v: 1, iterations, salt: b64(salt), iv: b64(iv), data: b64(data) };
}

/** Throws if the password is wrong (AES-GCM authentication fails). */
export async function unseal(box: SealedKey, password: string): Promise<string> {
  const key = await keyFrom(password, unb64(box.salt), box.iterations);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, key, unb64(box.data));
  return new TextDecoder().decode(plain);
}
