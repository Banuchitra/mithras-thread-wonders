// Font pairings offered in the admin panel (content/settings/site.json → fontPairing).
// Traditional style: a serif display face for headings + a plain, readable face for body text. No cursive.
import { Cormorant_Garamond, Lato, Marcellus, Mulish, Playfair_Display, Source_Sans_3 } from 'next/font/google';
import type { FontPairing } from '@/domain/types';

// next/font needs literal options in each call (no shared object/spread).
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', preload: false, weight: ['500', '600', '700'], variable: '--nf-heading' });
const lato = Lato({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '700'], variable: '--nf-body' });
const marcellus = Marcellus({ subsets: ['latin'], display: 'swap', preload: false, weight: '400', variable: '--nf-heading' });
const mulish = Mulish({ subsets: ['latin'], display: 'swap', preload: false, variable: '--nf-body' });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false, variable: '--nf-heading' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], display: 'swap', preload: false, variable: '--nf-body' });

export const FONT_PAIRINGS: Record<FontPairing, { label: string; className: string }> = {
  heritage: { label: 'Heritage — Cormorant Garamond + Lato', className: `${cormorant.variable} ${lato.variable}` },
  temple: { label: 'Temple — Marcellus + Mulish', className: `${marcellus.variable} ${mulish.variable}` },
  royal: { label: 'Royal — Playfair Display + Source Sans', className: `${playfair.variable} ${sourceSans.variable}` },
};
