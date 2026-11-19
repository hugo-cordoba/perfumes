'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GENDER_FILTER_OPTIONS, type GenderFilter } from '@/lib/product-gender';
import styles from './CatalogSidebar.module.css';

export interface SidebarBrand {
  slug: string;
  label: string;
}

interface CatalogSidebarProps {
  brands: SidebarBrand[];
}

/**
 * Barra lateral del listado: filtro por genero (checkboxes) encima de la
 * lista de marcas. Todo el estado vive en la URL (`?gender=men,women&brand=slug`),
 * igual que el resto de filtros, asi que la pagina sigue siendo Server Component.
 */
export default function CatalogSidebar({ brands }: CatalogSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedGenders = (searchParams.get('gender') ?? '').split(',').filter(Boolean) as GenderFilter[];
  const selectedBrand = searchParams.get('brand');

  function navigate(params: URLSearchParams) {
    params.delete('page'); // al cambiar de filtro volvemos a la primera pagina
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleGender(gender: GenderFilter) {
    const next = selectedGenders.includes(gender)
      ? selectedGenders.filter((value) => value !== gender)
      : [...selectedGenders, gender];

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
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <aside className={styles.sidebar} aria-label="Filtros del catálogo">
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Género</legend>
        {GENDER_FILTER_OPTIONS.map((option) => (
          <label key={option.value} className={styles.checkboxRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={selectedGenders.includes(option.value)}
              onChange={() => toggleGender(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <nav className={styles.group} aria-label="Marcas">
        <h2 className={styles.legend}>Marcas</h2>
        <ul className={styles.list}>
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
          {brands.map((brand) => {
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
      </nav>
    </aside>
  );
}
