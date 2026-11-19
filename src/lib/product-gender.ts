import type { ProductGender } from '@/types/product.types';

/**
 * Constantes del filtro de genero. Viven aparte de `product-filters.ts`
 * porque ese fichero importa Prisma y este lo usa tambien un componente
 * cliente (CatalogSidebar).
 */

/** Valores de `?gender=` en la URL (minusculas). */
export type GenderFilter = 'men' | 'women';

export const GENDER_FILTER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: 'men', label: 'Hombre' },
  { value: 'women', label: 'Mujer' },
];

export const GENDER_FILTER_TO_DB: Record<GenderFilter, ProductGender> = {
  men: 'MEN',
  women: 'WOMEN',
};

/** Etiquetas para el selector del admin (incluye UNISEX, que no es un filtro propio). */
export const PRODUCT_GENDER_OPTIONS: { value: ProductGender; label: string }[] = [
  { value: 'MEN', label: 'Hombre' },
  { value: 'WOMEN', label: 'Mujer' },
  { value: 'UNISEX', label: 'Unisex' },
];
