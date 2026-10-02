// Datos fijos de la landing de descarga: enlaces, archivos y tiempos. Los
// textos viven en src/locales/{es,en}/landing.json.
//
// scripts/prerender.mjs repite APP_STORE.link y APP_STORE.id para la versión
// estática de la página (un .mjs no puede importar este .ts): si cambian aquí,
// cambian allá.

const R2 = 'https://pub-b1520b0657fa453abbbaa2ceb54b8463.r2.dev/LandingPage'

/**
 * La ficha de la App Store. Cada enlace lleva su propia campaña de Apple
 * (`itsct`), así App Store Connect distingue de dónde salió cada descarga:
 * la insignia (`apps_box_badge`), los botones de texto (`apps_box_link`) y el
 * QR (`apps_box_qrcode`, el enlace https://apple.co/4z5qYu2 que va codificado
 * en la imagen).
 */
export const APP_STORE = {
  id: '6806096370',
  /** El código de insignia oficial del toolbox de marketing de Apple, tal cual. */
  badgeHref:
    'https://apps.apple.com/mx/app/pro-fantasy/id6806096370?itscg=30200&itsct=apps_box_badge&mttnsubad=6806096370',
  link: 'https://apple.co/3VlHTKi',
  qrSrc: '/img/landing/app-store-qr.png',
} as const

/** La insignia oficial, en el idioma de la página (Apple pide la localizada). */
export function appStoreBadgeSrc(locale: string): string {
  const region = locale.startsWith('en') ? 'en-us' : 'es-mx'
  return `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/${region}?releaseDate=1790121600`
}

export const APP_ICON = '/img/landing/app-icon.webp'

/**
 * Las nueve capturas de la App Store, en el orden en que se presentan. Ya
 * vienen compuestas (titular, teléfono y lupa lima), así que se muestran tal
 * cual, sin otro marco encima.
 *
 * `remote` es el PNG original en R2 (1320×2868, ~1 MB cada uno). La página
 * sirve copias WebP de 600 y 900 px desde public/img/landing/shots/ (~50 y
 * ~75 KB) y deja el PNG como el candidato más grande del `srcset`: las nueve a
 * tamaño completo pesaban 7.4 MB.
 */
export const SCREENS = [
  { key: 'draft', file: '01-draft', remote: `${R2}/image-1790913632440.png` },
  { key: 'pitch', file: '02-campo', remote: `${R2}/image-1790913642326.png` },
  { key: 'standings', file: '03-posiciones', remote: `${R2}/image-1790913650668.png` },
  { key: 'table', file: '04-tabla', remote: `${R2}/image-1790913660077.png` },
  { key: 'matchup', file: '05-duelo', remote: `${R2}/image-1790913669836.png` },
  { key: 'leagues', file: '06-jugar', remote: `${R2}/image-1790913677760.png` },
  { key: 'pools', file: '07-quiniela', remote: `${R2}/image-1790913688598.png` },
  { key: 'survivor', file: '08-survivor', remote: `${R2}/image-1790913696668.png` },
  { key: 'results', file: '09-resultados', remote: `${R2}/image-1790913703883.png` },
] as const

export const SCREEN_SIZE = { width: 1320, height: 2868 } as const

export function screenSrcset(screen: (typeof SCREENS)[number]): string {
  const local = `/img/landing/shots/${screen.file}`
  return `${local}-600.webp 600w, ${local}-900.webp 900w, ${screen.remote} 1320w`
}

/**
 * La App Preview: grabación real de un draft en un iPhone, la misma que está en
 * la App Store (marketing/app-store/preview/pro-fantasy-app-preview-real.mp4).
 * 886×1920, 29.5 s, con el `moov` al principio para que arranque sin bajar
 * el archivo completo.
 *
 * Hoy `src` es el original de la tienda (41 MB), así que en pantallas táctiles
 * el video espera un toque. Pendiente: subir a R2 la versión web
 * (marketing/app-store/preview/pro-fantasy-app-preview-web.mp4, 5.4 MB, misma
 * imagen a tamaño de pantalla), poner su URL en `src` y `lightweight: true`;
 * con eso también arranca solo, silenciado, en el teléfono.
 */
export const DEMO_VIDEO = {
  src: `${R2}/1IeLQgjKC_AAsc6H7Kvsbw.mp4`,
  lightweight: false,
  poster: '/img/landing/demo-poster.webp',
  width: 886,
  height: 1920,
  duration: 29.5,
} as const

/**
 * Las escenas del video y el segundo en que empieza cada una. Salen de
 * `SCENES` en marketing/app-store/fuente/preview-b.html: si el video se vuelve
 * a montar, estos tiempos se copian de ahí.
 */
export const DEMO_SCENES = [
  { key: 'league', start: 0 },
  { key: 'draft', start: 3.2 },
  { key: 'turn', start: 8.9 },
  { key: 'wishlist', start: 12.9 },
  { key: 'board', start: 17.3 },
  { key: 'team', start: 21.7 },
] as const

/** A partir de aquí corre el cierre con el logo, que no es una escena. */
export const DEMO_OUTRO_START = 26.2
