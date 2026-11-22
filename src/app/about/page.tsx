import type { Metadata } from 'next';
import { instagramDmUrl, whatsappUrl } from '@/domain/channels';
import { loadCatalog } from '@/lib/catalog';
import { asset } from '@/lib/paths';
import { Ornament } from '@/components/Ornament';

export const metadata: Metadata = { title: 'About us' };

export default function AboutPage() {
  const { settings } = loadCatalog();
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_1.4fr]">
      <div className="float mx-auto w-64 rounded-full p-2 ring-1 ring-brand-gold md:w-full"><img src={asset('/images/logo.webp')} alt={`${settings.brandName} logo`} className="rounded-full shadow-xl" /></div>
      <div>
        <p className="eyebrow text-brand-gold-text">{settings.tagline}</p>
        <h1 className="mt-2 text-4xl font-semibold text-brand-plum">About {settings.brandName}</h1>
        <Ornament className="mt-3 md:mx-0" />
        <p className="mt-4 text-lg leading-relaxed">{settings.aboutText}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn btn-primary" target="_blank" rel="noopener"
            href={whatsappUrl(settings.whatsapp, 'Hi! I have a question.')}>WhatsApp {settings.whatsapp}</a>
          <a className="btn btn-magenta" target="_blank" rel="noopener"
            href={instagramDmUrl(settings.instagram)}>@{settings.instagram}</a>
        </div>
      </div>
    </div>
  );
}
