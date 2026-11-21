/**
 * Paginacion generica para listados de producto. Igual que en
 * product-filters.ts, el estado (numero de pagina) vive en la URL
 * (?page=N), asi que esto son funciones puras: reciben la lista ya
 * filtrada/ordenada + la pagina pedida y devuelven el slice correspondiente.
 */

export const PRODUCTS_PAGE_SIZE = 12;

type SearchParams = { [key: string]: string | string[] | undefined };

export function parsePageParam(searchParams: SearchParams): number {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export const GRID_COLUMN_OPTIONS = [2, 4, 8] as const;
export type GridColumns = (typeof GRID_COLUMN_OPTIONS)[number];
export const DEFAULT_GRID_COLUMNS: GridColumns = 4;

export function parseColumnsParam(searchParams: SearchParams): GridColumns {
  const raw = Array.isArray(searchParams.cols) ? searchParams.cols[0] : searchParams.cols;
  const parsed = Number(raw);
  return (GRID_COLUMN_OPTIONS as readonly number[]).includes(parsed)
    ? (parsed as GridColumns)
    : DEFAULT_GRID_COLUMNS;
}

/** Siempre filas completas: 4 filas de 2, 3 filas de 4, 3 filas de 8. */
export function pageSizeForColumns(columns: GridColumns): number {
  if (columns === 2) return 8;
  if (columns === 8) return 24;
  return PRODUCTS_PAGE_SIZE;
}

export interface PaginatedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function paginate<T>(items: T[], page: number, pageSize = PRODUCTS_PAGE_SIZE): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // Si piden una pagina fuera de rango (ej. volver atras tras cambiar un
  // filtro que reduce resultados), la recortamos a la ultima valida.
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems,
  };
}