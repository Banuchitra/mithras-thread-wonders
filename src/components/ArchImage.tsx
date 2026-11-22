import { asset } from '@/lib/paths';

// The ONLY way to show a product photo inside an arch frame (CLAUDE.md rule: never crop product photos).
// object-contain shows the whole piece; the padding keeps it below the arch curve so corners aren't clipped.
export function ArchImage({ src, alt, eager = false, zoom = false }: { src: string; alt: string; eager?: boolean; zoom?: boolean }) {
  return (
    <div className="arch-media">
      <img src={asset(src)} alt={alt} loading={eager ? 'eager' : 'lazy'}
        className={`h-full w-full object-contain ${zoom ? 'transition duration-500 group-hover:scale-105' : ''}`} />
    </div>
  );
}
