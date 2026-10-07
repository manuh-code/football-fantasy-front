/**
 * Los dos sitios del dominio. Sirven el MISMO build: lo que cambia es el host.
 *
 * - `marketing` — https://fantasymx.cloud. La raíz es la landing de descarga y
 *   solo conserva las páginas públicas que ya estaban publicadas en las tiendas
 *   y en Google (guías, acerca de, aviso de privacidad, borrado de cuenta).
 * - `app` — https://game.fantasymx.cloud. La aplicación: login, ligas, draft,
 *   quinielas, Survivor, Premium…
 * - `dev` — localhost, previews y cualquier otro host. Se comporta como antes de
 *   la separación (todo se sirve en el mismo origen, `/landingpage` incluida) y
 *   NUNCA redirige a producción, para no sacarte del servidor local.
 *
 * El sitio se decide en runtime con `location.hostname`, no con una variable de
 * entorno: así una sola imagen de Docker sirve los dos hosts y no hay que tocar
 * el workflow ni el Dockerfile. scripts/prerender.mjs repite los dos orígenes (un
 * .mjs no importa este .ts): si cambian aquí, cambian allá y en config/nginx.
 */

export const MARKETING_ORIGIN = 'https://fantasymx.cloud'
export const APP_ORIGIN = 'https://game.fantasymx.cloud'

export type Site = 'marketing' | 'app' | 'dev'

const MARKETING_HOSTS = new Set(['fantasymx.cloud', 'www.fantasymx.cloud'])
const APP_HOSTS = new Set(['game.fantasymx.cloud'])

function detectSite(): Site {
  if (typeof window === 'undefined') return 'dev'
  const host = window.location.hostname
  if (MARKETING_HOSTS.has(host)) return 'marketing'
  if (APP_HOSTS.has(host)) return 'app'
  return 'dev'
}

export const currentSite: Site = detectSite()
export const isMarketingSite = currentSite === 'marketing'

/** A qué sitio pertenece una ruta (por nombre). */
export type RouteHome = 'marketing' | 'app' | 'both'

/**
 * Solo se vive en el sitio de marketing.
 *
 * `landingpage` es la raíz de `fantasymx.cloud`; en el sitio de la app no tiene
 * sentido (no es parte del juego), así que ahí se manda al otro dominio.
 */
const MARKETING_ONLY_ROUTES = new Set(['landingpage'])

/**
 * Se sirven en los dos hosts. Son contenido de lectura que la app enlaza desde
 * su pie de página (y que las tiendas publican en `fantasymx.cloud/...`): sacar
 * al usuario del juego para leer el aviso de privacidad sería peor que
 * duplicarlo. La duplicación la absorbe el `canonical`, que siempre apunta al
 * sitio de marketing (ver `canonicalOrigin`).
 */
const SHARED_ROUTES = new Set(['about', 'guides', 'guideDetail', 'privacy', 'deleteAccount'])

export function routeHome(name: unknown): RouteHome {
  if (typeof name !== 'string') return 'app'
  if (MARKETING_ONLY_ROUTES.has(name)) return 'marketing'
  if (SHARED_ROUTES.has(name)) return 'both'
  return 'app'
}

/**
 * URL absoluta a la que hay que ir si la ruta vive en el OTRO sitio, o `null`
 * si se sirve aquí mismo. Siempre `null` en `dev`.
 *
 * `fullPath` conserva query y hash: así sobreviven los enlaces viejos que ya
 * andan por ahí (invitaciones por correo, `?join=`, el regreso de OAuth).
 */
export function crossSiteUrl(name: unknown, fullPath: string): string | null {
  if (currentSite === 'dev') return null
  const home = routeHome(name)
  if (home === 'marketing' && currentSite === 'app') {
    // La landing es la raíz del sitio de marketing; `/landingpage` ya no existe allá.
    return `${MARKETING_ORIGIN}/`
  }
  if (home === 'app' && currentSite === 'marketing') return `${APP_ORIGIN}${fullPath}`
  return null
}

/** Origen para la URL canónica de una ruta (SEO): el contenido compartido consolida en marketing. */
export function canonicalOrigin(name: unknown): string {
  return routeHome(name) === 'app' ? APP_ORIGIN : MARKETING_ORIGIN
}

/**
 * URL para entrar a la app desde una página del sitio de marketing: absoluta en
 * `fantasymx.cloud` (otro origen), relativa en cualquier otro host.
 */
export function appUrl(path = '/'): string {
  return isMarketingSite ? `${APP_ORIGIN}${path}` : path
}
