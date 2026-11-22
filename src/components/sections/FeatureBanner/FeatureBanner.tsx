import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import type { FeatureBannerProps } from '@/types/section.types';
import styles from './FeatureBanner.module.css';

export default function FeatureBanner({
  title,
  description,
  ctaLabel,
  ctaHref,
  products,
  backgroundImage,
  imageAlt = '',
}: FeatureBannerProps) {
  const hasProducts = Boolean(products && products.length > 0);

  // Solo imagen: sin texto ni productos, la imagen manda el alto del banner.
  if (backgroundImage && !title && !description && !hasProducts) {
    return (
      <section className={styles.imageOnly}>
        <Image
          src={backgroundImage}
          alt={imageAlt}
          width={0}
          height={0}
          sizes="100vw"
          className={styles.imageOnlyImg}
        />
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className={styles.text}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {description && <p className={styles.description}>{description}</p>}
        {ctaLabel && ctaHref && (
          <Button href={ctaHref} variant="outline">
            {ctaLabel}
          </Button>
        )}
      </div>

      {hasProducts && (
        <div className={styles.products}>
          {products!.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}