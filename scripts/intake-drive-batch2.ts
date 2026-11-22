// One-off intake of the owner's "Amazon listing" Drive folder (products-intake/_drive-batch2, 25 studio photos).
// - New products get DRAFT names/descriptions written from the photos, no price ("Price on request"), and
//   provisional SKUs in the owner's DESIGN-NNNV pattern. The owner reviews and edits them in the admin.
// - Studio shots of existing necklaces become their main photo.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';

const SRC = 'products-intake/_drive-batch2';
const file = (n: string) => join(SRC, readdirSync(SRC).find((f) => f.startsWith(`${n}-`))!);
const NOTE = ''; // No made-up text: the owner writes descriptions in the admin.

type New = { n: string; sku: string; slug: string; title: string; category: string; availability: 'ships-from-canada' | 'made-to-order'; description: string };
const NEW: New[] = [
  { n: '02', sku: 'BRIDAL-001A', slug: 'multicolour-kundan-bridal-bangle-set', title: 'Multicolour Kundan Bridal Bangle Set', category: 'bridal-bangles', availability: 'made-to-order', description: 'A full bridal stack of gold-toned bangles with ruby, turquoise and pearl kundan work.' },
  { n: '05', sku: 'BRIDAL-002A', slug: 'red-and-gold-bridal-silk-thread-bangle-set', title: 'Red & Gold Bridal Silk Thread Bangle Set', category: 'bridal-bangles', availability: 'ships-from-canada', description: 'A red and gold bridal stack of silk thread bangles with stone-studded gold bands.' },
  { n: '03', sku: 'BANGLE-001A', slug: 'pink-kundan-silk-thread-bangles', title: 'Pink Kundan Silk Thread Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of pink silk thread bangles with floral kundan stones and sparkling crystal centres.' },
  { n: '04', sku: 'BANGLE-002A', slug: 'blue-and-teal-kundan-bangles-with-gold-leaf', title: 'Blue & Teal Kundan Bangles with Gold Leaf', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of blue and teal kundan bangles accented with a gold leaf motif.' },
  { n: '06', sku: 'BANGLE-003A', slug: 'pink-and-gold-kundan-stone-bangles', title: 'Pink & Gold Kundan Stone Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of gold-toned bangles with pink marquise and champagne kundan stones.' },
  { n: '08', sku: 'BANGLE-004A', slug: 'royal-blue-pearl-kundan-silk-thread-bangles', title: 'Royal Blue Pearl Kundan Silk Thread Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of royal blue silk thread bangles with pearl and teal kundan stones.' },
  { n: '15', sku: 'BANGLE-005A', slug: 'red-and-pearl-kundan-bangles', title: 'Red & Pearl Kundan Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of red kundan bangles set with pearl-look stones in a lattice pattern.' },
  { n: '17', sku: 'BANGLE-006A', slug: 'emerald-green-kundan-bangles', title: 'Emerald Green Kundan Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of gold-toned bangles with emerald green kundan stones and pearl accents.' },
  { n: '19', sku: 'BANGLE-007A', slug: 'purple-kundan-silk-thread-bangles', title: 'Purple Kundan Silk Thread Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of purple silk thread bangles with violet and champagne kundan stones.' },
  { n: '20', sku: 'BANGLE-008A', slug: 'pink-floral-kundan-bangles', title: 'Pink Floral Kundan Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of gold-toned bangles with pink floral kundan stones and crystal centres.' },
  { n: '21', sku: 'BANGLE-009A', slug: 'champagne-gold-kundan-bangles', title: 'Champagne Gold Kundan Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of gold-toned bangles with champagne kundan stones and crystal accents.' },
  { n: '24', sku: 'BANGLE-010A', slug: 'lakshmi-coin-kundan-bangles', title: 'Lakshmi Coin Kundan Bangles', category: 'silk-thread-bangles', availability: 'made-to-order', description: 'A pair of temple-style bangles with gold Lakshmi coins and ruby and emerald lotus motifs.' },
  { n: '23', sku: 'CLIP-001A', slug: 'green-and-pearl-kundan-center-clip', title: 'Green & Pearl Kundan Center Clip', category: 'center-clips', availability: 'made-to-order', description: 'A kundan center clip with pearl-look stones and emerald green accents.' },
  { n: '25', sku: 'CLIP-002A', slug: 'ruby-and-pearl-kundan-center-clip', title: 'Ruby & Pearl Kundan Center Clip', category: 'center-clips', availability: 'made-to-order', description: 'A kundan center clip with pearl-look flowers and ruby red accents.' },
  { n: '22', sku: 'KEMP-001A', slug: 'kemp-half-moon-flower-pendant-hair-clip', title: 'Kemp Half-Moon Flower Pendant Hair Clip', category: 'kemp-flower-pendant-clips', availability: 'ships-from-canada', description: 'A half-moon kemp pendant with ruby and green stones and pearl drops, set on jasmine-style flowers with a center clip.' },
  { n: '12', sku: 'MULLAI-001A', slug: 'jasmine-mullai-saram-with-hair-clips', title: 'Jasmine Mullai Saram with Hair Clips', category: 'flower-strings', availability: 'ships-from-canada', description: 'Jasmine-style artificial flower strings (mullai saram) with matching hair clips.' },
  { n: '13', sku: 'MULLAI-002A', slug: 'jasmine-flower-string-mullai-saram', title: 'Jasmine Flower String (Mullai Saram)', category: 'flower-strings', availability: 'ships-from-canada', description: 'A full jasmine-style artificial flower string (mullai saram) for braids and buns.' },
  { n: '14', sku: 'FLOWER-001A', slug: 'flower-model-invisible-chain-necklace', title: 'Flower Model Invisible Chain Necklace', category: 'invisible-chains', availability: 'ships-from-canada', description: 'An invisible chain necklace with five pearl-centred flower charms on a gold-tone wire.' },
  { n: '16', sku: 'DROPS-001A', slug: 'flowers-and-drops-invisible-chain-necklace', title: 'Flowers & Drops Invisible Chain Necklace', category: 'invisible-chains', availability: 'ships-from-canada', description: 'An invisible chain necklace with crystal drops and gold beads on a gold-tone wire.' },
];

// Studio shots of products already on the site → become their first (main) photo.
const EXISTING: Record<string, string> = {
  '01': 'peacock-choker-necklace-with-pearl-drops',
  '07': 'kerala-model-pendant-with-invisible-chain',
  '09': 'jadau-lotus-pendant-invisible-chain-necklace',
  '10': 'rabbit-korean-chain-necklace',
  '11': 'flower-butterfly-invisible-chain-necklace-gold',
  '18': 'lotus-pendant-korean-chain-necklace-with-earrings',
};

const toWebp = (src: string, out: string) =>
  sharp(src).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);

async function main() {
  for (const p of NEW) {
    const dir = join('public/images/products', p.slug);
    mkdirSync(dir, { recursive: true });
    await toWebp(file(p.n), join(dir, '1.webp'));
    const data = {
      sku: p.sku, slug: p.slug, title: p.title, bullets: [], description: NOTE,
      price: '', currency: 'CAD', categoryId: p.category, availability: p.availability, customisable: true,
      featured: false, images: [{ src: `/images/products/${p.slug}/1.webp`, alt: p.title }], specs: {}, listings: [],
      status: 'active',
    };
    writeFileSync(join('content/products', `${p.slug}.md`), matter.stringify('', data));
    console.log(`new  ${p.sku.padEnd(12)} ${p.slug}`);
  }

  for (const [n, slug] of Object.entries(EXISTING)) {
    const path = join('content/products', `${slug}.md`);
    const doc = matter(readFileSync(path, 'utf8'));
    const dir = join('public/images/products', slug);
    if (existsSync(join(dir, 'studio.webp'))) continue; // already done
    await toWebp(file(n), join(dir, 'studio.webp'));
    doc.data.images = [{ src: `/images/products/${slug}/studio.webp`, alt: doc.data.title }, ...doc.data.images.map((img: { src: string; alt: string }, i: number) => ({ ...img, alt: `${doc.data.title} — view ${i + 2}` }))];
    writeFileSync(path, matter.stringify('', doc.data));
    console.log(`photo ${slug}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
