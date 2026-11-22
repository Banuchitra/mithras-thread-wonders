import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionButtons } from '@/components/ActionButtons';
import { Gallery } from '@/components/Gallery';
import { SectionTitle } from '@/components/Ornament';
import { ProductCard } from '@/components/ProductCard';
import { formatMoney } from '@/domain/money';
import { loadCatalog } from '@/lib/catalog';
import { pageUrl } from '@/lib/paths';

type Params = { slug: string };
export const dynamicParams = false;
export const generateStaticParams = () => loadCatalog().products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = loadCatalog().products.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.subtitle ?? p.description.slice(0, 155),
    openGraph: { title: p.title, images: p.images.slice(0, 1).map((i) => i.src) },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { products, categoryById, settings } = loadCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const cat = categoryById.get(product.categoryId);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.sku !== product.sku).slice(0, 4);

  // schema.org Product with a CAD offer — helps search engines show price and availability.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.sku,
    image: product.images.map((i) => pageUrl(i.src)),
    description: product.description,
    brand: { '@type': 'Brand', name: settings.brandName },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.price.currency,
      price: (product.price.amount / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: pageUrl(`/products/${product.slug}/`),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {cat && (
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link className="hover:underline" href="/shop/">Shop</Link> /{' '}
          <Link className="hover:underline" href={`/shop/${cat.collection.id}/`}>{cat.collection.name}</Link> /{' '}
          <Link className="hover:underline" href={`/shop/${cat.collection.id}/${cat.id}/`}>{cat.name}</Link>
        </nav>
      )}
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="arch-frame self-start md:sticky md:top-28"><Gallery images={product.images} /></div>
        <div>
          <p className="eyebrow text-[0.7rem] text-brand-teal-text">
            {product.availability === 'ships-from-canada' ? 'In stock · Ships within Canada' : 'Made to order'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-snug text-brand-plum sm:text-4xl">{product.title}</h1>
          {product.subtitle && <p className="mt-2 text-muted">{product.subtitle}</p>}
          <p className="mt-4 text-2xl font-bold text-brand-violet">{formatMoney(product.price)}</p>
          <p className="mt-1 text-xs text-muted">SKU {product.sku}</p>
          <div className="mt-6"><ActionButtons product={product} settings={settings} /></div>

          <h2 className="mt-8 text-2xl font-semibold text-brand-plum">About this item</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
            {product.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-brand-plum">Product description</h2>
          <p className="mt-2 leading-relaxed">{product.description}</p>
        </div>
        {Object.keys(product.specs).length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-brand-plum">Details</h2>
            <dl className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line text-sm">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[2fr_3fr] gap-3 px-4 py-2 odd:bg-cream">
                  <dt className="font-medium">{k}</dt><dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionTitle title={`More ${cat?.name ?? 'designs'}`} />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.sku} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
