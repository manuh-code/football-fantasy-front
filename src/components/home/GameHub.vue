<template>
  <div class="space-y-6">
    <!-- Pitch: la frase que explica qué es la app. Es la razón de ser de esta
         pantalla — quien entra por primera vez tiene que saber que aquí se
         JUEGA, no que aquí se consultan resultados. Se encoge a un saludo
         cuando ya hay partidas: a esas alturas el argumento de venta sobra y lo
         accionable es continuar jugando. -->
    <header class="pt-2">
      <h1
        class="font-black tracking-tight text-gray-900 dark:text-white"
        :class="isReturning ? 'text-2xl' : 'text-3xl'"
      >
        {{ isReturning ? $t('fantasy.gaming.hero.titleReturning') : $t('fantasy.gaming.hero.title') }}
      </h1>
      <p
        v-if="!isReturning"
        class="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-snug max-w-md"
      >
        {{ $t('fantasy.gaming.hero.subtitle') }}
      </p>
    </header>

    <!-- ── Continuar jugando ────────────────────────────────────────────────
         Solo con sesión. Es lo que convierte el hub en una pantalla viva: sin
         esto se ve igual el día 1 que en la jornada 12. -->
    <section v-if="isAuthenticated" :aria-busy="showSkeleton">
      <!-- Esqueleto mientras carga: reserva la altura real de las filas para
           que la lista no salte al llegar (CLS). -->
      <div v-if="showSkeleton" class="space-y-3" :aria-label="$t('fantasy.gaming.continue.loading')">
        <div class="h-5 w-40 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div
          v-for="n in 2"
          :key="n"
          class="h-[72px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse"
        />
      </div>

      <template v-else-if="hasGames">
        <h2 class="text-callout font-bold text-gray-900 dark:text-white mb-3">
          {{ $t('fantasy.gaming.continue.title') }}
        </h2>

        <ul class="space-y-3">
          <li v-for="game in games" :key="game.id">
            <RouterLink
              :to="game.to"
              class="flex items-center gap-3 min-h-[44px] px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm cursor-pointer active:scale-[0.99] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              <!-- Escudo de la liga si lo hay; si no, el icono del modo, que
                   además es la única pista visual de a qué juego pertenece
                   cada fila. -->
              <img
                v-if="game.image"
                :src="game.image"
                alt=""
                class="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-black/5 dark:ring-white/10"
              />
              <div
                v-else
                class="w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-gradient-to-br"
                :class="MODE_STYLE[game.mode].gradient"
              >
                <v-icon :name="MODE_STYLE[game.mode].icon" class="w-5 h-5 text-white" />
              </div>

              <div class="flex-1 min-w-0">
                <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
                  {{ game.name }}
                </h3>
                <p class="mt-0.5 flex items-center gap-1.5 text-footnote text-gray-500 dark:text-gray-400 leading-snug">
                  <span :class="MODE_STYLE[game.mode].label">{{ modeLabel(game.mode) }}</span>
                  <template v-if="game.meta">
                    <span aria-hidden="true">·</span>
                    <span class="truncate">{{ metaLabel(game) }}</span>
                  </template>
                </p>
              </div>

              <!-- Cuenta atrás real (hoy solo el día del draft). Se omite en vez
                   de estimarse: un plazo inventado es peor que ninguno. -->
              <span
                v-if="deadlineLabel(game)"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-2xs font-bold shrink-0"
                :class="isUrgent(game) ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300'"
              >
                <v-icon name="hi-solid-clock" class="w-3 h-3" />
                {{ deadlineLabel(game) }}
              </span>
              <v-icon
                v-else
                name="hi-solid-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
              />
            </RouterLink>
          </li>
        </ul>

        <!-- Una de las tres fuentes falló: se avisa sin bloquear el resto. -->
        <button
          v-if="hasPartialFailure"
          type="button"
          :disabled="isLoading"
          @click="load"
          class="mt-3 w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-footnote font-medium text-gray-500 dark:text-gray-400 cursor-pointer active:scale-[0.99] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-60 disabled:cursor-default"
        >
          <v-icon name="hi-solid-refresh" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          {{ $t('fantasy.gaming.continue.retry') }}
        </button>
      </template>

      <!-- Con sesión pero sin ninguna partida: el estado vacío es la pantalla
           de venta más importante de la app. No se deja en blanco — dice qué
           falta y cómo empezar. -->
      <div
        v-else-if="hasLoaded"
        class="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 px-5 py-6 text-center"
      >
        <div
          class="mx-auto mb-3 grid place-items-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/15"
        >
          <v-icon name="hi-solid-sparkles" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 class="text-callout font-bold text-gray-900 dark:text-white">
          {{ $t('fantasy.gaming.empty.title') }}
        </h2>
        <p class="mt-1 text-footnote text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
          {{ $t('fantasy.gaming.empty.subtitle') }}
        </p>
      </div>
    </section>

    <!-- ── Los tres modos ───────────────────────────────────────────────────
         Presentación completa (hero + rejilla) mientras el usuario no juegue a
         nada: ahí su trabajo es explicar y vender. En cuanto hay partidas pasa
         a una fila compacta, porque entonces compite con "continuar jugando" y
         debe perder. -->
    <section v-if="!hasGames && !showSkeleton" class="space-y-3">
      <!-- Fantasy — tarjeta principal. Tres tarjetas idénticas comunican "tres
           cosas equivalentes", que es lo mismo que no comunicar jerarquía. -->
      <button
        type="button"
        @click="handleNavigation('fantasy')"
        class="group w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 shadow-medium cursor-pointer active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
      >
        <div class="relative px-5 py-5">
          <span
            class="pointer-events-none absolute -top-8 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div class="relative flex items-start gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm grid place-items-center shrink-0">
              <v-icon name="bi-trophy-fill" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide bg-white/20 text-white"
              >
                {{ $t('fantasy.gaming.fantasy.tag') }}
              </span>
              <h2 class="mt-1.5 text-2xl font-black text-white leading-tight">
                {{ $t('fantasy.gaming.fantasy.title') }}
              </h2>
              <p class="mt-0.5 text-sm text-white/80 leading-snug">
                {{ $t('fantasy.gaming.fantasy.subtitle') }}
              </p>
            </div>
          </div>
          <div class="relative mt-4 flex items-center justify-between">
            <span class="text-callout font-bold text-white">
              {{ $t('fantasy.gaming.fantasy.cta') }}
            </span>
            <span
              class="w-8 h-8 rounded-full bg-white/20 grid place-items-center transition-transform duration-200 group-active:translate-x-0.5"
            >
              <v-icon name="hi-solid-arrow-right" class="w-4 h-4 text-white" />
            </span>
          </div>
        </div>
      </button>

      <!-- Quinielas y Survivor — secundarios, pero con el mismo peso entre sí. -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="mode in secondaryModes"
          :key="mode.key"
          type="button"
          @click="handleNavigation(mode.key)"
          class="group flex flex-col h-full text-left rounded-2xl px-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm cursor-pointer active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <div
            class="w-11 h-11 rounded-2xl grid place-items-center shrink-0 bg-gradient-to-br"
            :class="MODE_STYLE[mode.key].gradient"
          >
            <v-icon :name="MODE_STYLE[mode.key].icon" class="w-5 h-5 text-white" />
          </div>
          <h2 class="mt-3 text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {{ mode.title }}
          </h2>
          <p class="mt-0.5 text-footnote text-gray-500 dark:text-gray-400 leading-snug flex-1">
            {{ mode.subtitle }}
          </p>
          <span
            class="mt-3 inline-flex items-center text-2xs font-bold uppercase tracking-wide"
            :class="MODE_STYLE[mode.key].label"
          >
            {{ mode.tag }}
          </span>
        </button>
      </div>
    </section>

    <!-- Con partidas en curso: los modos siguen accesibles, en fila compacta.
         Los que el usuario todavía no ha probado van primero y marcados — es la
         vía natural de crecimiento dentro del producto. -->
    <section v-else-if="hasGames">
      <h2 class="text-callout font-bold text-gray-900 dark:text-white mb-3">
        {{ $t('fantasy.gaming.more.title') }}
      </h2>
      <div class="grid grid-cols-3 gap-2.5">
        <button
          v-for="mode in compactModes"
          :key="mode.key"
          type="button"
          @click="handleNavigation(mode.key)"
          class="relative flex flex-col items-center gap-2 min-h-[44px] px-2 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 cursor-pointer active:scale-[0.97] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <span
            v-if="mode.isNew"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"
            :aria-label="$t('fantasy.gaming.more.untried')"
          />
          <div
            class="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br"
            :class="MODE_STYLE[mode.key].gradient"
          >
            <v-icon :name="MODE_STYLE[mode.key].icon" class="w-4 h-4 text-white" />
          </div>
          <span class="text-2xs font-bold text-gray-700 dark:text-gray-200 text-center leading-tight">
            {{ mode.title }}
          </span>
        </button>
      </div>
    </section>

    <!-- ── Unirse por invitación ────────────────────────────────────────────
         Estos juegos son sociales: se entra por el código que te pasa un amigo,
         no navegando. Merece un sitio fijo en el hub y no estar escondido tras
         un FAB dentro de cada modo. Cada acción abre la hoja de "unirse" del
         modo correspondiente (deep link `?join=`). Survivor no aparece porque
         la API no expone alta por código. -->
    <section v-if="isAuthenticated" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div class="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
        <v-icon name="hi-solid-user-add" class="w-4 h-4 text-emerald-500 shrink-0" />
        <h2 class="text-footnote font-bold text-gray-900 dark:text-white">
          {{ $t('fantasy.gaming.invite.title') }}
        </h2>
      </div>
      <div class="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/60 border-t border-gray-100 dark:border-gray-700/60">
        <RouterLink
          v-for="target in joinTargets"
          :key="target.key"
          :to="target.to"
          class="flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-3 text-footnote font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer active:bg-emerald-50 dark:active:bg-emerald-900/20 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
        >
          <v-icon :name="MODE_STYLE[target.key].icon" class="w-4 h-4 shrink-0" />
          {{ target.label }}
        </RouterLink>
      </div>
    </section>

    <!-- Guías: la salida para quien todavía no entiende un modo. -->
    <RouterLink
      :to="{ name: 'guides' }"
      class="flex items-center gap-2 min-h-[44px] px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-footnote font-medium text-gray-600 dark:text-gray-300 cursor-pointer active:scale-[0.99] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <v-icon name="hi-solid-academic-cap" class="w-4 h-4 text-emerald-500 shrink-0" />
      <span class="flex-1 min-w-0">{{ $t('fantasy.gaming.howTo') }}</span>
      <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
    </RouterLink>

    <!-- Los datos de liga siguen a un toque de distancia, pero por debajo del
         juego: son el soporte del producto, no el producto. -->
    <RouterLink
      :to="{ name: 'leagueOverview' }"
      class="flex items-center gap-3 min-h-[44px] px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 cursor-pointer active:scale-[0.99] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    >
      <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700/60 grid place-items-center shrink-0">
        <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-gray-500 dark:text-gray-300" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">
          {{ $t('fantasy.gaming.leagueData.title') }}
        </h3>
        <p class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5 truncate">
          {{ $t('fantasy.gaming.leagueData.subtitle') }}
        </p>
      </div>
      <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useToast } from '@/composables/useToast'
import { useGameHub, ROUTE_BY_MODE, type ActiveGame, type GameMode } from '@/composables/useGameHub'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const { info } = useToast()

const { isLoading, hasLoaded, hasPartialFailure, games, hasGames, untouchedModes, load } = useGameHub()

// Se arranca de forma optimista con el token persistido —síncrono— y se corrige
// en `onMounted` con la validación real, que es asíncrona. Sin esto, quien ya
// tiene sesión ve durante un instante el hub de presentación ("Juega con tus
// amigos" + las tres tarjetas) antes de que aparezcan sus partidas: un parpadeo
// de contenido en la primera pantalla de cada arranque.
const isAuthenticated = ref(!!authStore.token)

/** Única fuente de estilo por modo: icono, degradado y color de etiqueta. */
const MODE_STYLE: Record<GameMode, { icon: string; gradient: string; label: string }> = {
  fantasy: {
    icon: 'bi-trophy-fill',
    gradient: 'from-blue-500 to-indigo-600',
    label: 'text-indigo-600 dark:text-indigo-400',
  },
  pools: {
    icon: 'hi-solid-document-text',
    gradient: 'from-emerald-400 to-emerald-600',
    label: 'text-emerald-600 dark:text-emerald-400',
  },
  survivor: {
    icon: 'hi-solid-shield-check',
    gradient: 'from-rose-500 to-red-600',
    label: 'text-rose-600 dark:text-rose-400',
  },
}

// "Survivor" es nombre de marca — intencionalmente sin traducir.
const modeLabel = (mode: GameMode): string =>
  mode === 'survivor' ? 'Survivor' : t(`fantasy.gaming.${mode}.title`)

/**
 * Esqueleto mientras no sepamos qué tiene el usuario. Cubre también el hueco
 * entre el montaje y el inicio de `load()` (la comprobación de sesión es
 * asíncrona): si dependiera solo de `isLoading`, en ese hueco se colaría el hub
 * de presentación. Al recargar ya no aparece —`hasLoaded` sigue en `true`— y la
 * lista se mantiene en pantalla.
 */
const showSkeleton = computed(() => isAuthenticated.value && !hasLoaded.value)

/**
 * Cabecera de usuario que vuelve: título corto, sin argumento de venta. Incluye
 * el rato de carga a propósito — quien tiene sesión casi siempre tiene partidas,
 * así que apostar por esta versión evita que el titular grande y su subtítulo
 * aparezcan medio segundo para luego encogerse.
 */
const isReturning = computed(() => hasGames.value || showSkeleton.value)

const secondaryModes = computed(() => [
  {
    key: 'pools' as const,
    title: t('fantasy.gaming.pools.title'),
    subtitle: t('fantasy.gaming.pools.subtitle'),
    tag: t('fantasy.gaming.pools.tag'),
  },
  {
    key: 'survivor' as const,
    title: 'Survivor',
    subtitle: t('survivor.gaming.subtitle'),
    tag: t('survivor.gaming.tag'),
  },
])

/** Fila compacta: los modos sin estrenar primero, con su punto de aviso. */
const compactModes = computed(() => {
  const untried = new Set(untouchedModes.value)
  return (Object.keys(ROUTE_BY_MODE) as GameMode[])
    .map((key) => ({ key, title: modeLabel(key), isNew: untried.has(key) }))
    .sort((a, b) => Number(b.isNew) - Number(a.isNew))
})

/**
 * Modos con alta por código. El deep link `?join=` (sin valor) abre la hoja de
 * "unirse" vacía en la vista destino; con valor la abre prerrellenada, que es
 * como funcionan los enlaces de invitación que ya se comparten.
 */
const joinTargets = computed(() => [
  {
    key: 'fantasy' as const,
    label: t('fantasy.gaming.invite.fantasy'),
    to: { name: 'userFantasyLeague', query: { join: '' } },
  },
  {
    key: 'pools' as const,
    label: t('fantasy.gaming.invite.pools'),
    to: { name: 'pools', query: { join: '' } },
  },
])

// ── Plazos ──
// `now` avanza cada minuto para que las cuentas atrás no se queden congeladas
// en una pantalla que el usuario deja abierta. Un minuto basta: la unidad más
// pequeña que se muestra son minutos.
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const relativeTime = computed(
  () => new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto', style: 'short' })
)

/** Etiqueta del plazo, o `''` si la partida no tiene fecha o ya pasó. */
const deadlineLabel = (game: ActiveGame): string => {
  if (!game.deadline) return ''
  const diff = game.deadline.getTime() - now.value
  if (diff <= 0) return ''
  if (diff < HOUR) return relativeTime.value.format(Math.round(diff / MINUTE), 'minute')
  if (diff < DAY) return relativeTime.value.format(Math.round(diff / HOUR), 'hour')
  return relativeTime.value.format(Math.round(diff / DAY), 'day')
}

/** Menos de 24 h: se resalta en rojo. Es el umbral en que la acción urge. */
const isUrgent = (game: ActiveGame): boolean =>
  !!game.deadline && game.deadline.getTime() - now.value < DAY

const metaLabel = (game: ActiveGame): string => {
  const count = Number(game.meta)
  if (!Number.isFinite(count) || count <= 0) return ''
  return game.mode === 'survivor'
    ? t('fantasy.gaming.meta.lives', count)
    : t('fantasy.gaming.meta.participants', count)
}

const handleNavigation = async (gameMode: GameMode) => {
  const target = { name: ROUTE_BY_MODE[gameMode] }

  if (!(await authStore.isAuthenticated())) {
    info(t('fantasy.gaming.loginRequired'))
    // El redirect apunta al modo que se tocó, no al hub: quien entra buscando
    // una quiniela debe aterrizar en quinielas después de iniciar sesión, no de
    // vuelta aquí para tener que elegir otra vez.
    router.push({
      name: 'login',
      query: { redirect: router.resolve(target).fullPath },
    })
    return
  }

  router.push(target)
}

onMounted(async () => {
  isAuthenticated.value = await authStore.isAuthenticated()
  // Sin sesión no hay partidas que cargar: el hub se queda en su modo
  // "presentación" y nos ahorramos tres peticiones que devolverían 401.
  if (!isAuthenticated.value) return

  await load()
  tick = setInterval(() => (now.value = Date.now()), MINUTE)
})

onBeforeUnmount(() => clearInterval(tick))
</script>

<style scoped>
/* Accesibilidad: respetar la preferencia de movimiento reducido. */
@media (prefers-reduced-motion: reduce) {
  button,
  a {
    transition: none !important;
    transform: none !important;
  }
  .animate-pulse,
  .animate-spin {
    animation: none !important;
  }
}
</style>
