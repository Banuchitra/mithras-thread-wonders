'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

/** Shows children only to signed-in staff with a changed password; otherwise explains what to do. */
export function AdminGuard({ adminOnly = false, children }: { adminOnly?: boolean; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="py-20 text-center text-muted">Loading…</p>;
  const allowed = user && (adminOnly ? user.role === 'admin' : user.role === 'admin' || user.role === 'editor');
  if (!user || user.mustChangePassword || !allowed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold text-brand-plum">Admins only</h1>
        <p className="mt-2 text-muted">{!user ? 'Please sign in with an admin account.' : user.mustChangePassword ? 'Please choose a new password first.' : 'Your account doesn’t have access to this page.'}</p>
        <Link href="/account/" className="btn btn-primary mt-6">{!user ? 'Sign in' : 'Go to my account'}</Link>
      </div>
    );
  }
  return <>{children}</>;
}
