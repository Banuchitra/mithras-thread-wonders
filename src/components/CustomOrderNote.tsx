import Link from 'next/link';
import { whatsappUrl } from '@/domain/channels';

export function CustomOrderNote({ what, whatsapp }: { what: string; whatsapp: string }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-brand-gold bg-cream p-6 text-center sm:p-10">
      <h2 className="text-2xl font-semibold text-brand-plum">New {what.toLowerCase()} designs are coming soon</h2>
      <p className="mt-2 text-muted">We make {what.toLowerCase()} in any colour and size. Ask us for photos of current designs or a custom order.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a className="btn btn-primary" target="_blank" rel="noopener"
          href={whatsappUrl(whatsapp, `Hi! Could you share your ${what.toLowerCase()} designs?`)}>Ask on WhatsApp</a>
        <Link className="btn btn-outline" href="/wholesale/">Bulk / custom quote</Link>
      </div>
    </div>
  );
}
