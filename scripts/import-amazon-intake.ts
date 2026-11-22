// One-off import: products-intake/*/source.json (verbatim Amazon text) → content/products/*.md + web images.
// Re-running overwrites generated files; wording is never changed (CLAUDE.md: product wording is the owner's).
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { moneyFromDecimal } from '../src/domain/money';
import type { Product } from '../src/domain/types';

const INTAKE = 'products-intake';
const OUT = 'content/products';
const IMG_OUT = 'public/images/products';

// From the owner's invoices: which category each design belongs to.
const CATEGORY_BY_SKU: Record<string, string> = {
  'LEAF-001A': 'necklace-earring-sets',
  'CHAKRA-001A': 'invisible-chains',
  'Lakshmi-001A': 'invisible-chains',
  'SNOWFLAKES-001A': 'necklace-earring-sets',
  'JADAU LOTUS-001': 'invisible-chains',
  'KERALA-001A': 'invisible-chains',
  'FLWR-BTRFLY-001A': 'invisible-chains',
  'PERUMAL-001A': 'necklace-earring-sets',
  'RABBIT-001A': 'korean-chains',
  'PEACOCK-001A': 'korean-chains',
  'LOTUS-SET-001A': 'necklace-earring-sets',
};

// Amazon-internal or seller-identifying fields that customers don't need (and that name the Canada reseller).
const HIDDEN_SPECS = new Set([
  'ASIN', 'Brand Name', 'Manufacturer', 'Manufacturer Contact Information', 'Part Number', 'Number of Packs',
  'Number of Items', 'Unit Count', 'Initial Character', 'Grade Rating', 'Item Type Name', 'Department',
  'Orientation', 'Setting Type', 'Model Name', 'Size',
]);

const slugify = (s: string) =>
  s.replace(/^(MITHRAS?|Mithras?) (CANADA|Canada)\s*/, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-').slice(0, 8).join('-');

const field = (details: string, label: string) => details.match(new RegExp(`^${label}: (.*)$`, 'm'))?.[1]?.trim() ?? '';

async function main() {
  const folders = readdirSync(INTAKE, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(INTAKE, d.name, 'source.json')))
    .map((d) => d.name)
    .sort();

  for (const [index, folder] of folders.entries()) {
    const src = JSON.parse(readFileSync(join(INTAKE, folder, 'source.json'), 'utf8'));
    const details = readFileSync(join(INTAKE, folder, 'details.txt'), 'utf8');
    const sku = field(details, 'SKU');
    const cad = field(details, 'Amazon price \\(CAD\\)').match(/[\d.]+/)?.[0];
    if (!sku || !cad) throw new Error(`${folder}: missing SKU or price in details.txt`);

    const fullTitle: string = src.full_title || src.title;
    const [title, subtitle] = fullTitle.split(' | ');
    const slug = slugify(src.title);

    const imgDir = join(IMG_OUT, slug);
    rmSync(imgDir, { recursive: true, force: true });
    mkdirSync(imgDir, { recursive: true });
    const sources = readdirSync(join(INTAKE, folder)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
    const images = [];
    for (const [n, file] of sources.entries()) {
      const name = `${n + 1}.webp`;
      await sharp(join(INTAKE, folder, file))
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(join(imgDir, name));
      images.push({ src: `/images/products/${slug}/${name}`, alt: n === 0 ? title : `${title} — view ${n + 1}` });
    }

    const specs = Object.fromEntries(
      Object.entries(src.specs as Record<string, string>).filter(([k]) => !HIDDEN_SPECS.has(k)),
    );

    const product: Product = {
      sku,
      slug,
      title: title.trim(),
      ...(subtitle ? { subtitle: subtitle.trim() } : {}),
      bullets: src.bullets,
      description: src.description,
      price: moneyFromDecimal(cad, 'CAD'),
      categoryId: CATEGORY_BY_SKU[sku] ?? '',
      availability: 'ships-from-canada',
      customisable: true,
      featured: index < 4,
      images,
      specs,
      listings: [{ channel: 'amazon', marketplace: 'ca', asin: src.asin }],
      status: 'active',
    };
    if (!product.categoryId) throw new Error(`${sku}: no category mapping`);

    // Content files hold the owner-friendly decimal price; the adapter converts to minor units (ADR-002).
    const { price, ...rest } = product as Product & { price: NonNullable<Product["price"]> };
    const file = { ...rest, price: (price.amount / 100).toFixed(2), currency: price.currency };
    writeFileSync(join(OUT, `${slug}.md`), matter.stringify('', file));
    console.log(`${sku.padEnd(18)} → ${slug} (${images.length} images)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
