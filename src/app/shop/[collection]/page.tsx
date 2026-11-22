import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Ornament } from '@/components/Ornament';
import { CategoryChips } from '@/components/CategoryChips';
import { CustomOrderNote } from '@/components/CustomOrderNote';
import { ProductCard } from '@/components/ProductCard';
import { productsInCollection } from '@/domain/catalog';
import { loadCatalog } from '@/lib/catalog';

type Params = { collection: string };
export const dynamicParams = false;
export const generateStaticParams = () => loadCatalog().tree.map((c) => ({ collection: c.id }));

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection } = await params;
  return { title: loadCatalog().tree.find((c) => c.id === collection)?.name };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { collection } = await params;
  const { products, tree, categoryById, settings } = loadCatalog();
  const node = tree.find((c) => c.id === collection);
  if (!node) notFound();
  const items = productsInCollection(products, node);
  return (
    <div className="mx-auto max-w-[88rem] px-4 py-10">
      <CategoryChips center label="Collections" chips={[{ href: '/shop/', label: 'All' }, ...tree.map((c) => ({ href: `/shop/${c.id}/`, label: c.name, current: c.id === node.id }))]} />
      <h1 className="mt-8 text-center text-4xl font-semibold text-brand-plum">{node.name}</h1>
      <Ornament className="mt-2" />
      {node.description && <p className="mt-1 text-center text-muted">{node.description}</p>}
      <div className="mt-6">
        <CategoryChips center label={`${node.name} categories`} chips={node.categories.map((cat) => ({ href: `/shop/${node.id}/${cat.id}/`, label: cat.name }))} />
      </div>
      {items.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {items.map((p, i) => <ProductCard key={p.sku} product={p} index={i} categoryName={categoryById.get(p.categoryId)?.name} />)}
        </div>
      ) : (
        <CustomOrderNote what={node.name} whatsapp={settings.whatsapp} />
      )}
    </div>
  );
}
