import Link from 'next/link';
import { asset } from '@/lib/paths';

export function Header({ brandName, tagline }: { brandName: string; tagline: string }) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <img src={asset('/images/logo.webp')} alt="" width={52} height={52}
            className="h-13 w-13 shrink-0 rounded-full object-cover ring-1 ring-brand-gold ring-offset-2" />
          <span className="min-w-0">
            <span className="block font-heading text-xl font-semibold leading-tight text-brand-plum sm:text-2xl">{brandName}</span>
            <span className="eyebrow hidden text-[0.65rem] text-brand-gold-text sm:block">{tagline}</span>
          </span>
        </Link>
        <nav aria-label="Main" className="eyebrow flex w-full justify-center gap-6 border-t border-line pt-1.5 text-[0.72rem] text-ink sm:ml-auto sm:w-auto sm:gap-8 sm:border-0 sm:pt-0 sm:text-xs">
          <Link href="/shop/" className="hover:text-brand-violet">Shop</Link>
          <Link href="/wholesale/" className="hover:text-brand-violet">Wholesale</Link>
          <Link href="/about/" className="hover:text-brand-violet">About</Link>
        </nav>
      </div>
      <div className="gold-rule" />
    </header>
  );
}
