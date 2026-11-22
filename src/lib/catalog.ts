// Composition root: the one place that chooses which CatalogSource adapter the site uses.
import { markdownCatalog } from '@/adapters/markdown-catalog';
import { buildCollectionTree, visibleProducts } from '@/domain/catalog';

export const catalog = markdownCatalog;

export function loadCatalog() {
  const products = visibleProducts(catalog.listProducts());
  const tree = buildCollectionTree(catalog.listCollections(), catalog.listCategories());
  const categoryById = new Map(tree.flatMap((c) => c.categories.map((cat) => [cat.id, { ...cat, collection: c }] as const)));
  return { products, tree, categoryById, settings: catalog.getSettings() };
}
