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

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const SITE = 'https://fantasymx.cloud'

const readJson = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const guides = readJson('src/locales/es/guides.json')
const landing = readJson('src/locales/es/landing.json')
const about = readJson('src/locales/es/ui.json').about

// Slugs/keys desde guides.ts (única fuente de verdad de las URLs).
const guidesTs = readFileSync(resolve(root, 'src/views/guides/guides.ts'), 'utf8')
const GUIDES = [...guidesTs.matchAll(/\{\s*key:\s*'([^']+)',\s*slug:\s*'([^']+)'[^}]*minRead:\s*(\d+)/g)]
  .map(([, key, slug, minRead]) => ({ key, slug, minRead: Number(minRead) }))
if (GUIDES.length === 0) throw new Error('prerender: no pude leer las guías desde guides.ts')

const LEAGUES = ['Liga MX', 'Premier League', 'LaLiga', 'Serie A', 'Bundesliga']

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
html.dark .pr .pr-chips li{border-color:#4b5563}
.pr footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:.85rem;color:#6b7280}
html.dark .pr footer{border-color:#374151}
#app-splash{display:none!important}
</style>`

const NAV = `<header class="pr-nav">
  <a class="pr-brand" href="/">Fantasy MX</a>
  <nav aria-label="Secciones">
    <a href="/">Inicio</a>
    <a href="/guias">Guías y reglas</a>
    <a href="/about">Acerca de</a>
    <a href="/landingpage">Qué es Fantasy MX</a>
  </nav>
</header>`

const FOOTER = `<footer>
  <p>Fantasy MX — futbol en vivo, fantasy con draft, quinielas y Survivor para
  Liga MX, Premier League, LaLiga, Serie A y Bundesliga. Gratis.</p>
  <p><a href="/guias">Guías</a> · <a href="/about">Acerca de</a> · <a href="/privacy">Aviso de privacidad</a></p>
</footer>`

const chips = () => `<ul class="pr-chips">${LEAGUES.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`

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
    title: `${item.title} — Fantasy MX`,
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

const guidesHub = () => ({
  path: '/guias',
  title: 'Guías y reglas — Fantasy MX',
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
    title: 'Acerca de Fantasy MX — Fantasy, quinielas y Survivor de 5 grandes ligas',
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
      <p><a href="/guias">Lee nuestras guías y aprende a jugar</a> · <a href="/privacy">Aviso de privacidad</a></p>`,
  }
}

const landingPage = () => {
  const featKeys = ['live', 'fantasy', 'pools', 'survivor', 'versus', 'pwa']
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
    title: 'Aviso de Privacidad — Fantasy MX',
    description: 'Aviso de privacidad de Fantasy MX conforme a la LFPDPPP: qué datos recabamos, para qué los usamos y cómo ejercer tus derechos ARCO.',
    body: `<h1>Aviso de Privacidad</h1>
      <p class="pr-lead">Última actualización: ${esc(company.lastUpdated ?? '')}</p>
      ${article}`,
  }
}

// ── Generación ──────────────────────────────────────────────────────────────

const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="app">')) throw new Error('prerender: dist/index.html sin <div id="app">')

const pages = [landingPage(), aboutPage(), guidesHub(), ...GUIDES.map(guidePage), privacyPage()]

for (const page of pages) {
  const content = `<div class="pr"><main>${NAV}${page.body}${FOOTER}</main></div>`
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace('</head>', `${STYLES}<link rel="canonical" href="${SITE}${page.path}" />\n</head>`)
    .replace('<div id="app">', `<div id="app">${content}`)
  const outDir = resolve(dist, `.${page.path}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'index.html'), html)
  console.log(`prerender ✓ ${page.path}`)
}
console.log(`prerender: ${pages.length} páginas generadas`)
