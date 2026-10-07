# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Aficionados de la Liga MX en México que juegan con sus amigos: arman ligas privadas de fantasy con
draft, llenan quinielas y entran a retos Survivor. Lo viven desde el teléfono, jornada a jornada,
durante el torneo (Apertura / Clausura).

## Product Purpose

Pro Fantasy (dominio fantasymx.cloud) es una plataforma de fútbol para competir con amigos: fantasy
con draft en vivo y duelos cara a cara cada jornada, quinielas de marcador exacto y Survivor con
vidas, sobre datos reales del fútbol. Se usa en la web (fantasymx.cloud) y en la app de iOS; la de
Android está en camino.

El éxito de la landing (`/landingpage`) se mide en descargas de la app.

## Positioning

- El draft es en vivo, pick por pick, con reloj y board en tiempo real; no es una plantilla
  armada a solas.
- Tres modos de juego en una sola app, todos pensados para el grupo de amigos: fantasy, quinielas
  y Survivor.
- La Liga MX es gratis siempre. Premier League, LaLiga, Serie A y Bundesliga son de Premium.

## Operating Context

- La app de iOS está publicada en la App Store, es gratis, universal (iPhone y iPad) y pide iOS
  18.2 o posterior. La ficha la vende como "Deportes" y tiene clasificación 17+.
- Android todavía no está en Google Play. Mientras tanto, quien no tiene iPhone juega en la web.
- Premium es una suscripción autorrenovable: $99 MXN al mes o $799 MXN al año (Europa, reglas a la
  medida, mock drafts, calificación de plantilla, sin anuncios).

## Capabilities and Constraints

- Tres clientes con el mismo contrato: API Laravel, web Vue 3 (PWA) y app Kotlin Multiplatform
  (Compose en Android, SwiftUI en iOS).
- Interfaz en español primero (es-MX) con inglés de respaldo; los textos viven en archivos i18n
  espejados entre web y móvil.
- La landing es pública e indexable: el prerender sirve su contenido en HTML estático a los
  crawlers a partir de `src/locales/es/landing.json`.

## Brand Commitments

- Nombre: **Pro Fantasy**. Ícono: monograma "F" lima sobre azul.
- Guía de marca (septiembre de 2026), vinculante: primarios `#0025AA`, `#0137D2`, `#ACE80D`,
  `#B4E70E`; secundarios `#212121`, `#D6D6D6`, `#F9F9F9`. Tipografía Montserrat (Light, Regular,
  Medium, Bold, ExtraBold).
- Pedido explícito del usuario para esta landing: paleta oscura basada en la interfaz móvil.
- Para las capturas de la App Store el usuario eligió el estilo "Noche lima" (fondo oscuro con
  brillo azul y lima).

## Evidence on Hand

- Ficha de la App Store: id `6806096370`. Enlaces cortos: `https://apple.co/3VlHTKi` (campaña
  "link") y `https://apple.co/4z5qYu2` (campaña "qrcode", el que codifica el QR).
- QR oficial con el ícono al centro: `../marketing/apple/qr-code.png` (400×400).
- Insignia oficial "Descárgalo en el App Store" (es-MX, negra) del toolbox de marketing de Apple.
- Video de la app (App Preview real): `https://pub-b1520b0657fa453abbbaa2ceb54b8463.r2.dev/LandingPage/1IeLQgjKC_AAsc6H7Kvsbw.mp4`
  — 886×1920, 29.5 s, H.264 con audio, faststart. Mismo archivo que
  `../marketing/app-store/preview/pro-fantasy-app-preview-real.mp4`.
- Nueve capturas de la App Store (1320×2868, ya compuestas con titular, teléfono y lupa lima) en
  R2 `LandingPage/image-17909136…png`, idénticas a
  `../marketing/app-store/capturas/iphone-6.9-reales/01..09`: draft, campo, posiciones, tabla,
  duelo, jugar, quiniela, survivor y resultados.
- **Ausencias que no se deben inventar:** no hay testimonios, ni cifras de descargas o usuarios;
  la ficha tiene solo 3 calificaciones (no sirven como prueba social); no existe ficha de Google
  Play; no hay capturas de iPad.

## Product Principles

1. La Liga MX gratis es la promesa; lo que se paga se menciona después y nunca como titular.
2. Se juega con amigos: cada función se explica por lo que le hace a tu grupo, no por la función.
3. Mostrar la app real en lugar de describirla.
4. Nadie se queda sin camino: la descarga va primero y la web es la ruta de quien todavía no puede
   instalar la app.
