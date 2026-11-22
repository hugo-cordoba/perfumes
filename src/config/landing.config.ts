import type { SectionConfig, NavLink } from '@/types/section.types';

/**
 * Enlaces de navegacion compartidos, usados por el Header fijo.
 * Antes vivian dentro de hero.props.navLinks; ahora estan aqui para
 * que el Header (fuera del Hero) pueda usarlos tambien.
 */
export const siteNavLinks: NavLink[] = [
  { label: 'Productos', href: '/products' },
  { label: 'Catalogo', href: '#productos' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

/**
 * Este es el fichero "comun" para AÑADIR, QUITAR o REORDENAR secciones
 * de la home. Es un simple array: el orden en que aparecen aqui es el
 * orden en que se pintan en la pagina.
 *
 * - Para quitar una seccion: borra (o comenta) su objeto del array.
 * - Para añadir una: copia un bloque, cambia "type" y sus "props".
 * - Para reordenar: cambia la posicion del objeto en el array.
 *
 * El contenido (texto, imagenes, productos) tambien vive aqui, para que
 * personalizar una tienda nueva sea, en gran parte, editar este fichero.
 */
export const landingSections: SectionConfig[] = [
  {
    id: 'hero',
    type: 'hero',
    props: {
      title: 'Descubre tu fragancia',
      media: {
        type: 'image',
        // Fondo ESTATICO sin frascos (/public/banner-bg.webp). Cada frasco es
        // una capa transparente del mismo tamaño (banner-<frasco>.webp).
        // Fuentes en /design: banner-original.png (con frascos) y
        // banner-sin-perfumes.png (fondo limpio).
        src: '/banner-bg.webp',
        aspectRatio: 2048 / 768,
      },
      // Cada panel recorta una parte del banner y centra su grupo de frascos
      // (`focusX`, % de la imagen) en el panel (ver `center` / `centerMobile`).
      // `bottles` son las capas animadas (baseX/baseY/width en % de la imagen:
      // punto de apoyo y ancho de cada frasco).
      panels: [
        {
          id: 'para-el',
          eyebrow: 'Fragancias',
          title: 'Para él',
          ctaLabel: 'Descubrir',
          href: '/products?gender=men',
          focusX: 25.5,
          centerMobile: 56,
          bottles: [
            { src: '/banner-cdn.webp', baseX: 16.7, baseY: 74, width: 9.1 },
            { src: '/banner-asad.webp', baseX: 25.4, baseY: 62.5, width: 7.6 },
            { src: '/banner-hawas.webp', baseX: 34.5, baseY: 73.8, width: 9 },
          ],
        },
        {
          id: 'para-ella',
          eyebrow: 'Fragancias',
          title: 'Para ella',
          ctaLabel: 'Descubrir',
          href: '/products?gender=women',
          focusX: 80,
          centerMobile: 56,
          bottles: [
            { src: '/banner-yara.webp', baseX: 70.4, baseY: 74.9, width: 8 },
            { src: '/banner-khamrah.webp', baseX: 79.6, baseY: 72, width: 8 },
            { src: '/banner-fakhar.webp', baseX: 90, baseY: 76.7, width: 10.8 },
          ],
        },
      ],
    },
  },
  {
    id: 'productos',
    type: 'productCarousel',
    props: {
      title: 'PRODUCTOS DESTACADOS',
      viewAllLabel: 'Ver todos',
      viewAllHref: '/products',
    },
  },
  {
    id: 'destacado',
    type: 'featureBanner',
    props: {
      backgroundImage: '/destacado-1.webp',
      imageAlt: 'Una colección para cada ocasión',
    },
  },
  {
    id: 'productos-baratos',
    type: 'productCarousel',
    props: {
      title: 'PRODUCTOS POR MENOS DE 50€',
      viewAllLabel: 'Ver todos',
      viewAllHref: '/products?maxPrice=50',
    },
  },
    {
      id: 'destacado-2',
      type: 'featureBanner',
      props: {
        backgroundImage: '/destacado-2.webp',
        imageAlt: 'Ofertas por tiempo limitado',
      },
    },
  {
    id: 'testimonios',
    type: 'testimonials',
    props: {
      title: '¿Qué opinan nuestros clientes?',
      googleReviewHref: 'https://search.google.com/local/writereview?placeid=ChIJRbJFjNcnQg0ROe0GlmppbgM',
      testimonials: [
        { authorName: 'Laura Nguyen', authorRole: 'Directora de tienda', quote: 'El proceso de compra es clarísimo, nuestros clientes lo notan.' },
        { authorName: 'Carlos Díaz', authorRole: 'Cliente habitual', quote: 'Envíos rápidos y la web es muy fácil de usar.' },
        { authorName: 'Liam Johnson', authorRole: 'Cliente', quote: 'La atención al cliente resolvió mi duda en minutos.' },
        { authorName: 'Sofía Carter', authorRole: 'Cliente', quote: 'Desde que compro aquí no he tenido ni un problema.' },
      ],
    },
  },
];

export const footerContent = {
  email: 'user@example.com',
};
