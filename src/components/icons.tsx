// Small line icons for the admin console (24×24, stroke = currentColor).
const P: Record<string, string> = {
  dashboard: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  requests: 'M4 5h16v11H8l-4 4V5Z M8 9h8 M8 12h5',
  products: 'M6 8h12l-1 12H7L6 8Z M9 8a3 3 0 0 1 6 0',
  add: 'M12 5v14 M5 12h14',
  categories: 'M4 6h16 M4 12h10 M4 18h6 M17 15l3 3-3 3',
  website: 'M4 5h16v14H4z M4 9h16 M8 13h5 M8 16h8',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5 M16 4.5a3.3 3.3 0 0 1 0 6.4 M18 14.8c2 .7 3 2.4 3 4.7',
  view: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  eyeoff: 'M3 3l18 18 M10.6 6.2A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.3 3.9 M6.6 7.6C3.9 9.3 2 12 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4-.9',
  alert: 'M12 4l9 16H3L12 4Z M12 10v4 M12 17v.5',
  megaphone: 'M3 10v4h4l7 4V6L7 10H3Z M17 9a4 4 0 0 1 0 6',
};
export function Icon({ name, className = 'h-5 w-5' }: { name: keyof typeof P | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 fill-none stroke-current`} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] ?? P.dashboard} />
    </svg>
  );
}
