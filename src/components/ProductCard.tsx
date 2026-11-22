import Link from 'next/link';
import { displayPrice } from '@/domain/money';
import type { Product } from '@/domain/types';
import { ArchImage } from './ArchImage';

export function ProductCard({ product, categoryName, index = 0 }: { product: Product; categoryName?: string; index?: number }) {
  const img = product.images[0];
  return (
    <Link href={`/products/${product.slug}/`} style={{ ['--i' as string]: index }} className="fade-up group block text-center">
      <div className="arch-frame transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_30px_rgb(55_10_94/0.15)]">
        <div className="arch shine relative aspect-[4/5] bg-white">
          {img && <ArchImage src={img.src} alt={img.alt} zoom />}
        </div>
      </div>
      <div className="px-1 pt-3">
        {categoryName && <p className="eyebrow text-[0.65rem] text-brand-gold-text">{categoryName}</p>}
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink sm:text-lg">{product.title}</h3>
        <p className="mt-1 font-bold text-brand-violet">{displayPrice(product)}</p>
        <p className="mt-0.5 text-xs text-brand-teal-text">{product.availability === 'ships-from-canada' ? 'Ships within Canada' : 'Made to order'}</p>
      </div>
    </Link>
  );
}
