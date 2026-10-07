<template>
  <div class="landing">
    <!-- ───────────────────────── Navegación ───────────────────────── -->
    <header class="nav" :class="{ 'is-scrolled': scrolled }">
      <nav class="lp-container nav__inner" :aria-label="t('landing.nav.label')">
        <a href="#top" class="nav__brand">
          <img :src="APP_ICON" width="36" height="36" alt="" class="nav__icon" />
          <span>{{ t('landing.brand') }}</span>
        </a>

        <ul class="nav__links">
          <li><a href="#capturas">{{ t('landing.nav.screens') }}</a></li>
          <li><a href="#video">{{ t('landing.nav.video') }}</a></li>
          <li><a href="#modos">{{ t('landing.nav.modes') }}</a></li>
        </ul>

        <div class="nav__actions">
          <router-link :to="{ name: 'login' }" class="nav__login">
            {{ t('landing.nav.login') }}
          </router-link>
          <a :href="APP_STORE.link" target="_blank" rel="noopener" class="nav__get">
            {{ t('landing.nav.download') }}
          </a>
        </div>
      </nav>
    </header>

    <main>
      <!-- ───────────── La ficha: encabezado + capturas ───────────── -->
      <section id="top" class="hero" aria-labelledby="hero-title">
        <div class="hero__ground" aria-hidden="true">
          <!-- El área grande de una cancha, en línea fina: la misma que asoma
               detrás de las capturas de la tienda. -->
          <svg class="hero__pitch" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMin meet">
            <rect x="290" y="-4" width="620" height="236" />
            <rect x="460" y="-4" width="280" height="92" />
            <path d="M494 232a124 124 0 0 0 212 0" />
          </svg>
        </div>

        <div class="lp-container hero__head">
          <div class="hero__identity">
            <img
              :src="APP_ICON"
              width="112"
              height="112"
              alt=""
              class="hero__icon"
            />
            <div class="hero__copy">
              <h1 id="hero-title" class="hero__title">
                <span class="hero__line">{{ t('landing.hero.titleLine1') }}</span>
                <span class="hero__line hero__line--lime">{{ t('landing.hero.titleLine2') }}</span>
              </h1>
              <p class="hero__sub">{{ t('landing.hero.subtitle') }}</p>

              <dl class="facts">
                <div v-for="fact in facts" :key="fact" class="facts__cell">
                  <dt>{{ t(`landing.hero.facts.${fact}.label`) }}</dt>
                  <dd>{{ t(`landing.hero.facts.${fact}.value`) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div ref="heroDownload" class="hero__download">
            <DownloadCluster />
          </div>
        </div>

        <div id="capturas" class="hero__screens">
          <h2 class="sr-only">{{ t('landing.screens.title') }}</h2>
          <ScreenshotRail />
        </div>
      </section>

      <!-- ───────────────────── App Preview ───────────────────── -->
      <section id="video" class="section section--preview" aria-labelledby="preview-title">
        <div class="lp-container">
          <AppPreview @stage-visible="previewInView = $event">
            <template #intro>
              <h2 id="preview-title" class="h2">{{ t('landing.preview.title') }}</h2>
              <p class="lead">{{ t('landing.preview.body') }}</p>
            </template>
          </AppPreview>
        </div>
      </section>

      <!-- ─────────────── Descripción e información ─────────────── -->
      <section id="modos" class="section section--modes" aria-labelledby="modes-title">
        <div class="lp-container modes">
          <div class="modes__copy">
            <h2 id="modes-title" class="h2">{{ t('landing.modes.title') }}</h2>
            <div class="modes__list">
              <p v-for="mode in modes" :key="mode" class="modes__item">
                <strong>{{ t(`landing.modes.items.${mode}.name`) }}.</strong>
                {{ t(`landing.modes.items.${mode}.body`) }}
              </p>
            </div>
          </div>

          <div class="modes__info">
            <h3 class="h3">{{ t('landing.modes.info.title') }}</h3>
            <dl class="info">
              <div v-for="row in infoRows" :key="row" class="info__row">
                <dt>{{ t(`landing.modes.info.${row}.label`) }}</dt>
                <dd>{{ t(`landing.modes.info.${row}.value`) }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ t('landing.modes.info.web.label') }}</dt>
                <dd>
                  <a :href="appUrl()" class="info__link">
                    {{ t('landing.modes.info.web.value') }}
                    <LandingIcon name="arrow-right" class="info__arrow" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- ──────────────────────── Cierre ──────────────────────── -->
      <section class="closing" aria-labelledby="closing-title">
        <div class="lp-container closing__inner">
          <img :src="APP_ICON" width="120" height="120" alt="" class="closing__icon" loading="lazy" />
          <h2 id="closing-title" class="closing__title">
            {{ t('landing.cta.titleA') }}
            <span class="closing__lime">{{ t('landing.cta.titleB') }}</span>
            {{ t('landing.cta.titleC') }}
          </h2>
          <p class="closing__sub">{{ t('landing.cta.body') }}</p>
          <div ref="closingDownload" class="closing__download">
            <DownloadCluster align="center" />
          </div>
        </div>
      </section>
    </main>

    <!-- ──────────────────────── Pie ──────────────────────── -->
    <footer ref="footer" class="footer">
      <div class="lp-container footer__inner">
        <div class="footer__brand">
          <img :src="APP_ICON" width="32" height="32" alt="" loading="lazy" />
          <span>{{ t('landing.brand') }}</span>
        </div>
        <ul class="footer__links">
          <li v-for="link in footerLinks" :key="link.key">
            <router-link :to="{ name: link.route }">{{ t(`landing.footer.${link.key}`) }}</router-link>
          </li>
        </ul>
        <div class="footer__legal">
          <p>© {{ currentYear }} {{ t('landing.brand') }}. {{ t('landing.footer.rights') }}</p>
          <p>{{ t('landing.footer.trademarks') }}</p>
        </div>
      </div>
    </footer>

    <GetAppBar :visible="showGetBar" />
  </div>
</template>

<script setup lang="ts">
import './landing-font.css'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppPreview from '@/components/landing/AppPreview.vue'
import DownloadCluster from '@/components/landing/DownloadCluster.vue'
import GetAppBar from '@/components/landing/GetAppBar.vue'
import LandingIcon from '@/components/landing/LandingIcon.vue'
import ScreenshotRail from '@/components/landing/ScreenshotRail.vue'
import { appUrl } from '@/config/site'
import { APP_ICON, APP_STORE } from './landingContent'

const { t } = useI18n()
const currentYear = new Date().getFullYear()

const facts = ['price', 'category', 'devices'] as const
const modes = ['fantasy', 'pools', 'survivor'] as const
const infoRows = ['price', 'leagues', 'compatibility', 'android'] as const
const footerLinks = [
  { key: 'guides', route: 'guides' },
  { key: 'premium', route: 'premiumPlans' },
  { key: 'about', route: 'about' },
  { key: 'privacy', route: 'privacy' },
  { key: 'login', route: 'login' },
] as const

// ── El navegador también se viste de noche ───────────────────────────────
// Mientras la landing está montada, el lienzo detrás de la página (lo que se
// ve al estirar el scroll en iOS), la barra del navegador (`theme-color`) y
// los controles nativos son oscuros; al salir se devuelve lo que había.
const NIGHT = '#0b0b0b'
const root = document.documentElement
const themeMetas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'))
const previousChrome = {
  themes: themeMetas.map((meta) => meta.content),
  rootBackground: root.style.backgroundColor,
  bodyBackground: document.body.style.backgroundColor,
  colorScheme: root.style.colorScheme,
}

// ── Navegación con fondo al bajar ────────────────────────────────────────
const scrolled = ref(false)
let scrollFrame = 0
function onScroll() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    scrolled.value = window.scrollY > 8
  })
}

// ── La barra de "Obtener" (solo teléfono y tableta) ──────────────────────
// Se muestra cuando ninguna de las dos descargas ni el pie están a la vista,
// solo después de haber pasado la del encabezado, y nunca encima del teléfono
// del video: en un iPhone el teléfono ocupa casi toda la pantalla y la barra
// le taparía el rótulo de cada escena.
const heroDownload = ref<HTMLElement | null>(null)
const closingDownload = ref<HTMLElement | null>(null)
const footer = ref<HTMLElement | null>(null)
const anchorsInView = ref(false)
const pastHero = ref(false)
const previewInView = ref(false)
const showGetBar = computed(() => pastHero.value && !anchorsInView.value && !previewInView.value)
let barObserver: IntersectionObserver | null = null
const inView = new Set<Element>()

onMounted(() => {
  themeMetas.forEach((meta) => (meta.content = NIGHT))
  root.style.backgroundColor = NIGHT
  document.body.style.backgroundColor = NIGHT
  root.style.colorScheme = 'dark'

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  const targets = [heroDownload.value, closingDownload.value, footer.value].filter(
    (el): el is HTMLElement => el !== null,
  )
  if (!('IntersectionObserver' in window) || targets.length === 0) return
  barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) inView.add(entry.target)
      else inView.delete(entry.target)
    })
    anchorsInView.value = inView.size > 0
    pastHero.value = (heroDownload.value?.getBoundingClientRect().bottom ?? 0) < 0
  })
  targets.forEach((el) => barObserver!.observe(el))
})

onBeforeUnmount(() => {
  themeMetas.forEach((meta, i) => (meta.content = previousChrome.themes[i]))
  root.style.backgroundColor = previousChrome.rootBackground
  document.body.style.backgroundColor = previousChrome.bodyBackground
  root.style.colorScheme = previousChrome.colorScheme

  window.removeEventListener('scroll', onScroll)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  barObserver?.disconnect()
})
</script>

<style scoped>
/* ── Tokens del mundo "Noche lima" ────────────────────────────────────────
   Salen de la guía de marca (Palette en el móvil, Color.kt): la página es
   siempre oscura, como la app en modo oscuro, sin importar el tema de la web. */
.landing {
  --lp-ground: #0b0b0b;
  --lp-ground-2: #131313;
  --lp-surface: #212121;
  --lp-surface-2: #2b2b2b;
  --lp-line: #2b2b2b;
  --lp-line-strong: #414141;
  --lp-ink: #f9f9f9;
  --lp-ink-2: #d6d6d6;
  --lp-ink-3: #b1b1b1;
  --lp-ink-4: #858585;
  --lp-blue-deep: #0025aa;
  --lp-blue: #0137d2;
  --lp-lime: #b4e70e;
  --lp-lime-ink: #212121;
  --lp-max: 80rem;
  --lp-gutter: clamp(1.25rem, 4vw, 2.5rem);
  --lp-nav: 4rem;

  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  color: var(--lp-ink);
  background: var(--lp-ground);
  font-family: 'Montserrat Variable', 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-weight: 500;
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color-scheme: dark;
}
.landing ::selection {
  color: var(--lp-lime-ink);
  background: var(--lp-lime);
}
.landing :deep(a),
.landing :deep(button) {
  -webkit-tap-highlight-color: transparent;
}

.lp-container {
  width: 100%;
  max-width: var(--lp-max);
  margin-inline: auto;
  padding-inline: var(--lp-gutter);
}

.h2 {
  margin: 0;
  font-size: clamp(2rem, 1.35rem + 2.3vw, 3rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.03em;
  text-wrap: balance;
}
.h3 {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.lead {
  margin: 1.25rem 0 0;
  max-width: 34rem;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--lp-ink-2);
  text-wrap: pretty;
}

/* ── Navegación ───────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid transparent;
  transition:
    background-color 200ms ease,
    border-color 200ms ease;
}
/* Opaca: con cualquier transparencia, los titulares blancos que pasan por
   debajo se leen como un fantasma detrás de la marca. */
.nav.is-scrolled {
  background: var(--lp-ground);
  border-bottom-color: var(--lp-line);
}
.nav__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: var(--lp-nav);
}
.nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--lp-ink);
}
.nav__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.55rem;
}
.nav__links {
  display: none;
  gap: 2rem;
  margin: 0 0 0 1.5rem;
  padding: 0;
  list-style: none;
}
.nav__links a,
.nav__login {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lp-ink-3);
  transition: color 160ms ease;
}
.nav__links a:hover,
.nav__login:hover {
  color: var(--lp-ink);
}
.nav__actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: auto;
}
.nav__get {
  display: none;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--lp-lime-ink);
  background: var(--lp-lime);
  transition: filter 160ms ease;
}
.nav__get:hover {
  filter: brightness(1.06);
}
.nav__brand:focus-visible,
.nav__links a:focus-visible,
.nav__login:focus-visible,
.nav__get:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 4px;
  border-radius: 0.5rem;
}
.nav__get:focus-visible {
  border-radius: 999px;
  outline-color: var(--lp-ink);
}

/* ── La ficha ─────────────────────────────────────────────────────────── */
.hero {
  position: relative;
  isolation: isolate;
  margin-top: calc(var(--lp-nav) * -1);
  padding: calc(var(--lp-nav) + 1.75rem) 0 0;
}
/* La luz del estadio: entra desde la esquina superior derecha, como en las
   capturas de la tienda, y alcanza la parte alta del carrusel. */
.hero__ground {
  position: absolute;
  inset: 0 0 auto;
  z-index: -1;
  height: min(62rem, 100%);
  overflow: hidden;
  background:
    radial-gradient(66rem 46rem at 90% -14%, rgba(1, 55, 210, 0.66), rgba(0, 37, 170, 0.26) 46%, transparent 76%),
    radial-gradient(44rem 30rem at 4% -6%, rgba(0, 37, 170, 0.34), transparent 72%);
  -webkit-mask-image: linear-gradient(to bottom, #000 68%, transparent);
  mask-image: linear-gradient(to bottom, #000 68%, transparent);
}
.hero__pitch {
  position: absolute;
  top: 0;
  left: 50%;
  width: min(100%, 75rem);
  aspect-ratio: 1200 / 420;
  transform: translateX(-50%);
  fill: none;
  stroke: rgba(249, 249, 249, 0.07);
  stroke-width: 1.5;
}
.hero__pitch * {
  vector-effect: non-scaling-stroke;
}

.hero__head {
  display: grid;
  gap: 2rem;
}
.hero__identity {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.hero__icon {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1.05rem;
  box-shadow: 0 14px 36px -12px rgba(1, 55, 210, 0.75);
}
.hero__title {
  margin: 0;
  font-size: clamp(2.5rem, 1.15rem + 4.4vw, 4rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.035em;
}
.hero__line {
  display: block;
}
.hero__line--lime {
  color: var(--lp-lime);
}
.hero__sub {
  margin: 1.1rem 0 0;
  max-width: 33rem;
  font-size: clamp(1rem, 0.94rem + 0.3vw, 1.125rem);
  line-height: 1.6;
  color: var(--lp-ink-2);
  text-wrap: pretty;
}

/* La tira de datos de la ficha (precio, categoría, dispositivos). */
.facts {
  display: flex;
  flex-wrap: wrap;
  margin: 1.5rem 0 0;
}
.facts__cell {
  padding: 0 1.1rem;
  border-left: 1px solid var(--lp-line-strong);
}
.facts__cell:first-child {
  padding-left: 0;
  border-left: 0;
}
.facts dt {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lp-ink-4);
}
.facts dd {
  margin: 0.2rem 0 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--lp-ink);
}

.hero__screens {
  margin-top: 3rem;
  scroll-margin-top: calc(var(--lp-nav) + 1rem);
}

/* ── Secciones ────────────────────────────────────────────────────────── */
.section {
  padding-block: clamp(4.5rem, 3rem + 5vw, 7.5rem);
  scroll-margin-top: var(--lp-nav);
}
.section--preview {
  padding-top: clamp(4rem, 2.75rem + 3.5vw, 6rem);
}
.section--modes {
  background: var(--lp-ground-2);
  border-block: 1px solid var(--lp-line);
}

/* ── Descripción + información ────────────────────────────────────────── */
.modes {
  display: grid;
  gap: 3.5rem;
}
.modes__list {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
  max-width: 38rem;
}
.modes__item {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--lp-ink-2);
  text-wrap: pretty;
}
.modes__item strong {
  font-weight: 800;
  color: var(--lp-ink);
}
.info {
  margin: 1rem 0 0;
  border-top: 1px solid var(--lp-line);
}
.info__row {
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 1rem;
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--lp-line);
  font-size: 0.9375rem;
  line-height: 1.5;
}
.info dt {
  font-weight: 600;
  color: var(--lp-ink-4);
}
.info dd {
  margin: 0;
  font-weight: 600;
  color: var(--lp-ink);
}
.info__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--lp-ink-2);
  text-decoration: underline;
  text-decoration-color: var(--lp-line-strong);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 0.3em;
  transition:
    color 160ms ease,
    text-decoration-color 160ms ease;
}
.info__link:hover {
  color: var(--lp-ink);
  text-decoration-color: var(--lp-lime);
}
.info__arrow {
  font-size: 1.05rem;
  color: var(--lp-lime);
}
.info__link:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 3px;
  border-radius: 0.25rem;
}

/* ── Cierre ───────────────────────────────────────────────────────────── */
.closing {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: clamp(5rem, 3.5rem + 6vw, 8.5rem);
}
/* Las luces del estadio, ahora desde abajo. */
.closing::before {
  content: '';
  position: absolute;
  inset: auto -10% -40% -10%;
  z-index: -1;
  height: 80%;
  background: radial-gradient(closest-side, rgba(1, 55, 210, 0.45), rgba(0, 37, 170, 0.15) 55%, transparent);
  pointer-events: none;
}
.closing__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.closing__icon {
  width: 6rem;
  height: 6rem;
  border-radius: 1.4rem;
  box-shadow: 0 20px 50px -16px rgba(1, 55, 210, 0.8);
}
.closing__title {
  margin: 1.75rem 0 0;
  font-size: clamp(2.25rem, 1.2rem + 3.6vw, 4rem);
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: -0.035em;
  text-wrap: balance;
}
.closing__lime {
  color: var(--lp-lime);
}
.closing__sub {
  margin: 1rem 0 0;
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--lp-ink-2);
}
.closing__download {
  margin-top: 2.5rem;
}

/* ── Pie ──────────────────────────────────────────────────────────────── */
.footer {
  border-top: 1px solid var(--lp-line);
  padding: 2.5rem 0 calc(2.5rem + env(safe-area-inset-bottom, 0px));
}
.footer__inner {
  display: grid;
  gap: 1.5rem;
}
.footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
}
.footer__brand img {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
}
.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.footer__links a {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lp-ink-3);
  transition: color 160ms ease;
}
.footer__links a:hover {
  color: var(--lp-ink);
}
.footer__links a:focus-visible {
  outline: 2px solid var(--lp-lime);
  outline-offset: 3px;
  border-radius: 0.25rem;
}
.footer__legal {
  display: grid;
  gap: 0.35rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--lp-ink-4);
}
.footer__legal p {
  margin: 0;
  max-width: 60rem;
}

/* ── Tableta ──────────────────────────────────────────────────────────── */
@media (min-width: 640px) {
  .nav__get {
    display: inline-flex;
  }
  .hero__identity {
    flex-direction: row;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .hero__icon {
    width: 6rem;
    height: 6rem;
    border-radius: 1.35rem;
  }
}

/* ── Escritorio ───────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .nav__links {
    display: flex;
  }
  .hero {
    padding-top: calc(var(--lp-nav) + 3rem);
  }
  .hero__icon {
    width: 7rem;
    height: 7rem;
    border-radius: 1.6rem;
  }
  .hero__identity {
    gap: 1.75rem;
  }
  .modes {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: clamp(3rem, 6vw, 6rem);
    align-items: start;
  }
  .modes__info {
    padding-top: 0.5rem;
  }
  .footer__inner {
    grid-template-columns: auto 1fr;
    align-items: center;
  }
  .footer__links {
    justify-content: flex-end;
  }
  .footer__legal {
    grid-column: 1 / -1;
    padding-top: 1.25rem;
    border-top: 1px solid var(--lp-line);
  }
}

/* La fila de la ficha: identidad a la izquierda, descarga a la derecha. Antes
   de 1200 px no caben las dos sin partir el titular en tres renglones. */
@media (min-width: 1200px) {
  .hero__head {
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 3rem;
    align-items: start;
  }
  .hero__download {
    padding-top: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav,
  .nav__links a,
  .nav__login,
  .nav__get,
  .info__link,
  .footer__links a {
    transition: none;
  }
}
</style>
