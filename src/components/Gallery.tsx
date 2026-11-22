import type { ProductImage } from '@/domain/types';
import { asset } from '@/lib/paths';

// Swipe on phones, thumbnails on all screens. Pure CSS scroll-snap + anchors — no JavaScript needed.
export function Gallery({ images }: { images: ProductImage[] }) {
  return (
    <div>
      <div className="gallery arch bg-white" tabIndex={0} aria-label="Product photos (swipe or use thumbnails)">
        {images.map((img, i) => (
          <img key={img.src} id={`photo-${i + 1}`} src={asset(img.src)} alt={img.alt}
            loading={i === 0 ? 'eager' : 'lazy'} className="aspect-square w-full object-contain" />
        ))}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <a href={`#photo-${i + 1}`} className="block overflow-hidden rounded-md border border-brand-gold hover:border-brand-violet">
                <img src={asset(img.src)} alt={`Show photo ${i + 1}`} loading="lazy" className="h-16 w-16 object-cover" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
