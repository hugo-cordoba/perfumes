import type { ReactNode } from 'react';
import type { ProductDetail } from '@/types/product.types';
import type { FilterGroup } from '@/lib/product-filters';
import type { GridColumns } from '@/lib/pagination';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import StaticSidebar from '@/components/product/StaticSidebar/StaticSidebar';
import Pagination from '@/components/product/Pagination/Pagination';
import styles from './ProductCatalog.module.css';

type SearchParams = { [key: string]: string | string[] | undefined };

interface ProductCatalogProps {
  products: ProductDetail[];
  resultsCount: number;
  emptyMessage: string;
  filterGroups: FilterGroup[];
  priceRange: { min: number; max: number };
  currentPage: number;
  totalPages: number;
  pathname: string;
  searchParams: SearchParams;
  /**
   * Barra lateral opcional (genero + marcas). Con ella el catalogo usa el
   * diseño "catalog": rejilla a ras del borde derecho, tarjetas "catalog" y
   * paginacion cuadrada. Sin ella se mantiene el diseño de siempre.
   */
  sidebar?: ReactNode;
  /** Cabecera (titulo + ordenar) que se alinea con la rejilla. Solo se usa junto con `sidebar`. */
  header?: ReactNode;
  perRow?: GridColumns;
}

function hasActiveFilters(searchParams: SearchParams): boolean {
  return Object.entries(searchParams).some(
    ([key, value]) =>
      key !== 'page' && key !== 'sort' && key !== 'cols' && value !== undefined && value !== ''
  );
}

export default function ProductCatalog({
  products,
  emptyMessage,
  currentPage,
  totalPages,
  pathname,
  searchParams,
  sidebar,
  header,
  perRow,
}: ProductCatalogProps) {
  const variant = sidebar ? 'catalog' : 'default';

  const results = (
    <>
      <ProductGrid
        products={products}
        emptyMessage={emptyMessage}
        variant={variant}
        perRow={perRow}
        emptyAction={
          variant === 'catalog' && hasActiveFilters(searchParams)
            ? { href: pathname, label: 'Quitar filtros' }
            : undefined
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={pathname}
        searchParams={searchParams}
        variant={variant}
      />
    </>
  );

  if (!sidebar) {
    return <div className={styles.wrapper}>{results}</div>;
  }

  return (
    <div className={`${styles.wrapper} ${styles.withSidebar}`}>
      {header && <div className={styles.header}>{header}</div>}
      <StaticSidebar className={styles.sidebar} fillHeight={products.length === 0}>
        {sidebar}
      </StaticSidebar>
      <div className={styles.content}>{results}</div>
    </div>
  );
}