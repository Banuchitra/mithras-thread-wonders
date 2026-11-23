// Admin assistant: turns plain instructions into site changes (always confirmed by the admin before running).
// Pure TypeScript, rule-based — no AI service.

export interface NamedProduct { slug: string; title: string }
export interface NamedCollection { id: string; name: string }

export type ProductAction = 'hide' | 'show' | 'delete' | 'feature' | 'unfeature';
export type Command =
  | { kind: 'product'; action: ProductAction; slug: string }
  | { kind: 'price'; slug: string; price: string }
  | { kind: 'announcement'; text: string }
  | { kind: 'category'; name: string; collectionId: string }
  | { kind: 'go'; href: string; label: string }
  | { kind: 'choose'; options: NamedProduct[]; then: { kind: 'product'; action: ProductAction } | { kind: 'price'; price: string } }
  | { kind: 'notfound'; query: string }
  | { kind: 'help' }
  | { kind: 'unknown' };

const IGNORE = new Set(['the', 'a', 'an', 'my', 'this', 'that', 'product', 'item', 'mithras', 'mithra', 'canada', 'with', 'and', 'of', 'for']);
const words = (s: string) => s.toLowerCase().replace(/&/g, ' ').split(/[^a-z0-9]+/).filter((w) => w && !IGNORE.has(w));
const singular = (w: string) => w.replace(/s$/, '');

/** Products whose title contains every word of the query (plural-insensitive). */
function findProducts(query: string, products: NamedProduct[]): NamedProduct[] {
  const q = words(query).map(singular);
  if (q.length === 0) return [];
  return products.filter((p) => {
    const t = words(p.title).map(singular);
    return q.every((w) => t.some((x) => x === w || (w.length >= 4 && x.startsWith(w))));
  });
}

function pick(query: string, products: NamedProduct[], then: Extract<Command, { kind: 'choose' }>['then']): Command {
  const found = findProducts(query, products);
  if (found.length === 0) return { kind: 'notfound', query: query.trim() };
  if (found.length > 1) return { kind: 'choose', options: found.slice(0, 6), then };
  return then.kind === 'product' ? { kind: 'product', action: then.action, slug: found[0].slug } : { kind: 'price', slug: found[0].slug, price: then.price };
}

const PAGES: [RegExp, string, string][] = [
  [/\b(add|new|create)\b.*\bproduct\b/, '/admin/products/edit/', 'Add a product'],
  [/\b(open|go to|show me)\b.*\bcategor/, '/admin/categories/', 'Collections & categories'],
  [/\b(open|go to|show me)\b.*\b(website|settings|offers?|banner|promotions?)\b/, '/admin/website/', 'Customise the website'],
  [/\b(open|go to|show me)\b.*\b(products|product list)\b/, '/admin/products/', 'Products'],
  [/\b(open|go to|show me)\b.*\b(dashboard|home)\b/, '/admin/', 'Dashboard'],
];

export function parseCommand(input: string, products: NamedProduct[], collections: NamedCollection[]): Command {
  const text = input.trim();
  const lower = text.toLowerCase();
  if (!text) return { kind: 'unknown' };
  if (/^(help|\?|what can you do|commands)\b/.test(lower)) return { kind: 'help' };

  const ann = /^(?:change |set |update )?(?:the )?announcement(?: bar)?(?:\s*(?::|to|=)\s*|\s+)(.+)$/i.exec(text);
  if (ann) return { kind: 'announcement', text: ann[1].trim() };

  const cat = /^(?:add|new|create)\s+(?:a\s+)?category\s+(.+?)\s+(?:to|in|under)\s+(.+)$/i.exec(text);
  if (cat) {
    const target = words(cat[2]).join(' ');
    const col = collections.find((c) => words(c.name).join(' ') === target) ?? collections.find((c) => words(c.name).some((w) => words(cat[2]).includes(w)));
    return col ? { kind: 'category', name: cat[1].trim(), collectionId: col.id } : { kind: 'notfound', query: cat[2].trim() };
  }

  const price = /^(?:set\s+|change\s+)?(?:the\s+)?price\s+(?:of\s+|for\s+)?(.+?)\s+(?:to|=|at)\s+(?:ca)?\$?(\d+(?:\.\d{1,2})?)$/i.exec(text)
    ?? /^(?:set|change)\s+(.+?)\s+price\s+(?:to\s+)?(?:ca)?\$?(\d+(?:\.\d{1,2})?)$/i.exec(text);
  if (price) return pick(price[1], products, { kind: 'price', price: price[2] });

  const act = /^(hide|show|unhide|delete|remove|unfeature|feature)\s+(.+)$/i.exec(text);
  if (act) {
    const verb = act[1].toLowerCase();
    const action: ProductAction = verb === 'unhide' ? 'show' : verb === 'remove' ? 'delete' : (verb as ProductAction);
    return pick(act[2], products, { kind: 'product', action });
  }

  for (const [re, href, label] of PAGES) if (re.test(lower)) return { kind: 'go', href, label };
  return { kind: 'unknown' };
}
