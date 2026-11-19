'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './StaticSidebar.module.css';

// useLayoutEffect en cliente (medimos antes de pintar); useEffect en servidor para evitar el aviso.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FALLBACK_TOP = 96; // px, solo hasta que se mide

interface StaticSidebarProps {
  children: ReactNode;
  /** Clase del contenedor externo (le da el `grid-area` y debe dejarlo estirarse a todo el alto de la fila). */
  className?: string;
}

/**
 * Barra lateral completamente fija: queda clavada donde aparece al cargar la
 * pagina y no se mueve al hacer scroll.
 *
 * Con `position: sticky` y un `top` fijo a ojo, la barra se desplaza un poco
 * hasta alcanzar ese `top`. Aqui medimos donde cae de forma natural (debajo de
 * la cabecera y del titulo) y usamos exactamente esa posicion como `top`,
 * asi que nunca llega a moverse. El contenedor externo ocupa toda la fila de
 * la rejilla para que el sticky tenga recorrido.
 */
export default function StaticSidebar({ children, className }: StaticSidebarProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(FALLBACK_TOP);

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    function measure() {
      // Posicion natural en el documento (independiente del scroll actual).
      const natural = Math.round(outer!.getBoundingClientRect().top + window.scrollY);
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
      {/* -4px: compensa el margin negativo de .inner, para que no haya ni un pixel de desplazamiento */}
      <div className={styles.inner} style={{ top: top - 4, maxHeight: `calc(100vh - ${top - 4}px - 1rem)` }}>
        {children}
      </div>
    </div>
  );
}
