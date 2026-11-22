// Creates the two admin accounts in the LOCAL database with temporary passwords
// (they must change them at first sign-in). Run: npm run seed:local
// Deliberately not a migration, so a deployed database never starts with a known password (ADR-005).
import { execFileSync } from 'node:child_process';
import { webcrypto as crypto } from 'node:crypto';

// [email, name, temporary password]
const ADMINS = [['mithras.canada@gmail.com', 'Mithra', 'admin1234'], ['banu_c@yahoo.com', 'Banu', 'admin']];
const b64url = (b) => Buffer.from(b).toString('base64url');
async function hash(pw, iterations = 100000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return `pbkdf2-sha256$${iterations}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}
const now = new Date().toISOString();
const rows = await Promise.all(ADMINS.map(async ([email, name, password]) =>
  `INSERT INTO users (email, display_name, role, password_hash, must_change_password, created_at) VALUES ('${email}', '${name}', 'admin', '${await hash(password)}', 1, '${now}') ON CONFLICT(email) DO NOTHING;`));
execFileSync('npx', ['wrangler', 'd1', 'execute', 'mithras', '--local', '--command', rows.join(' ')], { stdio: 'inherit' });
console.log('Seeded:', ADMINS.map(([e, , pw]) => `${e} / ${pw}`).join(', '), '— temporary (must change at first sign-in)');
