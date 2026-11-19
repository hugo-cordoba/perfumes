import type { ReactNode } from 'react';
import styles from './CatalogHeader.module.css';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  resultsCount?: number;
  actions?: ReactNode;
  /** Sin padding horizontal: para colocarla dentro de un contenedor que ya lo tiene (ej. ProductCatalog). */
  flush?: boolean;
}

export default function CatalogHeader({ title, description, resultsCount, actions, flush }: CatalogHeaderProps) {
  return (
    <div className={`${styles.header} ${flush ? styles.flush : ''}`}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {typeof resultsCount === 'number' && (
        <span className={styles.count}>
          {resultsCount} producto{resultsCount === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}
