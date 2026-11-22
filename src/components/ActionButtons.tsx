import Link from 'next/link';
import { amazonUrl, instagramDmUrl, productOrderMessage, whatsappUrl } from '@/domain/channels';
import type { Product, SiteSettings } from '@/domain/types';
import { pageUrl } from '@/lib/paths';


export function ActionButtons({ product, settings }: { product: Product; settings: SiteSettings }) {
  const amazon = amazonUrl(product);
  const link = pageUrl(`/products/${product.slug}/`);
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <a className="btn btn-primary" target="_blank" rel="noopener"
          href={whatsappUrl(settings.whatsapp, productOrderMessage(product, link))}>
          <WhatsAppIcon /> Order on WhatsApp
        </a>
        {amazon && (
          <a className="btn btn-outline" href={amazon} target="_blank" rel="noopener">
            Buy on Amazon.ca
          </a>
        )}
        <a className="btn btn-magenta" href={instagramDmUrl(settings.instagram)} target="_blank" rel="noopener">
          Message on Instagram
        </a>
      </div>
      {product.customisable && (
        <p className="rounded-lg border border-line bg-cream px-4 py-3 text-sm">
          Want this in other colours, sizes or in bulk?{' '}
          <Link className="font-semibold text-brand-blue underline" href={`/wholesale/?sku=${encodeURIComponent(product.sku)}`}>Request a quote</Link>
        </p>
      )}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" />
    </svg>
  );
}
