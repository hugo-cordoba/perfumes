import type { ReactNode } from 'react';
import styles from './CatalogHeader.module.css';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  resultsCount?: number;
  actions?: ReactNode;
  /**
   * `default`: cabecera de siempre (con padding lateral propio).
   * `catalog`: para colocarla dentro de ProductCatalog con barra lateral: sin
   * padding lateral (lo da el contenedor), titular grande en mayusculas y, a la
   * derecha, el numero de resultados junto a las acciones (ordenar).
   */
  variant?: 'default' | 'catalog';
}

export default function CatalogHeader({
  title,
  description,
  resultsCount,
  actions,
  variant = 'default',
}: CatalogHeaderProps) {
  const countLabel =
    typeof resultsCount === 'number' ? `${resultsCount} producto${resultsCount === 1 ? '' : 's'}` : null;

  if (variant === 'catalog') {
    return (
      <div className={styles.header} data-variant="catalog">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {(countLabel || actions) && (
            <div className={styles.toolbar}>
              {countLabel && (
                <span className={styles.toolbarCount} aria-live="polite">
                  {countLabel}
                </span>
              )}
              {actions}
            </div>
          )}
        </div>
        {description && <p className={styles.description}>{description}</p>}
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
