// Starts everything for local work: website (3000), accounts/content API (8787), content bridge (8788).
import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';

// This computer's Wi-Fi/LAN addresses, so a phone on the same network can test the site.
const lan = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
process.env.DEV_ORIGINS = lan.join(',');
const run = (name, cmd, args, cwd = '.') => {
  const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  const tag = (d) => d.toString().split('\n').filter(Boolean).forEach((l) => console.log(`[${name}] ${l}`));
  p.stdout.on('data', tag); p.stderr.on('data', tag);
  p.on('exit', (code) => console.log(`[${name}] exited ${code}`));
  return p;
};
const procs = [
  run('bridge', 'node', ['scripts/content-bridge.mjs']),
  run('api', 'npx', ['wrangler', 'dev', '--port', '8787'], 'api'), // reached through the site's /api proxy
  run('site', 'npx', ['next', 'dev']),
];
if (lan[0]) console.log(`\nOn your phone (same Wi-Fi): http://${lan[0]}:3000\n`);
process.on('SIGINT', () => { procs.forEach((p) => p.kill('SIGINT')); process.exit(0); });
