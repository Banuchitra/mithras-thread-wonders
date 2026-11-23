import Link from 'next/link';
import { instagramDmUrl, whatsappUrl } from '@/domain/channels';
import type { SiteSettings } from '@/domain/types';
import { Ornament } from './Ornament';
import { CanadaFlag } from './CanadaFlag';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="heritage">
      <div className="gold-rule opacity-70" />
      <div className="mx-auto max-w-[88rem] px-4 pt-10 text-center">
        <p className="font-heading text-3xl font-semibold text-white">{settings.brandName}</p>
        <p className="eyebrow mt-1 text-[0.7rem] text-brand-gold-light">{settings.tagline}</p>
        <Ornament className="mt-3" light />
      </div>
      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-8 text-center text-sm text-[#F3E3C3] sm:grid-cols-3">
        <p>Handmade in India<br />Ships within Canada <CanadaFlag /><br />Wholesale worldwide</p>
        <ul className="space-y-1">
          <li><Link className="hover:text-white" href="/shop/">All designs</Link></li>
          <li><Link className="hover:text-white" href="/wholesale/">Wholesale &amp; custom orders</Link></li>
          <li><Link className="hover:text-white" href="/about/">About us</Link></li>
        </ul>
        <ul className="space-y-1">
          <li>WhatsApp <a className="underline hover:text-white" href={whatsappUrl(settings.whatsapp, 'Hi! I have a question.')} target="_blank" rel="noopener">{settings.whatsapp}</a></li>
          <li>Instagram <a className="underline hover:text-white" href={instagramDmUrl(settings.instagram)} target="_blank" rel="noopener">@{settings.instagram}</a></li>
        </ul>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-[#F3E3C3]">© {new Date().getFullYear()} {settings.brandName}</p>
    </footer>
  );
}
