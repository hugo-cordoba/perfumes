import type { ReactNode } from 'react';
import styles from './CatalogHeader.module.css';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  resultsCount?: number;
  actions?: ReactNode;
  /**
   * Solo variante `catalog`: filtros que van a la IZQUIERDA de la barra bajo el
   * titulo (ej. el selector de genero). `actions` va a la derecha (ordenar...).
   */
  filters?: ReactNode;
  /**
   * `default`: cabecera de siempre (con padding lateral propio).
   * `catalog`: para colocarla dentro de ProductCatalog con barra lateral: sin
   * padding lateral (lo da el contenedor), titular pequeno en mayusculas con el
   * numero de resultados en superindice y, debajo, una barra con los filtros a
   * la izquierda y las acciones (ordenar) a la derecha.
   */
  variant?: 'default' | 'catalog';
}

export default function CatalogHeader({
  title,
  description,
  resultsCount,
  actions,
  filters,
  variant = 'default',
}: CatalogHeaderProps) {
  const countLabel =
    typeof resultsCount === 'number' ? `${resultsCount} producto${resultsCount === 1 ? '' : 's'}` : null;

  if (variant === 'catalog') {
    return (
      <div className={styles.header} data-variant="catalog">
        <h1 className={styles.title}>
          {title}
          {countLabel && (
            <>
              {/* El numero se ve en superindice; lectores de pantalla oyen "N productos". */}
              <sup className={styles.titleCount} aria-hidden="true">
                {resultsCount}
              </sup>
              <span className={styles.srOnly} aria-live="polite">
                {`, ${countLabel}`}
              </span>
            </>
          )}
        </h1>

        {description && <p className={styles.description}>{description}</p>}

        {(filters || actions) && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarStart}>{filters}</div>
            <div className={styles.toolbarEnd}>{actions}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {countLabel && <span className={styles.count}>{countLabel}</span>}
    </div>
  );
}