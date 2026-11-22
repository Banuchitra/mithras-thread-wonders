import type { Metadata } from 'next';
import './globals.css';
import { FONT_PAIRINGS } from './fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { loadCatalog } from '@/lib/catalog';
import { SITE_URL } from '@/lib/paths';

const { settings } = loadCatalog();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${settings.brandName} — ${settings.tagline}`, template: `%s · ${settings.brandName}` },
  description: 'Handmade jewellery and accessories from India — chains, bangles, kundan accessories and flower clips. Ships within Canada; custom wholesale orders worldwide.',
  icons: { icon: '/images/logo.webp' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = FONT_PAIRINGS[settings.fontPairing] ?? FONT_PAIRINGS.heritage;
  return (
    <html lang="en" className={fonts.className}>
      <body className="font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
        <Header brandName={settings.brandName} tagline={settings.tagline} />
        <main id="main" className="pb-20 has-[.flush-footer]:pb-0">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
