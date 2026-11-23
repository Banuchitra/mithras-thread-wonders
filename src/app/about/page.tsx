import type { Metadata } from 'next';
import { instagramDmUrl, whatsappUrl } from '@/domain/channels';
import { loadCatalog } from '@/lib/catalog';
import { Ornament } from '@/components/Ornament';
import { EditableImage, EditableText } from '@/components/edit/Editable';

export const metadata: Metadata = { title: 'About us' };

export default function AboutPage() {
  const { settings } = loadCatalog();
  return (
    <div className="mx-auto grid grid-cols-1 max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-[1fr_1.4fr]">
      <div className="float mx-auto w-64 rounded-full p-2 ring-1 ring-brand-gold md:w-full"><EditableImage k="about.image" src="/images/logo.webp" alt={`${settings.brandName} logo`} label="picture" className="rounded-full shadow-xl" /></div>
      <div>
        <EditableText as="p" field="tagline" label="Tagline" className="eyebrow block text-brand-gold-text">{settings.tagline}</EditableText>
        <EditableText as="h1" k="about.title" label="About — headline" className="mt-2 block text-4xl font-semibold text-brand-plum">{`About ${settings.brandName}`}</EditableText>
        <Ornament className="mt-3 md:mx-0" />
        <EditableText as="p" field="aboutText" label="About us text" multiline className="mt-4 block whitespace-pre-line text-lg leading-relaxed">{settings.aboutText}</EditableText>
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
