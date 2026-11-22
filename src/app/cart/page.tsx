import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionTitle } from '@/components/Ornament';

export const metadata: Metadata = { title: 'Cart' };

// Placeholder until the cart is built (Feature 8: guest cart + bulk order requests).
export default function CartPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <SectionTitle title="Your cart" subtitle="Your cart is empty." />
      <p className="mt-6 text-muted">Online cart is coming soon. Meanwhile, use <strong>Order on WhatsApp</strong> on any design, or request a custom / bulk quote.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/shop/" className="btn btn-primary">Browse designs</Link>
        <Link href="/wholesale/" className="btn btn-outline">Custom / bulk quote</Link>
      </div>
    </div>
  );
}
