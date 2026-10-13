/**
 * Las fichas de la app en las tiendas y su identidad, para mandar a descargarla.
 *
 * Son las mismas que publica el sitio de descarga (`profantasy/data/landing.ts`) y
 * las del API (`config/app.php`, `APP_STORE_URL`/`PLAY_STORE_URL`). Si una tienda
 * cambia de ficha, cambian las tres.
 */

/** Paquete de Android: el de la ficha de Google Play y el de `assetlinks.json`. */
export const ANDROID_PACKAGE = 'org.profantasy.mobile'

/**
 * El esquema propio de la app (`profantasy://…`). Lo registran las dos apps; aquí
 * solo lo usa el botón "Ya tengo la app" de iOS, porque Safari no abre un
 * Universal Link desde una página de su mismo dominio.
 */
export const APP_SCHEME = 'profantasy'

/**
 * El dominio que reclaman las apps (Universal Links / App Links). Fijo y no
 * `window.location.host`: en local o en otro entorno la app sigue reclamando éste.
 */
export const APP_LINK_HOST = 'fantasymx.cloud'

/**
 * App Store, con el `ct` de campaña de App Store Connect para saber cuántas
 * descargas vienen de una invitación compartida (Analytics › Fuentes).
 */
export const APP_STORE_URL =
  'https://apps.apple.com/app/apple-store/id6806096370?pt=129359108&ct=invitacion&mt=8'

/**
 * Google Play. El `referrer` lo lee Play Console como `utm_*` para la misma
 * cuenta; la app todavía no lo lee para abrir la invitación después de instalar.
 */
export const PLAY_STORE_URL =
  `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}` +
  `&referrer=${encodeURIComponent('utm_source=invitacion&utm_medium=enlace')}`
