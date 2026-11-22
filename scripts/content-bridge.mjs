// Local content bridge (development only): lets the admin console save to the site's own files.
// The API (api/) checks the person's login and role, validates the data, then calls this bridge.
// Listens on 127.0.0.1 only and requires the shared secret from api/.dev.vars.
// Production replaces this with a GitHub adapter (same ContentStore port) — see ADR-006.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname, sep } from 'node:path';
import matter from 'gray-matter';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const CONTENT = join(ROOT, 'content');
const PUBLIC = join(ROOT, 'public');
const PORT = 8788;
const TYPES = ['products', 'categories', 'collections', 'promotions'];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_RE = /^images\/(products|promotions|collections)\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|jpg|png)$/;

const devVars = readFileSync(join(ROOT, 'api/.dev.vars'), 'utf8');
const SECRET = /^CONTENT_BRIDGE_SECRET=(.+)$/m.exec(devVars)?.[1]?.trim();
if (!SECRET) { console.error('CONTENT_BRIDGE_SECRET missing in api/.dev.vars'); process.exit(1); }

const inside = (base, p) => { const full = resolve(base, p); if (!full.startsWith(base + sep)) throw new Error('bad path'); return full; };
const clean = (o) => JSON.parse(JSON.stringify(o)); // drop undefined (YAML can't hold it)
const readDoc = (file) => matter(readFileSync(file, 'utf8')).data;

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  try {
    if (req.headers['x-bridge-secret'] !== SECRET) return send(res, 401, { error: 'unauthorised' });
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : undefined;
    const [, a, b, c] = new URL(req.url, 'http://x').pathname.split('/');

    if (a === 'settings') {
      const file = join(CONTENT, 'settings', 'site.json');
      if (req.method === 'GET') return send(res, 200, JSON.parse(readFileSync(file, 'utf8')));
      if (req.method === 'PUT') { writeFileSync(file, JSON.stringify(clean(body), null, 2) + '\n'); return send(res, 200, { ok: true }); }
    }
    if (a === 'files' && req.method === 'PUT') {
      if (!FILE_RE.test(body?.path ?? '')) return send(res, 400, { error: 'bad file path' });
      const full = inside(PUBLIC, body.path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, Buffer.from(body.base64, 'base64'));
      return send(res, 200, { ok: true });
    }
    if (a === 'content' && TYPES.includes(b)) {
      const dir = join(CONTENT, b);
      if (!c && req.method === 'GET') {
        return send(res, 200, { items: readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readDoc(join(dir, f))) });
      }
      if (c && ID_RE.test(c)) {
        const file = inside(dir, `${c}.md`);
        if (req.method === 'PUT') { writeFileSync(file, matter.stringify('', clean(body))); return send(res, 200, { ok: true }); }
        if (req.method === 'DELETE') { if (existsSync(file)) unlinkSync(file); return send(res, 200, { ok: true }); }
      }
    }
    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { error: String(e.message ?? e) });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Content bridge on http://127.0.0.1:${PORT} → ${CONTENT}`));
