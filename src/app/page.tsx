import Link from 'next/link';
import { Ornament, SectionTitle } from '@/components/Ornament';
import { ProductCard } from '@/components/ProductCard';
import { ArchImage } from '@/components/ArchImage';
import { Monogram } from '@/components/Monogram';
import { productsInCollection } from '@/domain/catalog';
import { loadCatalog } from '@/lib/catalog';
import { asset } from '@/lib/paths';

export default function Home() {
  const { products, tree, categoryById, settings } = loadCatalog();
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <>
      <section className="heritage">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 text-center sm:py-20 md:grid-cols-[1.2fr_1fr] md:text-left">
          <div className="fade-up">
            <p className="eyebrow text-brand-gold-light">Handmade in India</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">Handcrafted jewellery,<br />woven with tradition</h1>
            <Ornament className="mt-5 md:mx-0" light />
            <p className="mx-auto mt-5 max-w-md text-lg text-[#F3E3C3] md:mx-0">Chains, bangles, kundan accessories and flower clips — handmade in India for weddings, festivals and every day.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/shop/" className="btn btn-gold">Explore the collection</Link>
              <Link href="/wholesale/" className="btn btn-ghost-light">Wholesale &amp; custom</Link>
            </div>
          </div>
          <div className="float mx-auto w-60 rounded-full p-2 ring-1 ring-brand-gold-light sm:w-72 md:w-80">
            <img src={asset('/images/logo.webp')} alt={`${settings.brandName} logo`} width={320} height={320} className="rounded-full shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
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
      </section>

      <section className="mt-16 bg-cream py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle title="Featured Designs" subtitle="In stock in Canada" />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
            {featured.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
          </div>
          <div className="mt-10 text-center"><Link href="/shop/" className="btn btn-outline">View all designs</Link></div>
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
