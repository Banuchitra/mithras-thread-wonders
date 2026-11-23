import { Monogram } from './Monogram';

// Gold divider: line · dot · monogram · dot · line. Decorative only.
export function Ornament({ className = '', light = false }: { className?: string; light?: boolean }) {
  const line = light ? 'bg-brand-gold-light' : 'bg-brand-gold';
  return (
    <div aria-hidden="true" className={`mx-auto flex w-64 items-center gap-2 ${className}`}>
      <span className={`h-px flex-1 ${line}`} /><span className={`h-1 w-1 rounded-full ${line}`} />
      <Monogram size={38} variant={light ? 'light' : 'color'} />
      <span className={`h-1 w-1 rounded-full ${line}`} /><span className={`h-px flex-1 ${line}`} />
    </div>
  );
}

export function SectionTitle({ title, subtitle, light = false }: { title: React.ReactNode; subtitle?: React.ReactNode; light?: boolean }) {
  return (
    <div className="text-center">
      <h2 className={`text-3xl font-semibold sm:text-4xl ${light ? 'text-white' : 'text-brand-plum'}`}>{title}</h2>
      <Ornament className="mt-2" light={light} />
      {subtitle && <p className={`mt-2 ${light ? 'text-[#F3E3C3]' : 'text-muted'}`}>{subtitle}</p>}
    </div>
  );
}
