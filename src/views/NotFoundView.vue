<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

/**
 * Destinos públicos a los que puede llegar cualquiera (con o sin sesión) desde
 * el 404. Todos apuntan a rutas sin `requiresAuth`, para que ningún enlace de
 * recuperación acabe rebotando al login.
 */
const RECOVERY_LINKS = [
  { key: 'home', icon: 'bi-trophy-fill', to: { name: 'home' } },
  { key: 'results', icon: 'hi-solid-chart-bar', to: { name: 'leagueOverview' } },
  { key: 'guides', icon: 'hi-solid-academic-cap', to: { name: 'guides' } },
  {
    key: 'faq',
    icon: 'hi-solid-information-circle',
    to: { name: 'guideDetail', params: { slug: 'preguntas-frecuentes' } },
  },
] as const

/**
 * `history.state.back` lo escribe vue-router en cada navegación interna: si es
 * null el usuario aterrizó aquí directo (link externo, buscador, PWA recién
 * abierta) y "Volver" lo sacaría del sitio, así que se oculta.
 */
const canGoBack = computed(() => window.history.state?.back != null)

/** Ruta que falló, recortada para que una URL larga no rompa el layout. */
const requestedPath = computed(() => {
  const path = route.fullPath
  return path.length > 64 ? `${path.slice(0, 64)}…` : path
})

function goHome() {
  // replace: el 404 no debe quedarse en el historial.
  router.replace({ name: 'home' })
}

function goBack() {
  router.go(-1)
}

// Un 404 nunca debe indexarse. Como la app es un SPA servido con index.html
// (HTTP 200 para cualquier ruta), sin esto Google la trata como "soft 404" y
// puede indexar URLs inexistentes.
let robotsMeta: HTMLMetaElement | null = null

onMounted(() => {
  robotsMeta = document.createElement('meta')
  robotsMeta.name = 'robots'
  robotsMeta.content = 'noindex, follow'
  document.head.appendChild(robotsMeta)
})

onBeforeUnmount(() => {
  robotsMeta?.remove()
  robotsMeta = null
})
</script>

<template>
  <div
    class="not-found relative isolate flex flex-col items-center justify-center overflow-hidden bg-gray-50 px-4 py-10 dark:bg-gray-900"
  >
    <!-- ───────────── Fondo: cancha ───────────── -->
    <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div
        class="absolute inset-0 bg-gradient-to-b from-primary-50 via-gray-50 to-gray-50 dark:from-primary-900/30 dark:via-gray-900 dark:to-gray-900"
      />
      <div
        class="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10"
      />
      <svg
        class="absolute inset-0 h-full w-full text-primary-700/[0.07] dark:text-primary-300/[0.07]"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <line x1="0" y1="300" x2="800" y2="300" stroke="currentColor" stroke-width="3" />
        <circle cx="400" cy="300" r="120" stroke="currentColor" stroke-width="3" />
        <circle cx="400" cy="300" r="8" fill="currentColor" />
        <rect x="250" y="-70" width="300" height="130" stroke="currentColor" stroke-width="3" />
        <rect x="250" y="540" width="300" height="130" stroke="currentColor" stroke-width="3" />
      </svg>
    </div>

    <div class="w-full max-w-2xl text-center">
      <!-- ───────────── Badge ───────────── -->
      <span
        class="reveal reveal-1 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 shadow-soft ring-1 ring-primary-200/70 backdrop-blur dark:bg-primary-900/40 dark:text-primary-300 dark:ring-primary-700/40"
      >
        <v-icon name="hi-solid-exclamation" class="h-3.5 w-3.5" />
        {{ t('errors.notFound.badge') }}
      </span>

      <!-- ───────────── 4 ⚽ 4 ───────────── -->
      <div
        class="reveal reveal-2 mt-6 flex items-center justify-center gap-2 sm:gap-4"
        aria-hidden="true"
      >
        <span class="digit">4</span>
        <span class="ball-bob grid place-items-center">
          <v-icon
            name="gi-soccer-ball"
            class="ball-spin h-20 w-20 text-gray-800 drop-shadow-lg sm:h-28 sm:w-28 dark:text-white"
          />
        </span>
        <span class="digit">4</span>
      </div>

      <!-- ───────────── Mensaje ───────────── -->
      <h1
        class="reveal reveal-3 mt-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white"
      >
        {{ t('errors.notFound.title') }}
      </h1>
      <p
        class="reveal reveal-3 mx-auto mt-4 max-w-lg text-base leading-relaxed text-gray-600 dark:text-gray-300"
      >
        {{ t('errors.notFound.subtitle') }}
      </p>

      <p class="reveal reveal-3 mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span class="text-gray-500 dark:text-gray-400">{{ t('errors.notFound.requestedPath') }}</span>
        <code
          class="max-w-full truncate rounded-lg bg-gray-200/70 px-2 py-1 font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >{{ requestedPath }}</code>
      </p>

      <!-- ───────────── Acciones ───────────── -->
      <div class="reveal reveal-4 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          @click="goHome"
          class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        >
          <v-icon name="hi-solid-home" class="h-5 w-5" />
          {{ t('errors.notFound.goHome') }}
        </button>

        <button
          v-if="canGoBack"
          type="button"
          @click="goBack"
          class="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white/80 px-6 py-3 font-semibold text-gray-700 ring-1 ring-gray-300 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:bg-gray-800/80 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
        >
          <v-icon name="hi-solid-arrow-left" class="h-5 w-5" />
          {{ t('errors.notFound.goBack') }}
        </button>
      </div>

      <!-- ───────────── Enlaces de recuperación ───────────── -->
      <div class="reveal reveal-5 mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {{ t('errors.notFound.linksTitle') }}
        </h2>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <router-link
            v-for="link in RECOVERY_LINKS"
            :key="link.key"
            :to="link.to"
            class="group flex items-center gap-3 rounded-2xl bg-white/80 p-4 text-left shadow-soft ring-1 ring-gray-200/70 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-800/80 dark:ring-gray-700/60"
          >
            <span
              class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft"
            >
              <v-icon :name="link.icon" class="h-5 w-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-semibold text-gray-900 dark:text-white">
                {{ t(`errors.notFound.links.${link.key}.title`) }}
              </span>
              <span class="block text-sm text-gray-600 dark:text-gray-400">
                {{ t(`errors.notFound.links.${link.key}.description`) }}
              </span>
            </span>
            <v-icon
              name="hi-solid-arrow-right"
              class="h-4 w-4 shrink-0 text-primary-600 transition-transform group-hover:translate-x-0.5 dark:text-primary-400"
            />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/**
 * Ocupa el alto de la ventana descontando lo que el layout global ya reserva
 * (`main-content-safe`: 3.5rem/4rem de header + safe area, y `pb-24`: 6rem).
 * Con `min-h-svh` a secas la página quedaba ~10rem más alta que el viewport y
 * aparecía una barra de scroll sin contenido debajo.
 */
.not-found {
  min-height: calc(100svh - 9.5rem - env(safe-area-inset-top, 0px));

  @media (min-width: 640px) {
    min-height: calc(100svh - 10rem - env(safe-area-inset-top, 0px));
  }
}

.digit {
  @apply bg-gradient-to-br from-primary-500 to-primary-800 bg-clip-text text-transparent;
  font-size: clamp(5rem, 22vw, 9rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.05em;
}

.dark .digit {
  @apply from-primary-300 to-primary-600;
}

/* Entrada escalonada: badge → 404 → texto → acciones → enlaces. */
.reveal {
  opacity: 0;
  animation: reveal-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.reveal-1 { animation-delay: 0.05s; }
.reveal-2 { animation-delay: 0.12s; }
.reveal-3 { animation-delay: 0.2s; }
.reveal-4 { animation-delay: 0.28s; }
.reveal-5 { animation-delay: 0.36s; }

/* El bote y el giro van en elementos distintos: comparten `transform`. */
.ball-bob {
  animation: ball-bob 2.4s ease-in-out infinite;
}

.ball-spin {
  animation: ball-spin 9s linear infinite;
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ball-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes ball-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .ball-bob,
  .ball-spin {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
