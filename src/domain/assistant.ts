// Shopping assistant — matches a customer's question to products. Pure TypeScript, runs in the browser
// (no AI key needed). A Gemini-backed answerer can replace `answer` later behind the same shape.

export interface AssistantProduct {
  slug: string;
  title: string;
  category: string;
  collection: string;
  /** Lower-case searchable text: description, colours, materials, occasions. */
  text: string;
  /** Minor units (cents); undefined = price on request. */
  price?: number;
  image?: string;
}

export type Intent = 'products' | 'custom' | 'shipping' | 'contact' | 'greeting' | 'unknown';

export interface AssistantAnswer {
  intent: Intent;
  products: AssistantProduct[];
  maxPrice?: number;
}

const SYNONYMS: Record<string, string[]> = {
  bridal: ['wedding', 'bride', 'marriage', 'reception', 'engagement'],
  bangle: ['bangles', 'bracelet', 'bracelets', 'kada', 'valayal'],
  necklace: ['necklaces', 'chain', 'chains', 'haar', 'pendant'],
  earring: ['earrings', 'jhumka', 'jhumkas', 'studs'],
  clip: ['clips', 'hairclip', 'barrette', 'hair'],
  flower: ['flowers', 'jasmine', 'mullai', 'malli', 'gajra', 'saram'],
  kids: ['kid', 'child', 'children', 'girl', 'baby'],
  temple: ['god', 'goddess', 'lakshmi', 'perumal', 'deity'],
};
const COLOURS = ['red', 'pink', 'green', 'blue', 'teal', 'purple', 'violet', 'gold', 'white', 'pearl', 'yellow', 'orange', 'black', 'silver', 'ruby', 'emerald', 'champagne', 'multicolour'];
const STOP = new Set(['a', 'an', 'the', 'i', 'me', 'my', 'want', 'need', 'looking', 'for', 'show', 'some', 'something', 'any', 'do', 'you', 'have', 'with', 'and', 'or', 'in', 'of', 'to', 'please', 'is', 'are', 'what', 'under', 'below', 'less', 'than', 'cheaper', 'max', 'upto', 'up', 'set', 'sets', 'design', 'designs']);

const canonical = (w: string) => {
  for (const [key, list] of Object.entries(SYNONYMS)) if (w === key || list.includes(w)) return key;
  return w.replace(/s$/, '');
};

export function answer(question: string, catalogue: AssistantProduct[]): AssistantAnswer {
  const q = question.toLowerCase();
  if (/\b(custom|customi[sz]e|make (this|one|it)|photo|picture|reel|sample|bulk|wholesale|quantity|my shop|boutique)\b/.test(q)) {
    return { intent: 'custom', products: [] };
  }
  if (/\b(ship|shipping|deliver|delivery|courier|postage)\b/.test(q)) return { intent: 'shipping', products: [] };
  if (/\b(contact|whatsapp|phone|call|talk|email|reach)\b/.test(q)) return { intent: 'contact', products: [] };
  if (/^\s*(hi|hello|hey|vanakkam|namaste)\b/.test(q) && q.trim().split(/\s+/).length <= 2) return { intent: 'greeting', products: [] };

  const priceMatch = q.match(/(?:under|below|less than|max|upto|up to|<)\s*(?:ca)?\$?\s*(\d+(?:\.\d+)?)/);
  const maxPrice = priceMatch ? Math.round(Number(priceMatch[1]) * 100) : undefined;

  const terms = q.replace(priceMatch?.[0] ?? '', ' ').split(/[^a-z]+/).filter((w) => w && !STOP.has(w)).map(canonical);
  if (terms.length === 0 && maxPrice === undefined) return { intent: 'unknown', products: [] };

  const scored = catalogue.map((prod) => {
    const words = (s: string) => ` ${s.toLowerCase().split(/[^a-z]+/).map(canonical).join(' ')} `;
    const named = words(`${prod.title} ${prod.category}`); // what the product *is*
    const hay = words([prod.title, prod.category, prod.collection, prod.text].join(' '));
    let score = 0;
    let colourMiss = false;
    for (const t of terms) {
      const hit = hay.includes(` ${t} `);
      if (hit) score += (COLOURS.includes(t) ? 3 : 2) + (named.includes(` ${t} `) ? 4 : 0);
      else if (COLOURS.includes(t)) colourMiss = true;
    }
    const allTypedMatch = terms.every((t) => COLOURS.includes(t) || hay.includes(` ${t} `));
    return { prod, score, colourMiss, allTypedMatch };
  });

  const products = scored
    .filter((s) => (terms.length === 0 || s.score > 0) && !s.colourMiss)
    .filter((s) => maxPrice === undefined || (s.prod.price !== undefined && s.prod.price <= maxPrice))
    // every non-colour word the customer typed must match (so "necklace" never returns bangles)
    .filter((s) => s.allTypedMatch)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.prod);

  return { intent: products.length ? 'products' : 'unknown', products, maxPrice };
}
