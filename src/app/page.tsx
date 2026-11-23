import { SectionTitle } from '@/components/Ornament';
import { EditableLink, EditableText } from '@/components/edit/Editable';
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <PromoCarousel promotions={promotions} brand={{ tagline: settings.tagline, logo: '/images/logo.webp' }} />
          <VideoPanel promotions={promotions} />
        </div>
      </div>

      <section className="mx-auto max-w-[88rem] px-4 pt-16">
        <SectionTitle title={<EditableText k="home.featured.title" label="Featured section — title">Featured Designs</EditableText>} subtitle={<EditableText k="home.featured.subtitle" label="Featured section — subtitle" flag>In stock in Canada — ships within Canada</EditableText>} />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
        </div>
        <div className="mt-10 text-center"><EditableLink k="home.featured.cta" href="/shop/" className="btn btn-outline">View all designs</EditableLink></div>
      </section>

      <div className="mt-16" />
      <section className="heritage flush-footer border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <SectionTitle title={<EditableText k="home.wholesale.title" label="Wholesale band — title">Wholesale & Custom Orders</EditableText>} light />
          <EditableText as="p" k="home.wholesale.text" label="Wholesale band — text" multiline className="mt-4 block text-[#F3E3C3]">Boutiques and resellers anywhere in the world: choose any design, colour and size, and get a quote for bulk orders handmade to order in India.</EditableText>
          <EditableLink k="home.wholesale.cta" href="/wholesale/" className="btn btn-gold mt-8">Request a quote</EditableLink>
        </div>
      </section>
    </>
  );
}
