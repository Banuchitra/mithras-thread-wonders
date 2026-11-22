import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionTitle } from '@/components/Ornament';

export const metadata: Metadata = { title: 'Sign in' };

// Placeholder until login goes live (Feature 3: email + password and Google sign-in).
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <SectionTitle title="Sign in" subtitle="Customer and admin accounts are being set up." />
      <p className="mt-6 text-muted">You don’t need an account to order — browse the designs and order on WhatsApp.</p>
      <Link href="/shop/" className="btn btn-primary mt-6">Browse designs</Link>
    </div>
  );
}
