'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './StaticSidebar.module.css';

interface StaticSidebarProps {
  children: ReactNode;
  className?: string;
  /**
   * Catalogo vacio: en vez de acabar donde acaba la rejilla (casi sin alto), la
   * barra se despliega hacia abajo hasta el principio del pie de pagina.
   */
  fillHeight?: boolean;
}

/**
 * Columna lateral del listado. La barra va fija respecto a la ventana (ver el
 * CSS) y este componente solo le cuenta cuanto se ha metido el final del
 * catalogo en pantalla: cuando el pie de pagina empieza a subir, la barra
 * recorta su alto para terminar donde termina la rejilla, en vez de seguir por
 * debajo y quedar tapada por el pie.
 */
export default function StaticSidebar({ children, className, fillHeight = false }: StaticSidebarProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = columnRef.current;
    const rail = railRef.current;
    if (!column || !rail) return;

    // Limite inferior de la barra: el final de la rejilla o, si se despliega, el final
    // de <main> (justo donde empieza el pie de pagina)
    const limit = (fillHeight && column.closest('main')) || column;

    let applied = -1;

    // Px que ocupa, por la parte baja de la ventana, lo que viene despues del limite.
    // Solo se escribe la variable cuando cambia, asi un scroll normal no toca estilos.
    const update = () => {
      const overlap = Math.max(0, Math.round(window.innerHeight - limit.getBoundingClientRect().bottom));
      if (overlap === applied) return;
      applied = overlap;
      rail.style.setProperty('--catalog-rail-overlap', `${overlap}px`);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // El alto del catalogo cambia al filtrar, paginar o cargar imagenes
    const observer = new ResizeObserver(update);
    observer.observe(column);
    if (limit !== column) observer.observe(limit);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [fillHeight]);

  return (
    <div ref={columnRef} className={className}>
      <div ref={railRef} className={styles.inner} data-fill={fillHeight}>
        {children}
      </div>
    </div>
  );
}
