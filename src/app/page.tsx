import Link from 'next/link';
import { SectionTitle } from '@/components/Ornament';
import { CanadaFlag } from '@/components/CanadaFlag';
import { ProductCard } from '@/components/ProductCard';
import { PromoCarousel } from '@/components/PromoCarousel';
import { VideoPanel } from '@/components/VideoPanel';
import { loadCatalog } from '@/lib/catalog';

export default function Home() {
  const { products, categoryById, settings, promotions } = loadCatalog();
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
        <SectionTitle title="Featured Designs" subtitle={<>In stock in Canada <CanadaFlag /></>} />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
        </div>
        <div className="mt-10 text-center"><Link href="/shop/" className="btn btn-outline">View all designs</Link></div>
      </section>

      <div className="mt-16" />
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
