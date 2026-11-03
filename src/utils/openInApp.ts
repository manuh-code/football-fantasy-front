import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { ANDROID_PACKAGE, APP_LINK_HOST, APP_SCHEME, PLAY_STORE_URL } from '@/config/appStores'

/**
 * El enlace de los **correos que tienen que abrir la app**:
 * `https://fantasymx.cloud/open/{ruta de esta web}`, por ejemplo
 * `/open/pools/{uuid}?tab=predictions` (el botón «Anotar mis marcadores» del
 * recordatorio de quiniela).
 *
 * **Es un contrato con el API y con las dos apps.** El API lo arma en un solo
 * sitio (`PushRoute::openInApp`); las apps lo reclaman (`/open/*` en el
 * `apple-app-site-association` de esta web y `pathPrefix /open/` del manifiesto
 * de Android) y lo leen con `AppLinks.resolve`, que tras el prefijo entiende la
 * misma ruta que el `url` de un push. Por eso lo que viene detrás de `/open` es
 * una ruta de esta web, y lo único que decide la web es qué hacer cuando el
 * sistema NO abrió la app:
 *
 * - en un ordenador (o en la web instalada como PWA), seguir a esa misma ruta,
 *   que es lo que el correo abría antes de existir `/open`;
 * - en un teléfono, mandar a la tienda (`OpenInAppView.vue`).
 *
 * Se reclama `/open/` y no `/pools/…` a propósito: reclamar las pantallas de la
 * web sacaría de ella a quien llega a ellas desde fuera, y Android no filtra
 * los App Links por la query. Mismo razonamiento que `/join/`.
 */

/** Los primeros tramos que la app sabe abrir y esta web tiene como ruta. */
const OPENABLE_ROOTS: readonly string[] = ['pools', 'survivor', 'fantasy', 'my']

export type OpenRoot = 'pool' | 'survivor' | 'fantasy'

/**
 * La ruta de esta web que hay detrás de `/open`, con su barra inicial, o `null`
 * si no es una que la app abra. Cerrada a una lista a propósito: `/open` no es
 * un redireccionador genérico.
 */
export const openableRoute = (rest: string): string | null => {
  const segments = rest.split('/').filter((segment) => segment.trim() !== '')
  if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) return null
  if (!OPENABLE_ROOTS.includes(segments[0].toLowerCase())) return null
  return `/${segments.join('/')}`
}

/** Para qué modo es la ruta: solo cambia el rótulo de la página. */
export const openRootOf = (route: string): OpenRoot => {
  const root = route.split('/').filter(Boolean)[0]?.toLowerCase()
  if (root === 'pools') return 'pool'
  if (root === 'survivor') return 'survivor'
  return 'fantasy'
}

/** `?tab=predictions&…` o vacío. Solo claves con valor: la app lee `tab` y `round`. */
export const searchOf = (query: LocationQuery): string => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first !== null && first !== undefined && first !== '') params.set(key, first)
  }
  const search = params.toString()
  return search ? `?${search}` : ''
}

/** La ruta de la propia web, para quien no abre la app (ordenador, PWA o "Continuar en la web"). */
export const webOpenLocation = (route: string, query: LocationQuery): RouteLocationRaw => ({ path: route, query })

/**
 * Abrir la app de Android en ese mismo enlace. Un `intent:` que nombra el paquete
 * casa con el filtro `https` del manifiesto aunque la verificación de App Links
 * haya fallado; sin la app, Chrome sigue a `browser_fallback_url` (Google Play).
 */
export const androidOpenIntent = (route: string, search: string): string =>
  `intent://${APP_LINK_HOST}/open${route}${search}` +
  `#Intent;scheme=https;package=${ANDROID_PACKAGE};` +
  `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`

/** Abrir la app de iOS: `profantasy://open/{ruta}` (`AppLinks.resolve` en el móvil). */
export const iosOpenUrl = (route: string, search: string): string => `${APP_SCHEME}://open${route}${search}`
