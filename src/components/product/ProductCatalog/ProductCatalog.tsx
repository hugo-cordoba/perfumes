import type { ReactNode } from 'react';
import type { ProductDetail } from '@/types/product.types';
import type { FilterGroup } from '@/lib/product-filters';
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
  /** Barra lateral opcional (genero + marcas). Sin ella el catalogo ocupa todo el ancho. */
  sidebar?: ReactNode;
  /** Cabecera (titulo + ordenar) que se alinea con la rejilla. Solo se usa junto con `sidebar`. */
  header?: ReactNode;
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
}: ProductCatalogProps) {
  const results = (
    <>
      <ProductGrid products={products} emptyMessage={emptyMessage} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pathname={pathname}
        searchParams={searchParams}
      />
    </>
  );

  if (!sidebar) {
    return <div className={styles.wrapper}>{results}</div>;
  }

  return (
    <div className={`${styles.wrapper} ${styles.withSidebar}`}>
      {header && <div className={styles.header}>{header}</div>}
      <StaticSidebar className={styles.sidebar}>{sidebar}</StaticSidebar>
      <div className={styles.content}>{results}</div>
    </div>
  );
}