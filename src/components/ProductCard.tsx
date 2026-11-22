import Link from 'next/link';
import { formatMoney } from '@/domain/money';
import type { Product } from '@/domain/types';
import { asset } from '@/lib/paths';

export function ProductCard({ product, categoryName, index = 0 }: { product: Product; categoryName?: string; index?: number }) {
  const img = product.images[0];
  return (
    <Link href={`/products/${product.slug}/`} style={{ ['--i' as string]: index }} className="fade-up group block text-center">
      <div className="arch-frame transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_30px_rgb(46_18_69/0.15)]">
        <div className="arch shine relative aspect-[4/5] bg-cream">
          {img && <img src={asset(img.src)} alt={img.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
        </div>
      </div>
      <div className="px-1 pt-3">
        {categoryName && <p className="eyebrow text-[0.65rem] text-brand-gold-text">{categoryName}</p>}
        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink sm:text-lg">{product.title}</h3>
        <p className="mt-1 font-bold text-brand-violet">{formatMoney(product.price)}</p>
        <p className="mt-0.5 text-xs text-brand-teal-text">{product.availability === 'ships-from-canada' ? 'Ships within Canada' : 'Made to order'}</p>
      </div>
    </Link>
  );
}
