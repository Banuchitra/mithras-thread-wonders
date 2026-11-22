// Brand monogram — the owner's artwork (monogram.png), cut out as a transparent mask so it can be shown in any
// colour: the logo gradient on light backgrounds, gold on dark ones. Source of truth: /monogram.png.
import { asset } from '@/lib/paths';

type Variant = 'color' | 'gold' | 'light';

const FILL: Record<Variant, string> = {
  color: 'linear-gradient(135deg, #14A08C 0%, #2D5BD3 35%, #6A2C91 65%, #D81B78 100%)',
  gold: '#D4A73A',
  light: '#E8C872',
};

export function Monogram({ size = 32, variant = 'color', className = '', title }: {
  size?: number; variant?: Variant; className?: string; title?: string;
}) {
  const mask = `url(${asset('/images/monogram-mask.png')}) center / contain no-repeat`;
  return (
    <span
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, background: FILL[variant], mask, WebkitMask: mask }}
    />
  );
}
