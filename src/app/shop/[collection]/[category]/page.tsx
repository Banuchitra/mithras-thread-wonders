import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Ornament } from '@/components/Ornament';
import { CategoryChips } from '@/components/CategoryChips';
import { CustomOrderNote } from '@/components/CustomOrderNote';
import { ProductCard } from '@/components/ProductCard';
import { productsInCategory } from '@/domain/catalog';
import { loadCatalog } from '@/lib/catalog';

type Params = { collection: string; category: string };
export const generateStaticParams = () =>
  loadCatalog().tree.flatMap((c) => c.categories.map((cat) => ({ collection: c.id, category: cat.id })));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  return { title: loadCatalog().categoryById.get(category)?.name };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { collection, category } = await params;
  const { products, tree, settings } = loadCatalog();
  const node = tree.find((c) => c.id === collection);
  const cat = node?.categories.find((c) => c.id === category);
  if (!node || !cat) notFound();
  const items = productsInCategory(products, cat.id);
  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10">
      <p className="text-sm text-muted"><a className="hover:underline" href="../">{node.name}</a> /</p>
      <h1 className="mt-1 text-4xl font-semibold text-brand-plum">{cat.name}</h1>
      <div className="mt-5">
        <CategoryChips label={`${node.name} categories`} chips={node.categories.map((c) => ({ href: `/shop/${node.id}/${c.id}/`, label: c.name, current: c.id === cat.id }))} />
      </div>
      {items.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {items.map((p, i) => <ProductCard key={p.sku} product={p} index={i} />)}
        </div>
      ) : (
        <CustomOrderNote what={cat.name} whatsapp={settings.whatsapp} />
      )}
    </div>
  );
}
