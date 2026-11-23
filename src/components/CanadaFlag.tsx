// Small Canadian flag shown next to "Ships within Canada" (SVG, so it looks the same on every device —
// the 🇨🇦 emoji shows as "CA" on Windows).
export function CanadaFlag({ className = 'h-[0.85em] w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" className={`${className} inline-block shrink-0 rounded-[2px] align-[-0.1em] ring-1 ring-black/10`} role="img" aria-label="Canada">
      <rect width="48" height="24" fill="#fff" />
      <rect width="12" height="24" fill="#D80621" />
      <rect x="36" width="12" height="24" fill="#D80621" />
      <path fill="#D80621" d="M24 3.2l-1.6 3c-.2.3-.5.3-.8.1l-1.2-.6.9 4.6c.2.8-.4.8-.7.5l-1.9-2.1-.3 1.1c0 .1-.2.3-.4.2l-2.2-.5.6 2.1c.1.4.3.6-.1.8l-.8.4 3.9 3.2c.2.1.2.4.1.6l-.3 1.1 3.8-.5c.1 0 .3.1.3.3l-.2 4.2h1.6l-.2-4.2c0-.2.2-.3.3-.3l3.8.5-.3-1.1c-.1-.2 0-.5.1-.6l3.9-3.2-.8-.4c-.4-.2-.2-.4-.1-.8l.6-2.1-2.2.5c-.2.1-.4-.1-.4-.2l-.3-1.1-1.9 2.1c-.3.3-.9.3-.7-.5l.9-4.6-1.2.6c-.3.2-.6.2-.8-.1Z" />
    </svg>
  );
}

/** Renders text, putting the flag after every "Ships within Canada". */
export function WithCanadaFlag({ text }: { text: string }) {
  const parts = text.split(/(Ships within Canada)/i);
  return <>{parts.map((p, i) => (/^ships within canada$/i.test(p) ? <span key={i} className="whitespace-nowrap">{p} <CanadaFlag /></span> : p))}</>;
}
