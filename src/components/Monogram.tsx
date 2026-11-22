// Brand monogram redrawn from the logo: a calligraphic "M" made of thread strands, with spiral scrolls,
// a gold needle with filigree arms, threads streaming right, and pearl strings with tassel bells.
// Variants: "color" (logo gradients from MonogramDefs), "gold" / "light" (one colour for dark backgrounds).
import type { ReactNode } from 'react';

type Variant = 'color' | 'gold' | 'light';
export const MONOGRAM_VIEWBOX = '0 0 100 100';

const LEFT = [
  'M35 31C31 45 31 62 27 78C25 85 17 86 15 81C13.5 77 18 75 20 78',
  'M36 30C41 46 45 60 49 75',
  'M35 31C30 24 20 25 19 32C18 38 25 40 27 36C28.5 33 25 31 23.5 33',
  'M27 46C21 44 15 48 16 53C17 57 22 57 22 54',
];
const RIGHT = [
  'M51 75C55 60 59 46 64 30',
  'M64 30C68 46 68 62 72 78C74 85 82 86 84 81C85.5 77 81 75 79 78',
  'M64 30C69 24 79 25 80 32C81 38 74 40 72 36C70.5 33 74 31 75.5 33',
];
const THREADS = [
  'M63 44C71 37 78 50 98 41',
  'M64 48C72 42 79 54 98 46',
  'M65 52C73 47 80 58 98 51',
  'M66 56C74 52 81 62 97 56',
];
const THREAD_COLOURS = ['#14A08C', '#D81B78', '#D4A73A', '#6A2C91'];

/** Draw a path as n parallel thin strands — the "made of thread" look. */
function strands(d: string, stroke: string, key: string, width = 1.25, gap = 1.15, n = 3): ReactNode[] {
  return Array.from({ length: n }, (_, i) => {
    const o = (i - (n - 1) / 2) * gap;
    return <path key={`${key}-${i}`} d={d} stroke={stroke} strokeWidth={width} transform={`translate(${o} ${o * 0.25})`} />;
  });
}

export function MonogramArt({ variant = 'color', detail = true }: { variant?: Variant; detail?: boolean }) {
  const gold = variant === 'light' ? '#E8C872' : '#D4A73A';
  const left = variant === 'color' ? 'url(#mtw-left)' : gold;
  const right = variant === 'color' ? 'url(#mtw-right)' : gold;
  const pearl = variant === 'color' ? '#F3E3C3' : gold;
  return (
    <>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {THREADS.flatMap((d, i) => strands(d, variant === 'color' ? THREAD_COLOURS[i] : gold, `t${i}`, 1.1, 0.9, 2))}
        {LEFT.flatMap((d, i) => strands(d, left, `l${i}`))}
        {RIGHT.flatMap((d, i) => strands(d, right, `r${i}`))}
        <g stroke={gold} strokeWidth="1.3">
          <path d="M48.5 19C43 15 37 19 33 22C30 24 28 21 30.5 19.5" />
          <path d="M51.5 19C57 15 63 19 67 22C70 24 72 21 69.5 19.5" />
          <path d="M48.5 22C45 24 42 23 41 21" />
          <path d="M51.5 22C55 24 58 23 59 21" />
        </g>
        {detail && [[47, 40], [53, 60]].map(([x0, x1]) => (
          <g key={x1}>
            {[1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={x0 + ((x1 - x0) * i) / 6} cy={74 + i * 2.6} r="1.05" fill={pearl} stroke={gold} strokeWidth=".4" />
            ))}
            <path d={`M${x1 - 3.2} 93.5Q${x1} 87 ${x1 + 3.2} 93.5Z`} fill={gold} stroke="none" />
          </g>
        ))}
      </g>
      <path fillRule="evenodd" fill={gold} d="M48.7 13Q50 2 51.3 13L51.5 84L50 97L48.5 84ZM50 9c.8 0 .8 9 0 9s-.8-9 0-9Z" />
    </>
  );
}

/** Gradients used by the colour variant — rendered once in the root layout. */
export function MonogramDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="mtw-left" x1="0" y1="25" x2="0" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14A08C" /><stop offset=".5" stopColor="#2D5BD3" /><stop offset="1" stopColor="#6A2C91" />
        </linearGradient>
        <linearGradient id="mtw-right" x1="0" y1="25" x2="0" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14A08C" /><stop offset=".45" stopColor="#6A2C91" /><stop offset="1" stopColor="#D81B78" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Monogram({ size = 32, variant = 'color', className = '', title }: {
  size?: number; variant?: Variant; className?: string; title?: string;
}) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} width={size} height={size} className={className}
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <MonogramArt variant={variant} detail={size >= 40} />
    </svg>
  );
}
