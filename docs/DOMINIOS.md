# Dominios: `fantasymx.cloud` y `game.fantasymx.cloud`

Un solo build (una sola imagen de Docker, un solo contenedor) sirve **dos sitios**, y el host decide cuál:

| Host | Es | Qué sirve |
| --- | --- | --- |
| `https://fantasymx.cloud` | Marketing | La landing de descarga **en `/`** y las páginas públicas de lectura: `/about`, `/guias`, `/guias/*`, `/privacy`, `/eliminar-cuenta`. Todo lo demás → 301 a `game.fantasymx.cloud` (conserva path y query). |
| `https://game.fantasymx.cloud` | App | La SPA completa (login, ligas, draft, quinielas, Survivor, Premium…). También sirve las páginas de lectura, con la canónica apuntando a `fantasymx.cloud`. |
| `https://www.fantasymx.cloud` | — | 301 a `fantasymx.cloud`. |
| `localhost`, IP del VPS, previews | Dev | Se comporta como antes de la separación; nunca redirige a producción. |

## Dónde vive cada pieza

- **`src/config/site.ts`** — decide el sitio con `location.hostname` (no hay variable de entorno que añadir al workflow ni al Dockerfile) y dice a qué sitio pertenece cada ruta (`SHARED_ROUTES`, `MARKETING_ONLY_ROUTES`).
- **`src/router/index.ts`** — en marketing la ruta `landingpage` es `/`; el guard redirige (navegación completa) las rutas que son del otro sitio. Es la red de seguridad cuando nginx no ve el Host correcto.
- **`config/nginx/nginx.conf`** — un `server` por host: la landing prerenderizada en `/`, los 301 y el `robots.txt`/`sitemap.xml` propios de la app. La lista de páginas públicas de marketing está duplicada aquí y en `SHARED_ROUTES`: si cambia una, cambia la otra.
- **`scripts/prerender.mjs`** — cada página declara su `site`; de ahí salen su canónica y dos sitemaps (`sitemap.xml` para marketing, `sitemap-app.xml` para la app, servido como `/sitemap.xml` en `game.`).
- **`src/retirePwa.ts`** — fantasymx.cloud ya no registra service worker; retira el que haya dejado la versión anterior.

## Checklist de puesta en marcha (fuera del repo)

1. **DNS (Hostinger → *DNS records*)**. Los hosts web van como registros **A/CNAME** en *DNS records*; la pantalla *Child nameservers* sirve para registrar servidores de nombres propios (`ns1.tudominio`) y **no** hace que `game.fantasymx.cloud` resuelva. Necesitas: `A @`, `A www` y `A game` hacia la IP del VPS del front, y `A api` hacia la del API. Se comprueba con `dig +short game.fantasymx.cloud`.
2. **Proxy / TLS del VPS.** Un certificado para `game.fantasymx.cloud` (y `fantasymx.cloud` + `www`) y un host virtual que reenvíe los tres al puerto 3000 del contenedor **conservando el Host original** (`proxy_set_header Host $host;` en nginx; Caddy, Traefik y Nginx Proxy Manager ya lo hacen).
3. **Backend (Laravel).** CORS: permitir `https://game.fantasymx.cloud` (mantener `https://fantasymx.cloud` mientras haya sesiones viejas). La URL del front que usa el API para armar enlaces (invitaciones por correo, recuperación de contraseña, deep links de push, retorno de Stripe) → `https://game.fantasymx.cloud`. Los redirect URI de Google y Facebook (`FACEBOOK_REDIRECT_URI` y el de Google) → `https://game.fantasymx.cloud/auth/<proveedor>/callback`.
4. **Consolas externas.** Google Cloud (OAuth: orígenes y URIs de redirección autorizados) y Meta (Valid OAuth Redirect URIs / App Domains): añadir `game.fantasymx.cloud`. Stripe: registrar `game.fantasymx.cloud` si se usan métodos de pago por dominio (Apple Pay). Google Search Console: propiedad nueva para `game.fantasymx.cloud` y enviar su sitemap.
5. **Tiendas.** `fantasymx.cloud/privacy` y `fantasymx.cloud/eliminar-cuenta` (las URLs publicadas en App Store / Google Play) **siguen funcionando igual**.

## Efectos que conviene conocer

- **Todos los usuarios de la web tendrán que iniciar sesión otra vez.** El token vive en `localStorage`, que es por origen: `game.fantasymx.cloud` no ve el de `fantasymx.cloud`.
- **La PWA ya instalada desde `fantasymx.cloud`** abre la landing, no el juego; hay que instalar de nuevo desde `game.fantasymx.cloud`. El navegador que aún tenga el build viejo en caché se actualiza solo en la siguiente navegación y, en marketing, retira su service worker.
- **Si el proxy no pasa el Host**, todo cae en el `server` por defecto (la app): el router del cliente sigue mostrando la landing en `/` y redirigiendo las rutas de la app, pero se pierden la landing prerenderizada (SEO) y los 301.

## Probar

```bash
curl -sI https://fantasymx.cloud/            | head -1   # 200 (landing)
curl -sI https://fantasymx.cloud/login       | grep -i '^location'   # https://game.fantasymx.cloud/login
curl -sI https://fantasymx.cloud/landingpage | grep -i '^location'   # https://fantasymx.cloud/
curl -sI https://www.fantasymx.cloud/guias   | grep -i '^location'   # https://fantasymx.cloud/guias
curl -s  https://game.fantasymx.cloud/robots.txt                      # Sitemap: https://game.fantasymx.cloud/sitemap.xml
```
