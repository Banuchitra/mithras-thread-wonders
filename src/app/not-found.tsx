import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="eyebrow text-brand-gold-text">Page not found</p>
      <h1 className="mt-3 text-4xl font-semibold text-brand-plum">We couldn’t find that page</h1>
      <Link href="/shop/" className="btn btn-primary mt-6">Browse all designs</Link>
    </div>
  );
}
