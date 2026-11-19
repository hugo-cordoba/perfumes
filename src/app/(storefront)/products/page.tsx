import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllProducts, productBrands } from '@/data/products.config';
import {
  filterAndSortProducts,
  getAvailableFilterGroups,
  getPriceRange,
  parseFilterParams,
} from '@/lib/product-filters';
import { paginate, parsePageParam } from '@/lib/pagination';
import CatalogHeader from '@/components/product/CatalogHeader/CatalogHeader';
import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductCatalog from '@/components/product/ProductCatalog/ProductCatalog';
import CatalogSidebar from '@/components/product/CatalogSidebar/CatalogSidebar';

export const metadata: Metadata = {
  title: 'Todos los productos',
};

interface AllProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const [allProducts, brandRows] = await Promise.all([getAllProducts(), productBrands()]);

  // numeric: "Marca 2" va antes que "Marca 10"
  const brands = brandRows
    .map(({ slug, label }) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true }));

  const filterGroups = getAvailableFilterGroups(allProducts);
  const priceRange = getPriceRange(allProducts);

  const filters = parseFilterParams(searchParams);
  const filteredProducts = filterAndSortProducts(allProducts, filters);

  const page = parsePageParam(searchParams);
  const { items: pagedProducts, currentPage, totalPages } = paginate(filteredProducts, page);

  // El titulo es la marca seleccionada; sin marca (o con un slug que no existe), el generico.
  const selectedBrand = brands.find((brand) => brand.slug === filters.brandSlug);
  const title = selectedBrand?.label ?? 'Todos los productos';

  return (
    <>
      <Suspense fallback={null}>
        <ProductCatalog
          header={
            <CatalogHeader
              variant="catalog"
              title={title}
              resultsCount={filteredProducts.length}
              actions={<ProductFilters />}
            />
          }
          products={pagedProducts}
          resultsCount={filteredProducts.length}
          emptyMessage="No hay productos que coincidan con estos filtros."
          filterGroups={filterGroups}
          priceRange={priceRange}
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/products"
          searchParams={searchParams}
          sidebar={<CatalogSidebar brands={brands} />}
        />
      </Suspense>
    </>
  );
}