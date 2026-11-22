import type { Metadata } from 'next';
import { SectionTitle } from '@/components/Ornament';
import { CategoryChips } from '@/components/CategoryChips';
import { ProductCard } from '@/components/ProductCard';
import { loadCatalog } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Shop all designs' };

export default function ShopPage() {
  const { products, tree, categoryById } = loadCatalog();
  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10">
      <h1 className="sr-only">All designs</h1>
      <SectionTitle title="All Designs" subtitle={`${products.length} designs · prices in Canadian dollars`} />
      <div className="mt-8">
        <CategoryChips center label="Collections" chips={[{ href: '/shop/', label: 'All', current: true }, ...tree.map((c) => ({ href: `/shop/${c.id}/`, label: c.name }))]} />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {products.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
      </div>
    </div>
  );
}
