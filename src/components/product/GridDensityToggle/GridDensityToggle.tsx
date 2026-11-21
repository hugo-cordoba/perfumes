'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { DEFAULT_GRID_COLUMNS, GRID_COLUMN_OPTIONS, type GridColumns } from '@/lib/pagination';
import styles from './GridDensityToggle.module.css';

export default function GridDensityToggle({ current }: { current: GridColumns }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(columns: GridColumns): string {
    const params = new URLSearchParams(searchParams.toString());
    if (columns === DEFAULT_GRID_COLUMNS) params.delete('cols');
    else params.set('cols', String(columns));
    params.delete('page'); // cambia el tamaño de página, así que se vuelve a la primera
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className={styles.toggle} role="group" aria-label="Perfumes por fila">
      <span className={styles.label} aria-hidden="true">
        Por fila
      </span>
      <ul className={styles.list}>
        {GRID_COLUMN_OPTIONS.map((columns) => {
          const isActive = columns === current;
          return (
            <li key={columns}>
              <Link
                href={hrefFor(columns)}
                scroll={false}
                className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${columns} perfumes por fila`}
              >
                {columns}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}