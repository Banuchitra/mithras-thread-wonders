import type { Metadata } from 'next';
import './globals.css';
import { FONT_PAIRINGS } from './fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { ChatWidget } from '@/components/ChatWidget';
import { AuthProvider } from '@/components/AuthProvider';
import { loadCatalog } from '@/lib/catalog';
import { SITE_URL, asset } from '@/lib/paths';

const { settings, tree, products, categoryById } = loadCatalog();

// Slim catalogue for the in-browser shopping assistant.
const assistantCatalogue = products.map((p) => {
  const cat = categoryById.get(p.categoryId);
  return {
    slug: p.slug,
    title: p.title,
    category: cat?.name ?? '',
    collection: cat?.collection.name ?? '',
    text: [p.subtitle, p.description, ...p.bullets, ...Object.values(p.specs)].join(' ').toLowerCase(),
    price: p.price?.amount,
    image: p.images[0]?.src,
  };
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${settings.brandName} — ${settings.tagline}`, template: `%s · ${settings.brandName}` },
  description: 'Handmade jewellery and accessories from India — chains, bangles, kundan accessories and flower clips. Ships within Canada; custom wholesale orders worldwide.',
  icons: { icon: asset('/images/logo.webp') },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = FONT_PAIRINGS[settings.fontPairing] ?? FONT_PAIRINGS.heritage;
  return (
    <html lang="en" className={fonts.className}>
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        <AuthProvider>
          <AnnouncementBar text={settings.announcement} />
          <Header brandName={settings.brandName} tagline={settings.tagline} tree={tree} />
          <main id="main" className="pb-20 has-[.flush-footer]:pb-0">{children}</main>
          <Footer settings={settings} />
          <ChatWidget catalogue={assistantCatalogue} whatsapp={settings.whatsapp} />
        </AuthProvider>
      </body>
    </html>
  );
}
