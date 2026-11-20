'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { GENDER_FILTER_OPTIONS, type GenderFilter } from '@/lib/product-gender';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import styles from './CatalogSidebar.module.css';

export interface SidebarBrand {
  slug: string;
  label: string;
}

interface CatalogSidebarProps {
  brands: SidebarBrand[];
}

/** Minusculas y sin acentos, para que "Máxima" y "maxima" cuenten como lo mismo. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Barra lateral del listado: filtro por genero (grupo de botones) encima de la
 * lista de marcas, con un buscador para encontrar una marca sin recorrerla.
 * Todo el estado vive en la URL (`?gender=men,women&brand=slug`), igual que el
 * resto de filtros, asi que la pagina sigue siendo Server Component. Lo unico
 * local es el texto del buscador.
 *
 * Solo la lista de marcas hace scroll (sin barra visible): el genero y el
 * buscador se quedan siempre a la vista.
 */
export default function CatalogSidebar({ brands }: CatalogSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [edges, setEdges] = useState({ top: false, bottom: false, left: false, right: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const selectedGenders = (searchParams.get('gender') ?? '').split(',').filter(Boolean) as GenderFilter[];
  const selectedBrand = searchParams.get('brand');

  const needle = normalize(query);

  // Por relevancia: empieza por lo escrito, despues alguna palabra empieza por ello, despues lo contiene
  const visibleBrands = useMemo(() => {
    if (!needle) return brands;
    const startsWith: SidebarBrand[] = [];
    const wordStartsWith: SidebarBrand[] = [];
    const contains: SidebarBrand[] = [];
    for (const brand of brands) {
      const label = normalize(brand.label);
      if (label.startsWith(needle)) startsWith.push(brand);
      else if (label.includes(` ${needle}`)) wordStartsWith.push(brand);
      else if (label.includes(needle)) contains.push(brand);
    }
    return [...startsWith, ...wordStartsWith, ...contains];
  }, [brands, needle]);

  // Marca en la lista que hay mas contenido por encima / por debajo (para el degradado)
  const syncEdges = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const top = scroller.scrollTop > 1;
    const bottom = scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1;
    // En movil la lista corre en horizontal: mismo aviso, pero por los lados
    const left = scroller.scrollLeft > 1;
    const right = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom && prev.left === left && prev.right === right
        ? prev
        : { top, bottom, left, right },
    );
  }, []);

  // El alto de la lista cambia al filtrar, al acortarse la barra cerca del pie o al cambiar la ventana
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    syncEdges();
    const observer = new ResizeObserver(syncEdges);
    observer.observe(scroller);
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
    return () => observer.disconnect();
  }, [syncEdges, visibleBrands]);

  // Al entrar con una marca elegida, la lista arranca centrada en ella (sin mover la pagina)
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!scroller || !active) return;
    const box = scroller.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    scroller.scrollTop += item.top - box.top - (box.height - item.height) / 2;
    scroller.scrollLeft += item.left - box.left - (box.width - item.width) / 2;
  }, []);

  function navigate(params: URLSearchParams) {
    params.delete('page'); // al cambiar de filtro volvemos a la primera pagina
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  function setGenders(next: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) params.set('gender', next.join(','));
    else params.delete('gender');
    navigate(params);
  }

  function brandHref(slug: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('brand', slug);
    else params.delete('brand');
    params.delete('page');
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function clearSearch() {
    setQuery('');
    inputRef.current?.focus();
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && query) {
      event.preventDefault();
      setQuery('');
    }
  }

  let status = '';
  if (needle) {
    status =
      visibleBrands.length === 0
        ? 'Sin resultados'
        : `${visibleBrands.length} ${visibleBrands.length === 1 ? 'marca' : 'marcas'}`;
  }

  return (
    <aside className={styles.sidebar} aria-label="Filtros del catálogo">
      <div className={styles.group} role="group" aria-labelledby="gender-filter-label">
        <h2 id="gender-filter-label" className={styles.legend}>
          Género
        </h2>
        <ToggleGroup
          multiple
          variant="outline"
          spacing={0}
          className="w-full max-w-72 max-[800px]:max-w-none"
          value={selectedGenders}
          onValueChange={setGenders}
        >
          {GENDER_FILTER_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="h-10 flex-1 px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <nav className={`${styles.group} ${styles.brands}`} aria-labelledby="brand-filter-label">
        <h2 id="brand-filter-label" className={styles.legend}>
          Marcas
        </h2>

        <div className={styles.search}>
          <Search className={styles.searchIcon} size={15} strokeWidth={1.75} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={styles.searchInput}
            placeholder="Buscar marca"
            aria-label="Buscar marca"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" className={styles.searchClear} onClick={clearSearch} aria-label="Borrar búsqueda">
              <X size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>

        <p className={styles.srOnly} role="status">
          {status}
        </p>

        <div
          ref={scrollerRef}
          className={styles.scroller}
          onScroll={syncEdges}
          data-fade-top={edges.top}
          data-fade-bottom={edges.bottom}
          data-fade-left={edges.left}
          data-fade-right={edges.right}
        >
          <ul className={styles.list}>
            {/* "Todas" no es una marca: al buscar solo salen las marcas que coinciden */}
            {!needle && (
              <li>
                <Link
                  href={brandHref(null)}
                  scroll={false}
                  className={`${styles.link} ${!selectedBrand ? styles.linkActive : ''}`}
                  aria-current={!selectedBrand ? 'true' : undefined}
                >
                  Todas
                </Link>
              </li>
            )}
            {visibleBrands.map((brand) => {
              const isActive = selectedBrand === brand.slug;
              return (
                <li key={brand.slug}>
                  <Link
                    href={brandHref(brand.slug)}
                    scroll={false}
                    className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {brand.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {needle && visibleBrands.length === 0 && (
            <p className={styles.empty}>Ninguna marca coincide con “{query.trim()}”.</p>
          )}
        </div>
      </nav>
    </aside>
  );
}
