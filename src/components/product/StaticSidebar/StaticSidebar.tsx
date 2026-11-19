'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './StaticSidebar.module.css';

// useLayoutEffect en cliente (medimos antes de pintar); useEffect en servidor para evitar el aviso.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FALLBACK_TOP = 96; // px, solo hasta que se mide

interface StaticSidebarProps {
  children: ReactNode;
  /** Clase del contenedor externo: le da el `grid-area` y (opcional) el padding-top que fija la altura de la barra. */
  className?: string;
}

/**
 * Barra lateral completamente fija: queda clavada a la altura donde aparece al
 * cargar la pagina (alineada con el titulo) y no se mueve nunca, tampoco al
 * llegar al final de la pagina.
 *
 * Usa `position: fixed` y medimos donde cae de forma natural (debajo de la
 * cabecera, a la altura del titulo) para usar esa posicion como `top`. El
 * contenedor externo solo reserva la columna en la rejilla.
 */
export default function StaticSidebar({ children, className }: StaticSidebarProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(FALLBACK_TOP);

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    function measure() {
      // Posicion natural del contenido en el documento (independiente del
      // scroll actual). El contenedor externo tiene padding-top: el contenido
      // nace debajo de el, asi que hay que sumarlo.
      const paddingTop = parseFloat(getComputedStyle(outer!).paddingTop) || 0;
      const natural = Math.round(outer!.getBoundingClientRect().top + window.scrollY + paddingTop);
      setTop(Math.max(0, natural));
    }

    measure();
    window.addEventListener('resize', measure);
    // Si cambia la altura de la cabecera/titulo (fuentes, salto de linea...) hay que volver a medir.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={outerRef} className={className}>
      {/* -4px: .inner tiene 4px de padding (hueco para el outline de foco); asi el contenido queda exactamente en `natural` */}
      <div className={styles.inner} style={{ top: top - 4, maxHeight: `calc(100vh - ${top - 4}px - 1rem)` }}>
        {children}
      </div>
    </div>
  );
}
