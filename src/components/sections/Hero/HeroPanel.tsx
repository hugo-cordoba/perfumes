'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { HeroPanel as HeroPanelData } from '@/types/section.types';
import styles from './HeroPanel.module.css';

interface HeroPanelProps extends HeroPanelData {
  /** Fondo estatico (sin frascos). Todas las capas cubren la imagen completa. */
  image: string;
  aspectRatio: number;
  /** Posicion del panel dentro del hero; escalona las animaciones. */
  index: number;
}

/** Recorrido total (px) del movimiento del frasco con el puntero. */
const PARALLAX_RANGE = 8;

export default function HeroPanel({
  image,
  aspectRatio,
  index,
  eyebrow,
  title,
  ctaLabel,
  href,
  center = 50,
  centerMobile = 66,
  bottles = [],
  focusX,
}: HeroPanelProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  // Punto de la imagen que se centra en el panel: por defecto, el centro del grupo.
  const focus =
    focusX ?? (bottles.length > 0 ? bottles.reduce((sum, b) => sum + b.baseX, 0) / bottles.length : 50);

  // Escribimos variables CSS directamente en el nodo: asi el movimiento
  // no provoca re-renders de React en cada evento del puntero.
  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--px', `${(x * PARALLAX_RANGE).toFixed(2)}px`);
    el.style.setProperty('--py', `${(y * PARALLAX_RANGE).toFixed(2)}px`);
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--px', '0px');
    el.style.setProperty('--py', '0px');
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={styles.panel}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          '--delay': `${index * 0.18}s`,
          // Posicion (0-1) donde queremos el foco dentro del panel...
          '--m-desktop': center / 100,
          '--m-mobile': centerMobile / 100,
          // ...y donde esta ese foco dentro de la imagen (0-1).
          '--c': focus / 100,
          '--aspect': aspectRatio,
        } as React.CSSProperties
      }
    >
      {/* Frame con las proporciones de la imagen: el fondo y los frascos comparten
          el mismo encuadre, asi que siempre coinciden al recortar el panel. */}
      <span className={styles.frame} aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="(max-width: 720px) 200vw, 100vw"
          className={styles.layer}
        />

        {bottles.map((bottle, i) => (
          <span
            key={bottle.src}
            className={styles.bottleItem}
            style={
              {
                '--bx': bottle.baseX,
                '--by': bottle.baseY,
                '--bw': bottle.width,
                // Entrada escalonada y flotacion desfasada: cada frasco a su ritmo.
                '--stagger': `${i * 0.12}s`,
                '--phase': `${(index * bottles.length + i) * -1.9}s`,
              } as React.CSSProperties
            }
          >
            <span className={styles.shadow} />
            <span className={styles.bottle}>
              <span className={styles.bottleFloat}>
                <Image
                  src={bottle.src}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 720px) 200vw, 100vw"
                  className={styles.layer}
                />
              </span>
            </span>
          </span>
        ))}
      </span>

      <span className={styles.scrim} aria-hidden="true" />

      <span className={styles.caption}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <span className={styles.title}>{title}</span>
        <span className={styles.cta}>
          <span className={styles.ctaLabel}>{ctaLabel}</span>
          <ArrowRight className={styles.arrow} size={16} strokeWidth={1.5} aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
