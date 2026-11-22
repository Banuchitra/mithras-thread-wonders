// Creates the two admin accounts in the LOCAL database with temporary passwords
// (they must change them at first sign-in). Run: npm run seed:local
// Deliberately not a migration, so a deployed database never starts with a known password (ADR-005).
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';

// [email, name, password, must change at first sign-in?]
// The default admin keeps a fixed password for now (Banu's request); change it before going live.
const ADMINS = [['mithras.canada@gmail.com', 'Mithra', 'admin1234', 0], ['banu_c@yahoo.com', 'Banu', 'admin', 1]];
const b64url = (b) => Buffer.from(b).toString('base64url');
async function hash(pw, iterations = 100000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return `pbkdf2-sha256$${iterations}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}
const now = new Date().toISOString();
const rows = await Promise.all(ADMINS.map(async ([email, name, password, mustChange]) =>
  `INSERT INTO users (email, display_name, role, password_hash, must_change_password, created_at) VALUES ('${email}', '${name}', 'admin', '${await hash(password)}', ${mustChange}, '${now}') ON CONFLICT(email) DO NOTHING;`));
execFileSync('npx', ['wrangler', 'd1', 'execute', 'mithras', '--local', '--command', rows.join(' ')], { stdio: 'inherit' });
console.log('Seeded:', ADMINS.map(([e, , pw, mc]) => `${e} / ${pw}${mc ? ' (must change at first sign-in)' : ''}`).join(', '));
