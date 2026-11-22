// Starts everything for local work: website (3000), accounts/content API (8787), content bridge (8788).
import { spawn } from 'node:child_process';
const run = (name, cmd, args, cwd = '.') => {
  const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  const tag = (d) => d.toString().split('\n').filter(Boolean).forEach((l) => console.log(`[${name}] ${l}`));
  p.stdout.on('data', tag); p.stderr.on('data', tag);
  p.on('exit', (code) => console.log(`[${name}] exited ${code}`));
  return p;
};
const procs = [
  run('bridge', 'node', ['scripts/content-bridge.mjs']),
  run('api', 'npx', ['wrangler', 'dev', '--port', '8787'], 'api'),
  run('site', 'npx', ['next', 'dev']),
];
process.on('SIGINT', () => { procs.forEach((p) => p.kill('SIGINT')); process.exit(0); });
