import type { CSSProperties } from 'react';
import type { Product } from './product.types';

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Capa de un frasco: imagen PNG/WebP con fondo transparente y MISMAS
 * dimensiones que `media.src`, para que encajen sin calcular nada.
 * Es lo unico que se anima; el fondo se queda estatico.
 */
export interface HeroBottle {
  src: string;
  /**
   * Punto de apoyo del frasco (% de la imagen): baseX es su centro
   * horizontal y, junto a baseY, el origen del zoom y de la sombra.
   */
  baseX: number;
  baseY: number;
  /** Ancho del frasco (% de la imagen), para dimensionar la sombra. */
  width: number;
}

/**
 * Panel de un hero dividido (p. ej. "Para el" / "Para ella"). Cada panel
 * recorta una mitad de `media.src` y es un enlace a su seccion.
 */
export interface HeroPanel {
  id: string;
  eyebrow?: string;
  title: string;
  ctaLabel: string;
  href: string;
  /**
   * Centro horizontal (% de la imagen) de lo que se quiere encuadrar en el
   * panel, p. ej. el centro del grupo de frascos. Por defecto, la media de
   * los `baseX` de `bottles`.
   */
  focusX?: number;
  /**
   * Donde queda `focusX` dentro del panel (% del ancho; 50 = centrado). El
   * encuadre se calcula solo, asi que queda exactamente ahi con cualquier
   * tamano de pantalla.
   */
  center?: number;
  /**
   * Igual que `center`, en movil (paneles apilados). Por defecto 66: frascos
   * a la derecha y texto libre a la izquierda.
   */
  centerMobile?: number;
  /** Frascos animados del panel (cada uno flota con su propio desfase). */
  bottles?: HeroBottle[];
}

export interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media: {
    type: 'image' | 'video';
    src: string;
    poster?: string;
    /** Ancho / alto de la imagen. Solo se usa en la variante con `panels`. */
    aspectRatio?: number;
  };
  ctaLabel?: string;
  ctaHref?: string;
  navLinks?: NavLink[];
  /**
   * Si se informa, el hero se pinta dividido en paneles enlazados
   * (solo con media.type = 'image') en lugar del layout clasico.
   */
  panels?: HeroPanel[];
}

export interface SplitIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: 'left' | 'right';
  ctaLabel?: string;
  ctaHref?: string;
}

export interface PromoBanner {
  id: string;
  tag?: string;
  title: string;
  ctaLabel?: string;
  href: string;
  image?: string;
}

export interface ProductCarouselProps {
  title?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  items?: Product[];
  promos?: PromoBanner[];
  className?: string;
  style?: CSSProperties;
}

export interface FeatureBannerProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products?: Product[];
  backgroundImage?: string;
  imageAlt?: string;
}

export interface Category {
  label: string;
  image: string;
  href?: string;
}

export interface CategoryGridProps {
  title?: string;
  categories: Category[];
}

export interface PromoGridProps {
  promos: PromoBanner[];
}

export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialsProps {
  title: string;
  testimonials: Testimonial[];
  googleReviewHref?: string;
}

/**
 * Union discriminada: cada seccion de la landing es un objeto con
 * "type" + "props" tipados. Esto es lo que permite que SectionRenderer
 * sepa que componente pintar y con que props, de forma 100% tipada.
 */
export type SectionConfig =
  | { id: string; type: 'hero'; props: HeroProps }
  | { id: string; type: 'splitIntro'; props: SplitIntroProps }
  | { id: string; type: 'productCarousel'; props: ProductCarouselProps }
  | { id: string; type: 'featureBanner'; props: FeatureBannerProps }
  | { id: string; type: 'categoryGrid'; props: CategoryGridProps }
  | { id: string; type: 'promoGrid'; props: PromoGridProps }
  | { id: string; type: 'testimonials'; props: TestimonialsProps };

export interface SocialLink {
  label: string;
  initial: string;
  href: string;
}
