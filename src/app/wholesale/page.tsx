import type { Metadata } from 'next';
import { Ornament } from '@/components/Ornament';
import { QuoteBuilder } from '@/components/QuoteBuilder';
import { loadCatalog } from '@/lib/catalog';
import { EditableText } from '@/components/edit/Editable';

export const metadata: Metadata = { title: 'Wholesale & custom orders' };

export default function WholesalePage() {
  const { tree, settings } = loadCatalog();
  const categories = tree.flatMap((c) => c.categories.map((cat) => cat.name));
  return (
    <>
      <section className="heritage">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
          <EditableText as="p" k="wholesale.eyebrow" label="Wholesale — small heading" className="eyebrow block text-brand-gold-light">Made to order in India</EditableText>
          <EditableText as="h1" k="wholesale.title" label="Wholesale — headline" className="mt-3 block text-4xl font-semibold sm:text-5xl">Wholesale & Custom Orders</EditableText>
          <Ornament className="mt-4" light />
          <EditableText as="p" k="wholesale.text" label="Wholesale — text" multiline className="mt-4 block text-lg text-[#F3E3C3]">Any design, any colour, any size — handmade in India and shipped to you, wherever you are.</EditableText>
        </div>
      </section>
      <div className="mx-auto grid grid-cols-1 max-w-[88rem] gap-10 px-4 py-10 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-5">
          {[
            ['1. Choose', 'Pick items from our collections or describe your own design. Add colours, sizes and quantities.'],
            ['2. Send', 'Attach reference photos or reels and send your request. We reply with photos, pricing and delivery time.'],
            ['3. We make it', 'Every piece is handmade to order and shipped internationally.'],
          ].map(([h, t], i) => (
            <div key={h} className="fade-up rounded-lg border border-brand-gold bg-cream p-5" style={{ ['--i' as string]: i }}>
              <EditableText as="h2" k={`wholesale.step${i + 1}.title`} label={`Step ${i + 1} — title`} className="block text-xl font-semibold text-brand-plum">{h}</EditableText>
              <EditableText as="p" k={`wholesale.step${i + 1}.text`} label={`Step ${i + 1} — text`} multiline className="mt-1 block text-sm text-muted">{t}</EditableText>
            </div>
          ))}
        </div>
        <QuoteBuilder whatsapp={settings.whatsapp} categories={categories} />
      </div>
    </>
  );
}
