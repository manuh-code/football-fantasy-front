import type { RouteLocationRaw } from 'vue-router'
import { ANDROID_PACKAGE, APP_LINK_HOST, APP_SCHEME, PLAY_STORE_URL } from '@/config/appStores'

/**
 * El enlace de "Compartir invitación": `https://fantasymx.cloud/join/{modo}/{código}`.
 *
 * **Es un contrato con las dos apps.** `JoinLink.build` (sharedLogic del móvil) arma
 * el mismo enlace byte a byte, y lo reclaman los Universal Links de iOS
 * (`public/.well-known/apple-app-site-association`) y los App Links de Android
 * (`pathPrefix /join/` del manifiesto): con la app instalada, el sistema la abre en
 * el cajón de unirse con el código puesto. Sin la app lo abre el navegador, en
 * `JoinLinkView.vue`: en un teléfono manda a la tienda y en un ordenador sigue a la
 * hoja de unirse de esta web.
 *
 * El modo es la palabra del dominio (`fantasy`/`pool`/`survivor`), no la etiqueta
 * de la pantalla.
 */
export type JoinMode = 'fantasy' | 'pool' | 'survivor'

const JOIN_MODES: readonly JoinMode[] = ['fantasy', 'pool', 'survivor']

export const isJoinMode = (value: unknown): value is JoinMode =>
  typeof value === 'string' && (JOIN_MODES as readonly string[]).includes(value)

/** El enlace que se comparte. `encodeURIComponent` porque el código de una liga o quiniela puede ser uno propio. */
export const buildJoinLink = (mode: JoinMode, code: string): string =>
  `${window.location.origin}/join/${mode}/${encodeURIComponent(code)}`

/**
 * La hoja de unirse de esta web, con el código precargado. Son las rutas que se
 * compartían antes del enlace `/join/` y que cada vista sigue leyendo
 * (`route.query.join`), así que los enlaces viejos siguen sirviendo.
 */
export const webJoinLocation = (mode: JoinMode, code: string): RouteLocationRaw => {
  const query = { join: code }
  switch (mode) {
    case 'fantasy':
      return { name: 'userFantasyLeague', query }
    case 'pool':
      return { name: 'pools', query }
    case 'survivor':
      return { name: 'survivor', query }
  }
}

/**
 * Abrir la app de Android en ese mismo enlace. Un `intent:` que nombra el paquete
 * casa con el filtro `https` del manifiesto aunque la verificación de App Links
 * haya fallado; sin la app, Chrome sigue a `browser_fallback_url` (Google Play).
 */
export const androidAppIntent = (mode: JoinMode, code: string): string =>
  `intent://${APP_LINK_HOST}/join/${mode}/${encodeURIComponent(code)}` +
  `#Intent;scheme=https;package=${ANDROID_PACKAGE};` +
  `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`

/** Abrir la app de iOS: `profantasy://join/{modo}/{código}` (`AppLinks.resolve` en el móvil). */
export const iosAppUrl = (mode: JoinMode, code: string): string =>
  `${APP_SCHEME}://join/${mode}/${encodeURIComponent(code)}`

export type MobilePlatform = 'ios' | 'android' | null

/**
 * En qué teléfono se abrió el enlace, o `null` en un ordenador. Mismas reglas que
 * `usePwaInstall` (un iPad con iPadOS 13+ se presenta como Mac).
 */
export const detectMobilePlatform = (): MobilePlatform => {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (/android/i.test(ua)) return 'android'
  return null
}

/** La web instalada como app (PWA): quien la usa así ya eligió la web. */
export const isStandaloneWebApp = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true)
