import type { Category, Collection, Product } from './types';

export interface CollectionNode extends Collection {
  categories: Category[];
}

const byOrder = <T extends { order: number; name: string }>(a: T, b: T) =>
  a.order - b.order || a.name.localeCompare(b.name);

export function buildCollectionTree(collections: Collection[], categories: Category[]): CollectionNode[] {
  return collections
    .filter((c) => !c.hidden)
    .sort(byOrder)
    .map((c) => ({
      ...c,
      categories: categories.filter((cat) => cat.collectionId === c.id && !cat.hidden).sort(byOrder),
    }));
}

export function visibleProducts(products: Product[]): Product[] {
  return products.filter((p) => p.status === 'active');
}

export function productsInCategory(products: Product[], categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function productsInCollection(products: Product[], node: CollectionNode): Product[] {
  const ids = new Set(node.categories.map((c) => c.id));
  return products.filter((p) => ids.has(p.categoryId));
}
