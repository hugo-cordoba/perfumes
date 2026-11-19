import Link from 'next/link';
import type { ProductCardData } from '@/types/product.types';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductCardData[];
  emptyMessage: string;
  columns?: 4 | 7;
  /** `catalog`: rejilla del listado con barra lateral (huecos minimos, tarjetas "catalog"). */
  variant?: 'default' | 'catalog';
  /** Solo variante catalog: enlace bajo el mensaje vacio (ej. "Quitar filtros"). */
  emptyAction?: { href: string; label: string };
}

export default function ProductGrid({
  products,
  emptyMessage,
  columns = 4,
  variant = 'default',
  emptyAction,
}: ProductGridProps) {
  if (products.length === 0) {
    if (variant === 'catalog') {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Sin resultados</p>
          <p className={styles.emptyText}>{emptyMessage}</p>
          {emptyAction && (
            <Link href={emptyAction.href} className={styles.emptyAction}>
              {emptyAction.label}
            </Link>
          )}
        </div>
      );
    }
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.grid} data-columns={columns} data-variant={variant}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
