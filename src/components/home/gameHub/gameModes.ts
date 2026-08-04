import type { RouteLocationRaw } from 'vue-router'
import type { GameMode } from '@/composables/useGameHub'
import { GUIDES } from '@/views/guides/guides'

export interface ModeStyle {
  icon: string
  /** Clases `from-*`/`to-*`; el `bg-gradient-to-br` lo pone quien las usa. */
  gradient: string
  /** Color del texto para la etiqueta del modo sobre fondo claro/oscuro. */
  label: string
}

/**
 * Única fuente de estilo por modo de juego. Vive fuera de los componentes porque
 * la comparten el hub y sus secciones: si el icono de Survivor cambiara en un
 * sitio y no en el otro, la misma partida se vería distinta en dos filas de la
 * misma pantalla.
 */
export const MODE_STYLE: Record<GameMode, ModeStyle> = {
  // Fantasy lleva el esmeralda de la marca por ser el modo principal. Antes era
  // azul→índigo, un color que no aparecía en ningún otro sitio del producto y
  // hacía que la tarjeta grande pareciera de otra app.
  fantasy: {
    icon: 'bi-trophy-fill',
    gradient: 'from-emerald-500 to-emerald-700',
    label: 'text-emerald-700 dark:text-emerald-400',
  },
  // Quinielas pasa de esmeralda a ámbar: en esmeralda chocaba con fantasy y
  // además coincidía con el color de acción de la interfaz (enlaces, focos), así
  // que no se leía como "color de modo" sino como "esto se toca".
  pools: {
    icon: 'hi-solid-document-text',
    gradient: 'from-amber-500 to-amber-700',
    label: 'text-amber-700 dark:text-amber-400',
  },
  survivor: {
    icon: 'hi-solid-shield-check',
    gradient: 'from-rose-500 to-red-600',
    label: 'text-rose-600 dark:text-rose-400',
  },
}

/**
 * Guía pública que explica cada modo. Se mapea por `key` y no por slug para que
 * el slug siga viviendo en un solo sitio (`guides.ts`) y no puedan divergir.
 */
const GUIDE_KEY_BY_MODE: Record<GameMode, string> = {
  fantasy: 'fantasy',
  pools: 'quiniela',
  survivor: 'survivor',
}

/**
 * Destino para quien todavía no tiene sesión. La guía es contenido público que
 * explica el modo y termina con su propia llamada a registrarse: se pide la
 * cuenta cuando el usuario ya sabe qué gana, no en el primer toque.
 */
export function guideRouteForMode(mode: GameMode): RouteLocationRaw | undefined {
  const slug = GUIDES.find((guide) => guide.key === GUIDE_KEY_BY_MODE[mode])?.slug
  return slug ? { name: 'guideDetail', params: { slug } } : undefined
}

/**
 * Nombre visible del modo. "Survivor" es nombre de marca y va sin traducir a
 * propósito; los otros dos sí se traducen.
 */
export function modeTitle(mode: GameMode, t: (key: string) => string): string {
  return mode === 'survivor' ? 'Survivor' : t(`fantasy.gaming.${mode}.title`)
}
