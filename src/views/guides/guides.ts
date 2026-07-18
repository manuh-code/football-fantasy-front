// Shared metadata for the Guides section.
//
// Content (titles, excerpts, sections) lives in i18n under `guides.items.<key>`
// for es/en. Here we keep only the non-translatable metadata: the URL slug, the
// icon and accent used in the UI, and an approximate reading time. The `slug` is
// the stable, SEO-friendly URL segment; it is intentionally kept out of i18n so
// links never break when switching language.

export interface GuideMeta {
  /** i18n key under `guides.items.<key>`. */
  key: string
  /** URL segment for /guias/:slug. Stable, Spanish, SEO-friendly. */
  slug: string
  /** oh-vue-icons name (must be registered in src/icons/index.ts). */
  icon: string
  /** Approximate reading time in minutes, shown on the hub cards. */
  minRead: number
}

export const GUIDES: GuideMeta[] = [
  { key: 'fantasy', slug: 'como-jugar-fantasy', icon: 'bi-trophy-fill', minRead: 5 },
  { key: 'draft', slug: 'como-funciona-el-draft', icon: 'hi-solid-cursor-click', minRead: 4 },
  { key: 'quiniela', slug: 'como-jugar-quiniela', icon: 'hi-solid-clipboard-check', minRead: 3 },
  { key: 'survivor', slug: 'como-funciona-survivor', icon: 'hi-solid-fire', minRead: 4 },
  { key: 'puntos', slug: 'sistema-de-puntos', icon: 'hi-solid-chart-bar', minRead: 3 },
  { key: 'estrategia', slug: 'estrategia-de-draft', icon: 'hi-solid-light-bulb', minRead: 5 },
  { key: 'ligas', slug: 'que-liga-elegir', icon: 'hi-solid-globe-alt', minRead: 5 },
  { key: 'consejosQuiniela', slug: 'consejos-quiniela', icon: 'hi-solid-lightning-bolt', minRead: 4 },
  { key: 'glosario', slug: 'glosario-fantasy', icon: 'hi-solid-collection', minRead: 6 },
  { key: 'faq', slug: 'preguntas-frecuentes', icon: 'hi-solid-information-circle', minRead: 5 },
]

export const getGuideBySlug = (slug: string): GuideMeta | undefined =>
  GUIDES.find((g) => g.slug === slug)
