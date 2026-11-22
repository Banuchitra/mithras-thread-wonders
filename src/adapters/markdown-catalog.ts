// CatalogSource adapter: reads owner-edited Markdown/JSON from content/ at build time (Pages CMS writes these).
// A future Amazon SP-API adapter implements the same port; pages don't change (ADR-003).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { moneyFromDecimal } from '@/domain/money';
import type { CatalogSource, Category, Collection, Product, SiteSettings } from '@/domain/types';

// On disk (edited in Pages CMS): price: "35.00", currency: CAD. In the domain: Money in minor units.
type ProductFile = Omit<Product, 'price'> & { price: string | number; currency?: string };

function toProduct({ price, currency = 'CAD', ...rest }: ProductFile): Product {
  return { ...rest, price: moneyFromDecimal(price, currency) };
}

const CONTENT = join(process.cwd(), 'content');

function readDir<T>(dir: string): T[] {
  return readdirSync(join(CONTENT, dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => matter(readFileSync(join(CONTENT, dir, f), 'utf8')).data as T);
}

export const markdownCatalog: CatalogSource = {
  listProducts: () => readDir<ProductFile>('products').map(toProduct),
  listCollections: () => readDir<Collection>('collections'),
  listCategories: () => readDir<Category>('categories'),
  getSettings: () => JSON.parse(readFileSync(join(CONTENT, 'settings', 'site.json'), 'utf8')) as SiteSettings,
};
