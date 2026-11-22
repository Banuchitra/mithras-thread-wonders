import type { Metadata } from 'next';
import { Ornament } from '@/components/Ornament';
import { QuoteBuilder } from '@/components/QuoteBuilder';
import { loadCatalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Wholesale & custom orders' };

export default function WholesalePage() {
  const { tree, settings } = loadCatalog();
  const categories = tree.flatMap((c) => c.categories.map((cat) => cat.name));
  return (
    <>
      <section className="heritage">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
          <p className="eyebrow text-brand-gold-light">Made to order in India</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Wholesale &amp; Custom Orders</h1>
          <Ornament className="mt-4" light />
          <p className="mt-4 text-lg text-[#F3E3C3]">Any design, any colour, any size — handmade in India and shipped to you, wherever you are.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-[88rem] gap-10 px-4 py-10 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-5">
          {[
            ['1. Choose', 'Pick items from our collections or describe your own design. Add colours, sizes and quantities.'],
            ['2. Send', 'Your list opens in WhatsApp, ready to send. We reply with photos, pricing and delivery time.'],
            ['3. We make it', 'Every piece is handmade to order and shipped internationally.'],
          ].map(([h, t], i) => (
            <div key={h} className="fade-up rounded-lg border border-brand-gold bg-cream p-5" style={{ ['--i' as string]: i }}>
              <h2 className="text-xl font-semibold text-brand-plum">{h}</h2>
              <p className="mt-1 text-sm text-muted">{t}</p>
            </div>
          ))}
        </div>
        <QuoteBuilder whatsapp={settings.whatsapp} categories={categories} />
      </div>
    </>
  );
}
