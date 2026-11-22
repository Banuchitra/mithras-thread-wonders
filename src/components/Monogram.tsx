// Brand monogram from the logo: a calligraphic "M" with a gold needle through it and threads flowing to the right.
// variant "color" uses the logo's thread gradient (defined once in MonogramDefs); "gold" is one colour for dark
// backgrounds and small sizes.
export const MONOGRAM_VIEWBOX = '0 0 64 64';

export function MonogramArt({ variant = 'color' }: { variant?: 'color' | 'gold' | 'light' }) {
  const gold = variant === 'light' ? '#E8C872' : '#D4A73A';
  const letter = variant === 'color' ? 'url(#mtw-thread)' : gold;
  const threads = variant === 'color' ? ['#D81B78', '#D4A73A', '#14A08C'] : [gold, gold, gold];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* threads streaming out to the right */}
      <g strokeWidth="1.7" opacity={variant === 'color' ? 1 : 0.9}>
        <path d="M44 25c5-4 9 3 18-2" stroke={threads[0]} />
        <path d="M45 29.5c5-3.5 9 3.5 18-1" stroke={threads[1]} />
        <path d="M46 34c5-3 9 4 17 0" stroke={threads[2]} />
      </g>
      {/* the M: two legs with curled serifs and a V meeting at the needle */}
      <g stroke={letter} strokeWidth="4.2">
        <path d="M15 50c0-12 1-25 4-36L32 41l13-27c3 11 4 24 4 36" />
        <path d="M19 14c-2-5-8-5-9-1-1 3 2 5 4 4" strokeWidth="2.6" />
        <path d="M45 14c2-5 8-5 9-1 1 3-2 5-4 4" strokeWidth="2.6" />
        <path d="M15 50c-2 3-7 2-6-2" strokeWidth="2.6" />
        <path d="M49 50c2 3 7 2 6-2" strokeWidth="2.6" />
      </g>
      {/* gold needle with its eye at the top */}
      <path fillRule="evenodd" fill={gold} stroke="none"
        d="M30.6 5q1.4-3 2.8 0V50L32 61l-1.4-11Zm1.4 2c.9 0 .9 6 0 6s-.9-6 0-6Z" />
    </g>
  );
}

/** Gradient used by the colour variant — rendered once in the root layout. */
export function MonogramDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="mtw-thread" x1="8" y1="10" x2="56" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2D5BD3" />
          <stop offset=".35" stopColor="#14A08C" />
          <stop offset=".55" stopColor="#6A2C91" />
          <stop offset="1" stopColor="#D81B78" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Monogram({ size = 32, variant = 'color', className = '', title }: {
  size?: number; variant?: 'color' | 'gold' | 'light'; className?: string; title?: string;
}) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} width={size} height={size} className={className}
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <MonogramArt variant={variant} />
    </svg>
  );
}
