import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import { siteConfig } from '@/config/site.config';
import type { HeroProps } from '@/types/section.types';
import HeroPanel from './HeroPanel';
import styles from './Hero.module.css';

export default function Hero({ eyebrow, title, subtitle, media, ctaLabel, ctaHref, navLinks, panels }: HeroProps) {
  // Variante dividida: un panel enlazado por cada propuesta (p. ej. "Para el" / "Para ella").
  if (panels && panels.length > 0 && media.type === 'image') {
    return (
      <section className={styles.split}>
        {/* El titulo se mantiene en el DOM para SEO y lectores de pantalla. */}
        <h1 className={styles.srOnly}>{title}</h1>

        {panels.map((panel, index) => (
          <HeroPanel
            key={panel.id}
            {...panel}
            image={media.src}
            aspectRatio={media.aspectRatio ?? 16 / 9}
            index={index}
          />
        ))}
      </section>
    );
  }

  return (
    <header className={styles.hero}>
      {media.type === 'video' ? (
        <video
          className={styles.media}
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image src={media.src} alt="" fill priority sizes="100vw" className={styles.media} />
      )}
      <div className={styles.overlay} />

      {navLinks && (
        <nav className={styles.nav}>
          <span className={styles.logo}>{siteConfig.name}</span>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className={styles.content}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {ctaLabel && ctaHref && (
          <div className={styles.cta}>
            <Button href={ctaHref}>{ctaLabel}</Button>
          </div>
        )}
      </div>
    </header>
  );
}
