// Prerender de rutas públicas — se ejecuta después de `vite build`.
//
// Problema que resuelve (AdSense/SEO): como SPA, todas las URLs sirven un
// index.html con <div id="app"> vacío; el revisor de AdSense ve "pantallas sin
// contenido". Este script genera dist/<ruta>/index.html con el contenido REAL
// de cada página pública como HTML estático, tomado de la misma fuente de
// verdad que usa la app (los JSON de i18n en español, el locale por defecto).
//
// - nginx ya lo sirve sin cambios extra: `try_files $uri $uri/ /index.html`
//   junto con `index index.html` resuelve /guias → dist/guias/index.html.
// - Cuando el JS carga, Vue monta en #app y REEMPLAZA el contenido estático
//   por la app viva; para usuarios con JS no cambia nada (solo ven el
//   contenido antes, en lugar del splash).
// - Los archivos se generan después de que vite-plugin-pwa arma el precache,
//   así que no engordan el service worker.
//
// Rutas generadas: /landingpage, /about, /guias, /guias/<slug> (todas las
// guías declaradas en src/views/guides/guides.ts) y /privacy.
//
// Al final también escribe dist/sitemap.xml a partir de esas mismas rutas.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const SITE = 'https://fantasymx.cloud'
const OG_IMAGE = `${SITE}/img/og-cover.png`

const readJson = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const guides = readJson('src/locales/es/guides.json')
const landing = readJson('src/locales/es/landing.json')
const about = readJson('src/locales/es/ui.json').about
const premium = readJson('src/locales/es/premium.json').landing

// Slugs/keys desde guides.ts (única fuente de verdad de las URLs).
const guidesTs = readFileSync(resolve(root, 'src/views/guides/guides.ts'), 'utf8')
const GUIDES = [...guidesTs.matchAll(/\{\s*key:\s*'([^']+)',\s*slug:\s*'([^']+)'[^}]*minRead:\s*(\d+)/g)]
  .map(([, key, slug, minRead]) => ({ key, slug, minRead: Number(minRead) }))
if (GUIDES.length === 0) throw new Error('prerender: no pude leer las guías desde guides.ts')

const LEAGUES = [
  { name: 'Liga MX', tier: 'Gratis' },
  { name: 'Premier League', tier: 'Premium' },
  { name: 'LaLiga', tier: 'Premium' },
  { name: 'Serie A', tier: 'Premium' },
  { name: 'Bundesliga', tier: 'Premium' },
]

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ── Bloques compartidos ─────────────────────────────────────────────────────

const STYLES = `<style>
.pr{max-width:760px;margin:0 auto;padding:20px 16px 64px;font-family:-apple-system,BlinkMacSystemFont,system-ui,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;line-height:1.65}
html.dark .pr{color:#d1d5db}
.pr header.pr-nav{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;margin-bottom:24px}
html.dark .pr header.pr-nav{border-color:#374151}
.pr .pr-brand{font-weight:800;font-size:1.05rem;color:#059669;text-decoration:none}
.pr nav a{color:#4b5563;text-decoration:none;font-size:.9rem;margin-right:14px}
html.dark .pr nav a{color:#9ca3af}
.pr h1{font-size:1.75rem;line-height:1.2;letter-spacing:-.02em;margin:0 0 12px;color:#111827}
.pr h2{font-size:1.2rem;line-height:1.3;margin:28px 0 8px;color:#111827}
.pr h3{font-size:1rem;margin:18px 0 6px;color:#111827}
html.dark .pr h1,html.dark .pr h2,html.dark .pr h3{color:#fff}
.pr p{margin:0 0 12px}
.pr ul{margin:0 0 16px;padding-left:20px}
.pr li{margin-bottom:8px}
.pr a{color:#059669}
.pr .pr-note{border-left:4px solid #059669;background:#ecfdf5;padding:10px 14px;border-radius:8px;margin:0 0 16px}
html.dark .pr .pr-note{background:rgba(5,150,105,.12)}
.pr .pr-lead{font-size:1.05rem;color:#4b5563}
html.dark .pr .pr-lead{color:#9ca3af}
.pr .pr-chips{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}
.pr .pr-chips li{border:1px solid #d1d5db;border-radius:999px;padding:4px 12px;font-size:.8rem;font-weight:700;margin:0}
.pr .pr-tier{font-weight:600;font-size:.72rem;color:#6b7280;margin-left:4px}
html.dark .pr .pr-tier{color:#9ca3af}
html.dark .pr .pr-chips li{border-color:#4b5563}
.pr footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:.85rem;color:#6b7280}
html.dark .pr footer{border-color:#374151}
#app-splash{display:none!important}
</style>`

const NAV = `<header class="pr-nav">
  <a class="pr-brand" href="/">Pro Fantasy</a>
  <nav aria-label="Secciones">
    <a href="/">Inicio</a>
    <a href="/liga">Resultados</a>
    <a href="/guias">Guías y reglas</a>
    <a href="/premium/planes">Premium</a>
    <a href="/about">Acerca de</a>
    <a href="/landingpage">Qué es Pro Fantasy</a>
  </nav>
</header>`

const FOOTER = `<footer>
  <p>Pro Fantasy — futbol en vivo, fantasy con draft, quinielas y Survivor para
  Liga MX, Premier League, LaLiga, Serie A y Bundesliga. La Liga MX, gratis.</p>
  <p><a href="/guias">Guías</a> · <a href="/about">Acerca de</a> · <a href="/privacy">Aviso de privacidad</a></p>
</footer>`

const chips = () =>
  `<ul class="pr-chips">${LEAGUES.map(
    (l) => `<li>${esc(l.name)} <span class="pr-tier">${esc(l.tier)}</span></li>`
  ).join('')}</ul>`

// ── Constructores de contenido por ruta ─────────────────────────────────────

const sectionHtml = (s) => {
  let html = `<h2>${esc(s.h)}</h2>`
  if (s.p) html += `<p>${esc(s.p)}</p>`
  if (s.list) html += `<ul>${s.list.map((i) => `<li><strong>${esc(i.t)}</strong> — ${esc(i.d)}</li>`).join('')}</ul>`
  if (s.note) html += `<p class="pr-note">${esc(s.note)}</p>`
  return html
}

const guidePage = (g) => {
  const item = guides.items[g.key]
  const related = GUIDES.filter((o) => o.key !== g.key)
  return {
    path: `/guias/${g.slug}`,
    title: `${item.title} — Pro Fantasy`,
    description: item.excerpt,
    body: `
      <p><a href="/guias">← Volver a las guías</a></p>
      <h1>${esc(item.title)}</h1>
      <p class="pr-lead">${esc(item.intro)}</p>
      ${item.sections.map(sectionHtml).join('')}
      <h2>Otras guías</h2>
      <ul>${related.map((o) => `<li><a href="/guias/${o.slug}">${esc(guides.items[o.key].title)}</a></li>`).join('')}</ul>`,
  }
}

// El hub de modos de juego vive en `/`; `/gaming` fue su URL original y se
// conserva como alias en el router (hay enlaces y marcadores apuntando ahí).
// Se sigue prerenderizando para que esa URL indexada no sirva un shell vacío,
// pero declara `/` como canónica: es la misma pantalla, y las señales deben
// consolidarse en la raíz.
//
// En la app viva son tres tarjetas con un subtítulo de cuatro palabras cada
// una: prerenderizar eso tal cual produciría justo la "pantalla sin contenido"
// que este script existe para evitar. Así que la versión estática combina los
// títulos reales de la app con el excerpt de la guía de cada modo y enlaza a
// ellas, sin inventar copy nuevo.
const gamingPage = () => {
  const gaming = readJson('src/locales/es/fantasy.json').gaming
  const survivorSub = readJson('src/locales/es/survivor.json').gaming.subtitle
  const modes = [
    { title: gaming.fantasy.title, sub: gaming.fantasy.subtitle, guide: 'fantasy' },
    { title: gaming.pools.title, sub: gaming.pools.subtitle, guide: 'quiniela' },
    { title: 'Survivor', sub: survivorSub, guide: 'survivor' },
  ]
  return {
    path: '/gaming',
    canonical: '/',
    title: 'Juegos — Fantasy, quinielas y Survivor | Pro Fantasy',
    description:
      'Los tres modos de juego de Pro Fantasy: fantasy con draft en vivo, quinielas de marcador exacto y Survivor por eliminación. La Liga MX gratis; Europa con Premium.',
    body: `
      <h1>Modos de juego</h1>
      <p class="pr-lead">Tres formas de competir con tus amigos durante toda la temporada,
      en Liga MX, Premier League, LaLiga, Serie A y Bundesliga.</p>
      <p>Los tres modos se juegan completos en la Liga MX sin pagar nada. Las cuatro
      competencias europeas forman parte de Premium.</p>
      ${chips()}
      ${modes
        .map((m) => {
          const g = GUIDES.find((x) => x.key === m.guide)
          return `<h2>${esc(m.title)}</h2>
            <p>${esc(m.sub)}. ${esc(guides.items[m.guide].excerpt)}</p>
            <p><a href="/guias/${g.slug}">Cómo se juega ${esc(m.title)} paso a paso</a></p>`
        })
        .join('')}
      <h2>Empieza a jugar</h2>
      <p>Se juega desde el navegador o instalando la app, y la Liga MX no pide tarjeta ni
      suscripción. <a href="/guias">Consulta las guías</a> para aprender las reglas antes de
      tu primera jornada, o revisa
      <a href="/guias/preguntas-frecuentes">qué incluye Premium</a> si quieres las ligas de Europa.</p>`,
  }
}

// Landing pública de Premium.
//
// A propósito SIN precios: el catálogo vive en Stripe y esta página se genera en
// el build, así que hornear una cifra aquí dejaría publicado un precio viejo en
// cuanto se cambie en el panel — y un precio equivocado en una página indexada
// es peor que no enseñar ninguno. La versión viva los pide a
// `catalog/subscription/plans` y los pinta al montar; lo estático se queda con
// lo que no caduca: qué incluye, la comparativa y las dudas.
const premiumPage = () => {
  const rows = premium.compare.rows
  const includeKeys = ['leagues', 'scoring', 'capacity', 'survivor', 'tools', 'guests']
  return {
    path: '/premium/planes',
    title: premium.meta.title,
    description: premium.meta.description,
    body: `
      <h1>${esc(premium.heading)}</h1>
      <p class="pr-lead">${esc(premium.subheading)}</p>
      ${chips()}
      <h2>${esc(premium.includes.heading)}</h2>
      <p>${esc(premium.includes.subheading)}</p>
      <ul>${includeKeys
        .map((k) => {
          const item = premium.includes.items[k]
          return `<li><strong>${esc(item.title)}</strong> — ${esc(item.detail)}</li>`
        })
        .join('')}</ul>
      <h2>${esc(premium.compare.heading)}</h2>
      <ul>${rows
        .map(
          (r) =>
            `<li><strong>${esc(r.feature)}</strong> — ${esc(premium.compare.free)}: ${esc(r.free)} · ${esc(premium.compare.premium)}: ${esc(r.premium)}</li>`
        )
        .join('')}</ul>
      <h2>${esc(premium.plans.heading)}</h2>
      <p>${esc(premium.plans.subheading)} ${esc(premium.plans.note)}</p>
      <h2>${esc(premium.faq.heading)}</h2>
      ${premium.faq.items.map((i) => `<h3>${esc(i.q)}</h3><p>${esc(i.a)}</p>`).join('')}
      <p class="pr-note">${esc(premium.subheading)}
      <a href="/guias/preguntas-frecuentes">Más preguntas frecuentes</a>.</p>`,
  }
}

const guidesHub = () => ({
  path: '/guias',
  title: 'Guías y reglas — Pro Fantasy',
  description: guides.hub.subtitle,
  body: `
    <h1>${esc(guides.hub.title)}</h1>
    <p class="pr-lead">${esc(guides.hub.subtitle)}</p>
    ${chips()}
    <ul>${GUIDES.map(
      (g) =>
        `<li><a href="/guias/${g.slug}">${esc(guides.items[g.key].title)}</a><br>${esc(guides.items[g.key].excerpt)} <em>(${g.minRead} min de lectura)</em></li>`
    ).join('')}</ul>`,
})

const aboutPage = () => {
  const modes = ['follow', 'fantasy', 'pool', 'survivor']
  const feats = ['free', 'mobile', 'realtime', 'friends']
  const steps = ['step1', 'step2', 'step3']
  return {
    path: '/about',
    title: 'Acerca de Pro Fantasy — Fantasy, quinielas y Survivor de 5 grandes ligas',
    description: about.subtitle,
    body: `
      <h1>${esc(about.heading)}</h1>
      <p class="pr-lead">${esc(about.subtitle)}</p>
      ${chips()}
      <h2>${esc(about.intro.heading)}</h2>
      <p>${esc(about.intro.p1)}</p>
      <p>${esc(about.intro.p2)}</p>
      <h2>${esc(about.modes.heading)}</h2>
      <p>${esc(about.modes.subtitle)}</p>
      <ul>${modes.map((m) => `<li><strong>${esc(about.modes[m].title)}</strong> — ${esc(about.modes[m].desc)}</li>`).join('')}</ul>
      <h2>${esc(about.how.heading)}</h2>
      <ul>${steps.map((s) => `<li><strong>${esc(about.how[s].title)}</strong> — ${esc(about.how[s].desc)}</li>`).join('')}</ul>
      <h2>${esc(about.features.heading)}</h2>
      <ul>${feats.map((f) => `<li><strong>${esc(about.features[f].title)}</strong> — ${esc(about.features[f].desc)}</li>`).join('')}</ul>
      <h2>${esc(about.responsible.heading)}</h2>
      <p>${esc(about.responsible.text)}</p>
      <p><a href="/guias">Lee nuestras guías y aprende a jugar</a> · <a href="/premium/planes">${esc(about.premiumLink)}</a> · <a href="/privacy">Aviso de privacidad</a></p>`,
  }
}

const landingPage = () => {
  const featKeys = ['live', 'fantasy', 'pools', 'survivor', 'versus', 'pwa', 'premium']
  const stepKeys = ['one', 'two', 'three']
  const statKeys = ['leagues', 'modes', 'free']
  return {
    path: '/landingpage',
    title: landing.meta.title,
    description: landing.meta.description,
    body: `
      <h1>${esc(landing.hero.titleLine1)} ${esc(landing.hero.titleLine2)}</h1>
      <p class="pr-lead">${esc(landing.hero.subtitle)}</p>
      <p>${esc(landing.hero.leaguesLabel)}:</p>
      ${chips()}
      <ul>${statKeys.map((k) => `<li><strong>${esc(landing.stats[k].value)}</strong> — ${esc(landing.stats[k].label)}</li>`).join('')}</ul>
      <h2>${esc(landing.features.title)}</h2>
      <p>${esc(landing.features.subtitle)}</p>
      <ul>${featKeys.map((k) => `<li><strong>${esc(landing.features.items[k].title)}</strong> — ${esc(landing.features.items[k].body)}</li>`).join('')}</ul>
      <h2>${esc(landing.how.title)}</h2>
      <p>${esc(landing.how.subtitle)}</p>
      <ul>${stepKeys.map((k) => `<li><strong>${esc(landing.how.steps[k].title)}</strong> — ${esc(landing.how.steps[k].body)}</li>`).join('')}</ul>
      <h2>${esc(landing.cta.title)}</h2>
      <p>${esc(landing.cta.subtitle)}</p>
      <p><a href="/register">${esc(landing.cta.button)}</a> · <a href="/login">${esc(landing.cta.secondary)}</a></p>`,
  }
}

// El aviso de privacidad vive como HTML plano dentro del SFC: extraemos el
// <article> y resolvemos las interpolaciones {{ company.* }} con el mismo
// objeto `company` del componente.
const privacyPage = () => {
  const sfc = readFileSync(resolve(root, 'src/views/legal/PrivacyView.vue'), 'utf8')
  const articleMatch = sfc.match(/<article[^>]*>([\s\S]*?)<\/article>/)
  const companyMatch = sfc.match(/const company = \{([\s\S]*?)\};/)
  if (!articleMatch || !companyMatch) throw new Error('prerender: no pude extraer el aviso de privacidad')
  const company = Object.fromEntries(
    [...companyMatch[1].matchAll(/(\w+):\s*"([^"]*)"/g)].map(([, k, v]) => [k, v])
  )
  const article = articleMatch[1].replace(/\{\{\s*company\.(\w+)\s*\}\}/g, (_, k) => esc(company[k] ?? ''))
  return {
    path: '/privacy',
    title: 'Aviso de Privacidad — Pro Fantasy',
    description: 'Aviso de privacidad de Pro Fantasy conforme a la LFPDPPP: qué datos recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.',
    body: `<h1>Aviso de Privacidad</h1>
      <p class="pr-lead">Última actualización: ${esc(company.lastUpdated ?? '')}</p>
      ${article}`,
  }
}

// ── Generación ──────────────────────────────────────────────────────────────

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="app">')) throw new Error('prerender: dist/index.html sin <div id="app">')

// index.html declara canonical y og:*/twitter:* con los valores de la home.
// Aquí se REEMPLAZAN por los de cada página; añadirlos duplicaría los tags y
// dejaría a los scrapers eligiendo cuál leer. Si alguna sustitución no encaja
// el build falla, en vez de publicar en silencio la portada de la home en
// cada URL.
const sub = (html, re, value, what) => {
  if (!re.test(html)) throw new Error(`prerender: no encontré ${what} en index.html`)
  return html.replace(re, (...m) => `${m[1]}${esc(value)}${m[2]}`)
}

const metaRe = (attr, key) =>
  new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)

const withSeo = (html, page) => {
  // `canonical` permite que una página se prerenderice en su propia URL pero
  // consolide sus señales en otra (ver gamingPage). Sin él, canónica = la URL
  // de la propia página, que es el caso normal.
  const url = `${SITE}${page.canonical ?? page.path}`
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, (...m) => `${m[1]}${url}${m[2]}`)
  out = sub(out, metaRe('name', 'description'), page.description, 'meta description')
  out = sub(out, metaRe('property', 'og:url'), url, 'og:url')
  out = sub(out, metaRe('property', 'og:title'), page.title, 'og:title')
  out = sub(out, metaRe('property', 'og:description'), page.description, 'og:description')
  out = sub(out, metaRe('name', 'twitter:title'), page.title, 'twitter:title')
  out = sub(out, metaRe('name', 'twitter:description'), page.description, 'twitter:description')
  if (!out.includes(OG_IMAGE)) throw new Error('prerender: falta og:image en index.html')
  return out
}

const pages = [
  landingPage(),
  aboutPage(),
  gamingPage(),
  premiumPage(),
  guidesHub(),
  ...GUIDES.map(guidePage),
  privacyPage(),
]

for (const page of pages) {
  const content = `<div class="pr"><main>${NAV}${page.body}${FOOTER}</main></div>`
  const html = withSeo(template, page)
    .replace('</head>', `${STYLES}\n</head>`)
    .replace('<div id="app">', `<div id="app">${content}`)
  const outDir = resolve(dist, `.${page.path}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'index.html'), html)
  console.log(`prerender ✓ ${page.path}`)
}
console.log(`prerender: ${pages.length} páginas generadas`)

// ── Sitemap ─────────────────────────────────────────────────────────────────
//
// Se genera aquí y no como archivo estático en public/ para que comparta la
// única fuente de verdad de las rutas: al agregar una guía a guides.ts entra
// sola al sitemap, en vez de prerenderizarse pero quedar invisible para Google.
//
// `lastmod` sale de scripts/sitemap-stamps.json, un sello {hash, date} por URL
// que solo avanza cuando el contenido de esa página cambia de verdad. Sellar
// todas las URLs con la fecha del build es el antipatrón clásico: Google
// detecta que el lastmod no es confiable y deja de usarlo para todo el sitio.
// El archivo se commitea porque `git` no está disponible dentro del build de
// Docker (.git está en .dockerignore), así que no se puede derivar del log.
//
// `changefreq` no se emite: Google lo ignora por completo. `priority` sí se
// mantiene — Google también lo ignora, pero algunos crawlers menores lo leen y
// no cuesta nada.

const stampsRel = 'scripts/sitemap-stamps.json'
const stampsPath = resolve(root, stampsRel)
const stamps = existsSync(stampsPath) ? readJson(stampsRel) : {}
const today = new Date().toISOString().slice(0, 10)

/** Fecha del sello si el contenido sigue igual; hoy si cambió. */
const lastmodFor = (path, content) => {
  const hash = createHash('sha1').update(content).digest('hex').slice(0, 16)
  if (stamps[path]?.hash !== hash) stamps[path] = { hash, date: today }
  return stamps[path].date
}

// Ni `/` (hub de juego) ni `/liga` (datos de la liga) se prerenderizan: las
// arma Vue en el cliente. `/` no puede prerenderizarse porque su archivo sería
// dist/index.html, que es también el fallback SPA de todas las demás rutas —
// inyectarle contenido haría que cualquier ruta parpadease con el hub antes de
// montar. Así que el sello de ambas se calcula sobre los fuentes que definen lo
// que muestran.
const sourceStamp = (paths) =>
  paths.map((p) => readFileSync(resolve(root, p), 'utf8')).join('')

const homeContent = sourceStamp([
  'src/views/HomeView.vue',
  'src/components/home/GameHub.vue',
  'src/locales/es/fantasy.json',
])
const leagueContent = sourceStamp([
  'src/views/football/LeagueOverviewView.vue',
  'src/components/HomeComponent.vue',
  'src/locales/es/home.json',
])

// /landingpage y / comparten la prioridad máxima: la primera capta las
// búsquedas de descubrimiento ("qué es", "cómo jugar") y la raíz es el producto
// en sí (jugar). /liga hereda el peso que tenía la raíz cuando servía los datos
// de liga. Las guías individuales caen al valor por defecto.
const PRIORITY = {
  '/landingpage': '1.0',
  '/': '1.0',
  '/guias': '0.9',
  '/liga': '0.9',
  '/premium/planes': '0.8',
  '/about': '0.6',
  '/privacy': '0.3',
}

// El sello cubre title y description además del body: los tres son contenido
// indexable, así que reescribir un <title> también debe mover el lastmod.
//
// Las páginas con `canonical` propia (hoy /gaming → /) quedan fuera: apuntan a
// otra URL como preferente, y listar en el sitemap una página canonicalizada es
// una señal contradictoria para Google.
const urls = [
  { path: '/', content: homeContent },
  { path: '/liga', content: leagueContent },
  ...pages
    .filter((p) => !p.canonical)
    .map((p) => ({ path: p.path, content: p.title + p.description + p.body })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, content }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmodFor(path, content)}</lastmod>
    <priority>${PRIORITY[path] ?? '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(dist, 'sitemap.xml'), sitemap)
writeFileSync(stampsPath, `${JSON.stringify(stamps, null, 2)}\n`)
console.log(`sitemap: ${urls.length} URLs → dist/sitemap.xml`)
