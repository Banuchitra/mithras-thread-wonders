import { MonogramArt } from './Monogram';

// Gold divider: line · dot · monogram · dot · line. Decorative only.
export function Ornament({ className = '', light = false }: { className?: string; light?: boolean }) {
  const c = light ? '#E8C872' : '#D4A73A';
  return (
    <svg aria-hidden="true" viewBox="0 0 240 40" className={`mx-auto h-10 w-60 ${className}`}>
      <path d="M0 20h84M156 20h84" stroke={c} strokeWidth="1" />
      <circle cx="92" cy="20" r="2" fill={c} /><circle cx="148" cy="20" r="2" fill={c} />
      <svg x="100" y="0" width="40" height="40" viewBox="0 0 100 100">
        <MonogramArt variant={light ? 'light' : 'color'} detail={false} />
      </svg>
    </svg>
  );
}

export function SectionTitle({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) {
  return (
    <div className="text-center">
      <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? 'text-white' : 'text-brand-plum'}`}>{title}</h2>
      <Ornament className="mt-2" light={light} />
      {subtitle && <p className={`mt-2 ${light ? 'text-[#F3E3C3]' : 'text-muted'}`}>{subtitle}</p>}
    </div>
  );
}
