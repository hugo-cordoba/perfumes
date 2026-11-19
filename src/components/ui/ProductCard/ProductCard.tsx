'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product.types';
import { formatPrice, parsePriceToNumber } from '@/lib/currency';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/ui/WishlistButton/WishlistButton';
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

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isCatalog = variant === 'catalog';
  const brand = product.brandLabel || product.categoryLabel;

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
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
        <p className={styles.name}>{product.name}</p>
        {isCatalog && brand && <p className={styles.brand}>{brand}</p>}
        <p className={styles.price}>
          {isCatalog ? toDisplayPrice(product.price) : product.price}
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
      <WishlistButton product={product} className={styles.wishlist} />

      {/* Fuera del <Link> a propósito (mismo patrón que WishlistButton):
          un <button> dentro de un <a> no es válido en HTML. Este wrapper
          replica el aspect-ratio de la imagen y deja pasar los clics
          (pointer-events: none) salvo sobre el propio botón. */}
      <div className={styles.addToCartWrapper}>
        <button
          type="button"
          className={`${styles.addToCartButton} ${justAdded ? styles.addToCartButtonPop : ''}`}
          onClick={handleAddToCart}
          aria-label={`Añadir ${product.name} a la cesta`}
        >
          {justAdded ? (
            <span className={styles.addToCartConfirm}>
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <path
                  d="M4 10.5 8 14l8-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Añadido
            </span>
          ) : (
            'Añadir a la cesta'
          )}
        </button>
      </div>
    </div>
  );
}
