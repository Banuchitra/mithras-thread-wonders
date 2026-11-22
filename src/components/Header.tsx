import Link from 'next/link';
import type { CollectionNode } from '@/domain/catalog';
import { asset } from '@/lib/paths';
import { AccountMenu } from './AccountMenu';
import { SideMenu } from './SideMenu';

// Standard shop header: logo left; Shop menu built from the owner's collections/categories (grows automatically
// as she adds them); account and cart icons top right. Desktop: hover/focus mega menu. Phone: menu drawer.
export function Header({ brandName, tagline, tree }: { brandName: string; tagline: string; tree: CollectionNode[] }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-[88rem] items-center gap-3 px-4 py-2.5">
        <SideMenu tree={tree} brandName={brandName} />
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img src={asset('/images/logo.webp')} alt="" width={52} height={52}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-brand-gold ring-offset-2 sm:h-13 sm:w-13" />
          <span className="min-w-0">
            <span className="block truncate font-heading text-lg font-semibold leading-tight text-brand-plum sm:text-2xl">{brandName}</span>
            <span className="eyebrow hidden text-[0.65rem] text-brand-gold-text sm:block">{tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="eyebrow ml-8 hidden items-center gap-7 text-xs text-ink lg:flex">
          <div className="group/menu">
            <Link href="/shop/" className="flex items-center gap-1 py-4 hover:text-brand-violet" aria-haspopup="true">
              Shop <span aria-hidden="true">▾</span>
            </Link>
            <div className="invisible absolute inset-x-0 top-full border-t border-line bg-white opacity-0 shadow-[0_18px_30px_rgb(55_10_94/0.12)] transition group-hover/menu:visible group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:opacity-100">
              <div className="mx-auto grid max-w-[88rem] gap-8 px-8 py-8 normal-case tracking-normal" style={{ gridTemplateColumns: `repeat(${Math.min(tree.length + 1, 6)}, minmax(0, 1fr))` }}>
                {tree.map((c) => (
                  <div key={c.id}>
                    <Link href={`/shop/${c.id}/`} className="font-heading text-lg font-semibold text-brand-plum hover:text-brand-violet">{c.name}</Link>
                    <ul className="mt-2 space-y-1.5 text-sm font-normal text-muted">
                      {c.categories.map((cat) => (
                        <li key={cat.id}><Link href={`/shop/${c.id}/${cat.id}/`} className="hover:text-brand-violet">{cat.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="rounded-lg bg-cream p-4">
                  <p className="font-heading text-lg font-semibold text-brand-plum">Custom orders</p>
                  <p className="mt-1 text-sm font-normal text-muted">Any design, colour and size — send us a photo.</p>
                  <Link href="/wholesale/" className="mt-3 inline-block text-sm font-semibold text-brand-violet underline">Request a quote</Link>
                </div>
              </div>
            </div>
          </div>
          <Link href="/shop/" className="hover:text-brand-violet">All designs</Link>
          <Link href="/wholesale/" className="hover:text-brand-violet">Wholesale</Link>
          <Link href="/about/" className="hover:text-brand-violet">About</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <AccountMenu />
          <IconLink href="/cart/" label="Cart"><path d="M2.5 3.5h2.3l2.6 11a1.6 1.6 0 0 0 1.6 1.2h8.4a1.6 1.6 0 0 0 1.5-1.1l2-6.6H6" /><circle cx="9.6" cy="19.6" r="1.5" /><circle cx="17.2" cy="19.6" r="1.5" /></IconLink>
        </div>
      </div>
      <div className="gold-rule" />
    </header>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-brand-plum transition hover:bg-cream hover:text-brand-violet">
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </Link>
  );
}
