import Link from 'next/link';

export interface Chip { href: string; label: string; current?: boolean }

export function CategoryChips({ chips, label, center = false }: { chips: Chip[]; label: string; center?: boolean }) {
  return (
    <nav aria-label={label} className={`flex flex-wrap gap-2 ${center ? 'justify-center' : ''}`}>
      {chips.map((c) => (
        <Link key={c.href} href={c.href} className="chip text-sm" aria-current={c.current ? 'page' : undefined}>{c.label}</Link>
      ))}
    </nav>
  );
}
