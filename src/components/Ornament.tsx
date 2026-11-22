// Gold divider: line · dot · lotus · dot · line. Decorative only.
export function Ornament({ className = '', light = false }: { className?: string; light?: boolean }) {
  const c = light ? '#E8C872' : '#D4A73A';
  return (
    <svg aria-hidden="true" viewBox="0 0 240 24" className={`mx-auto h-6 w-60 ${className}`}>
      <path d="M0 12h88M152 12h88" stroke={c} strokeWidth="1" />
      <circle cx="96" cy="12" r="2" fill={c} /><circle cx="144" cy="12" r="2" fill={c} />
      <g fill="none" stroke={c} strokeWidth="1.2">
        <path d="M120 2c5 5 5 11 0 16-5-5-5-11 0-16Z" />
        <path d="M120 18c-6-1-11-5-12-11 6 0 11 4 12 11Zm0 0c6-1 11-5 12-11-6 0-11 4-12 11Z" />
        <path d="M108 20h24" />
      </g>
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
