// Deploy step: locks ADMIN_GITHUB_TOKEN with ADMIN_PASSWORD (both GitHub Actions secrets) and writes the
// locked blob into the built site. Only the encrypted form is ever published.
import { writeFileSync } from 'node:fs';
import { seal } from '../src/lib/admin-crypto';

const out = process.argv[2] ?? 'out/admin-key.json';
const { ADMIN_PASSWORD: password, ADMIN_GITHUB_TOKEN: token } = process.env;
if (!password || !token) {
  console.log('Admin secrets not set — skipping (site works without online editing).');
  process.exit(0);
}
if (password.length < 16) {
  console.error('ADMIN_PASSWORD must be at least 16 characters.');
  process.exit(1);
}
seal(token, password).then((box) => { writeFileSync(out, JSON.stringify(box)); console.log(`Wrote ${out}`); });
