import type { ProductImage } from '@/domain/types';
import { asset } from '@/lib/paths';
import { ArchImage } from './ArchImage';

// Swipe on phones, thumbnails on all screens. Pure CSS scroll-snap + anchors — no JavaScript needed.
export function Gallery({ images }: { images: ProductImage[] }) {
  return (
    <div>
      <div className="gallery arch bg-white" tabIndex={0} aria-label="Product photos (swipe or use thumbnails)">
        {images.map((img, i) => (
          <div key={img.src} id={`photo-${i + 1}`} className="aspect-[4/5]">
            <ArchImage src={img.src} alt={img.alt} eager={i === 0} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex justify-center gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.src} className="shrink-0">
              <a href={`#photo-${i + 1}`} className="block overflow-hidden rounded-md border border-brand-gold hover:border-brand-violet">
                <img src={asset(img.src)} alt={`Show photo ${i + 1}`} loading="lazy" className="h-16 w-16 bg-white object-contain" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
