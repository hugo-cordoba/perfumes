'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product.types';
import { formatPrice, parsePriceToNumber } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductCardData;
  /**
   * `default`: la tarjeta de siempre (carruseles, banners, lista de deseos).
   * `catalog`: la del listado con barra lateral: fondo gris con el producto
   * entero y centrado, nombre en mayusculas, marca debajo y precio en negrita.
   */
  variant?: 'default' | 'catalog';
}

/** "199,99 EUR" -> "199,99 €" (solo variante catalog; el resto sigue mostrando el texto tal cual). */
function toDisplayPrice(price: string): string {
  return formatPrice(parsePriceToNumber(price));
}

/** Bolsa con un "+" dentro: se lee como "añadir a la cesta" sin necesidad de texto. */
function BagPlusIcon() {
  return (
    <svg
      className={styles.addIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.5 8h13l-1 12h-11z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
      <path d="M12 11.5v5M9.5 14h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className={`${styles.addIcon} ${styles.checkIcon}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
    </svg>
  );
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const resetTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const isCatalog = variant === 'catalog';
  const brand = product.brandLabel || product.categoryLabel;

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setJustAdded(false), 1600);
  }

  const content = (
    <>
      <div className={styles.imageWrapper}>
        {isCatalog && imageFailed ? (
          <span className={styles.noImage}>Sin imagen</span>
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={
              isCatalog ? '(max-width: 800px) 50vw, (max-width: 1180px) 30vw, 24vw' : '(max-width: 768px) 60vw, 320px'
            }
            className={styles.image}
            onError={isCatalog ? () => setImageFailed(true) : undefined}
          />
        )}
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
      </div>
      <div className={styles.info}>
        <div className={styles.text}>
          <p className={styles.name}>{product.name}</p>
          {isCatalog && brand && <p className={styles.brand}>{brand}</p>}
        </div>
        <p className={styles.price}>
          {toDisplayPrice(product.price)}
          {isCatalog && product.compareAtPrice && (
            <s className={styles.comparePrice}>{toDisplayPrice(product.compareAtPrice)}</s>
          )}
        </p>
      </div>
    </>
  );

  return (
    <div className={styles.cardWrapper} data-variant={variant}>
      {product.href ? (
        <Link href={product.href} className={styles.card}>
          {content}
        </Link>
      ) : (
        <div className={styles.card}>{content}</div>
      )}

      {/* Fuera del <Link> a proposito: un <button> dentro de un <a> no es HTML
          valido. El ancla replica el tamaño de la imagen (aspect-ratio) para
          poder colocar el boton en su esquina inferior izquierda. Deja pasar
          los clics salvo sobre el propio boton. */}
      <div className={styles.addAnchor}>
        <button
          type="button"
          className={styles.addButton}
          data-added={justAdded}
          onClick={handleAddToCart}
          aria-label={`Añadir ${product.name} a la cesta`}
          title="Añadir a la cesta"
        >
          {justAdded ? <CheckIcon /> : <BagPlusIcon />}
        </button>
      </div>

      <span className={styles.srOnly} role="status" aria-live="polite">
        {justAdded ? `${product.name} añadido a la cesta` : ''}
      </span>
    </div>
  );
}