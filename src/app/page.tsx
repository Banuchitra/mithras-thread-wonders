import Link from 'next/link';
import { SectionTitle } from '@/components/Ornament';
import { ProductCard } from '@/components/ProductCard';
import { PromoCarousel } from '@/components/PromoCarousel';
import { VideoPanel } from '@/components/VideoPanel';
import { ArchImage } from '@/components/ArchImage';
import { Monogram } from '@/components/Monogram';
import { productsInCollection } from '@/domain/catalog';
import { loadCatalog } from '@/lib/catalog';

export default function Home() {
  const { products, tree, categoryById, settings, promotions } = loadCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <>
      <div className="mx-auto max-w-[88rem] px-4 pt-6 sm:pt-8">
        <h1 className="sr-only">{settings.brandName} — {settings.tagline}</h1>
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <PromoCarousel promotions={promotions} brand={{ tagline: settings.tagline, logo: '/images/logo.webp' }} />
          <VideoPanel promotions={promotions} />
        </div>
      </div>

      <section className="mx-auto max-w-[88rem] px-4 pt-16">
        <SectionTitle title="Featured Designs" subtitle="In stock in Canada" />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
        </div>
        <div className="mt-10 text-center"><Link href="/shop/" className="btn btn-outline">View all designs</Link></div>
      </section>

      <section className="mt-16 bg-cream py-16">
        <div className="mx-auto max-w-[88rem] px-4">
        <SectionTitle title="Our Collections" subtitle="All colours and sizes can be customised" />
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-5">
          {tree.map((c, i) => {
            const items = productsInCollection(products, c);
            const cover = items[0]?.images[0];
            return (
              <li key={c.id} className="fade-up" style={{ ['--i' as string]: i }}>
                <Link href={`/shop/${c.id}/`} className="group block text-center">
                  <div className="arch-frame transition duration-300 group-hover:-translate-y-1">
                    <div className="arch shine relative aspect-[4/5] bg-white">
                      {cover ? (
                        <ArchImage src={cover.src} alt="" zoom />
                      ) : (
                        <div className="heritage flex h-full items-center justify-center"><Monogram variant="light" size={96} /></div>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 font-heading text-xl font-semibold text-brand-plum">{c.name}</p>
                  <p className="text-xs text-muted">{items.length ? `${items.length} designs` : 'Made to order'}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </section>

      <section className="heritage flush-footer border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <SectionTitle title="Wholesale & Custom Orders" light />
          <p className="mt-4 text-[#F3E3C3]">Boutiques and resellers anywhere in the world: choose any design, colour and size, and get a quote for bulk orders handmade to order in India.</p>
          <Link href="/wholesale/" className="btn btn-gold mt-8">Request a quote</Link>
        </div>
      </section>
    </>
  );
}
