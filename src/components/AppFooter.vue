<script lang="ts" setup>
/**
 * Footer de navegación secundaria.
 *
 * Existe por dos razones concretas:
 *
 * 1. SEO. /guias y /about solo se enlazaban desde el HTML estático de
 *    scripts/prerender.mjs — y ese HTML lo reemplaza Vue en cuanto monta. La
 *    landing de descarga vive en su propio dominio (profantasy.mx, repo
 *    profantasy): este enlace es el que le pasa autoridad desde la app.
 * 2. Legal. El aviso de privacidad tiene que ser alcanzable navegando (la
 *    LFPDPPP exige tenerlo accesible), y los términos también. Los dos viven
 *    en profantasy.mx (`@/config/legal`).
 *
 * Los enlaces internos son `router-link` reales (no botones con `router.push`)
 * para que salgan como <a href> en el DOM y los rastreadores los sigan; los que
 * salen del sitio son un <a> normal. El texto es
 * descriptivo a propósito: "Qué es Pro Fantasy" transmite más que "Más info".
 */
import { useI18n } from 'vue-i18n'
import { LEGAL_URLS } from '@/config/legal'

const { t } = useI18n()

const LINKS = [
  { key: 'landing', href: 'https://profantasy.mx/landingpage' },
  { key: 'guides', to: { name: 'guides' } },
  { key: 'about', to: { name: 'about' } },
  { key: 'privacy', href: LEGAL_URLS.privacy },
  { key: 'terms', href: LEGAL_URLS.terms },
  // Google Play exige que el enlace de borrado de cuenta sea alcanzable desde
  // el sitio, no solo desde la ficha de la tienda.
  { key: 'deleteAccount', to: { name: 'deleteAccount' } },
] as const

const LINK_CLASS =
  'rounded text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-gray-400 dark:hover:text-primary-400'

const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="app-footer border-t border-gray-200 bg-white px-4 pt-8 dark:border-gray-800 dark:bg-gray-900"
  >
    <nav
      :aria-label="t('ui.footer.navLabel')"
      class="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3"
    >
      <template v-for="link in LINKS" :key="link.key">
        <a v-if="'href' in link" :href="link.href" :class="LINK_CLASS">
          {{ t(`ui.footer.links.${link.key}`) }}
        </a>
        <router-link v-else :to="link.to" :class="LINK_CLASS">
          {{ t(`ui.footer.links.${link.key}`) }}
        </router-link>
      </template>
    </nav>

    <p class="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
      &copy; {{ year }} Pro Fantasy · {{ t('ui.footer.tagline') }}
    </p>
  </footer>
</template>

<style lang="scss" scoped>
/**
 * Varias vistas montan un BottomNavBar `fixed` (pools, survivor, ligas fantasy,
 * home). El padding inferior del <main> global no lo cubre porque el footer
 * queda fuera de él, así que se reserva aquí el alto de esa barra más el safe
 * area del dispositivo.
 */
.app-footer {
  padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    padding-bottom: calc(2.5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
