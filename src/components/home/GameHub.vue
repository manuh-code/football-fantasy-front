<!--
  Hub de modos de juego — la pantalla raíz de la app.

  Organizado en tres zonas fijas, cada una un `<section>` con su propio título.
  El orden es el mismo en todos los estados, de forma que la posición de las
  cosas no cambia entre visitas; lo que cambia es el contenido de cada zona:

    1. Tus juegos     — partidas en curso. Solo aparece si hay algo que continuar.
    2. Modos de juego — presentación completa si no juegas a nada, fila compacta
                        si ya tienes partidas (ver GameHubModes).
    3. Más            — utilidades: unirse con código, guías y datos de liga.

  La zona 3 es una única lista agrupada y no tres tarjetas sueltas: son cuatro
  atajos secundarios y comparten la misma forma de fila, así que el ojo los
  procesa de golpe en vez de uno a uno.
-->
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

    <!-- Anuncia el final de la carga a un lector de pantalla. Va aparte y no
         como `aria-live` sobre la lista a propósito: las cuentas atrás se
         refrescan cada minuto y la lista entera se releería con cada tic. -->
    <p v-if="isAuthenticated" role="status" class="sr-only">
      {{ showSkeleton ? $t('fantasy.gaming.continue.loading') : $t('fantasy.gaming.continue.status', games.length) }}
    </p>

    <!-- ── 1. Tus juegos ────────────────────────────────────────────────────
         Lo que convierte el hub en una pantalla viva: sin esto se ve igual el
         día 1 que en la jornada 12. Cuando no hay ninguna partida esta zona
         desaparece entera y el estado vacío pasa a ser la entradilla de la
         zona 2, que es donde está la acción. -->
    <section
      v-if="showContinue"
      aria-labelledby="game-hub-continue-title"
      :aria-busy="showSkeleton"
    >
      <h2
        id="game-hub-continue-title"
        class="text-callout font-bold text-gray-900 dark:text-white mb-3"
      >
        {{ $t('fantasy.gaming.continue.title') }}
      </h2>

      <!-- El título real se pinta ya; solo se esqueletiza el contenido, con la
           altura exacta de las filas para que la lista no salte al llegar. -->
      <div v-if="showSkeleton" class="space-y-3">
        <div
          v-for="n in 2"
          :key="n"
          class="h-[72px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 animate-pulse"
        />
      </div>

      <template v-else>
        <ul id="game-hub-games" class="space-y-3">
          <li v-for="game in visibleGames" :key="game.id">
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
                  <span :class="MODE_STYLE[game.mode].label">{{ modeTitle(game.mode, t) }}</span>
                  <template v-if="metaLabel(game)">
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
              <!-- El chevron va siempre, también con plazo: es la señal de que
                   la fila navega, y antes el plazo la sustituía. -->
              <v-icon
                name="hi-solid-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
              />
            </RouterLink>
          </li>
        </ul>

        <!-- Con muchas partidas la lista empujaba el resto del hub fuera de
             pantalla. Se muestran las más urgentes —vienen ordenadas por
             plazo— y el resto queda a un toque. -->
        <button
          v-if="hiddenCount > 0"
          type="button"
          :aria-expanded="isExpanded"
          aria-controls="game-hub-games"
          @click="isExpanded = !isExpanded"
          class="mt-3 w-full flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-2xl text-footnote font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer active:bg-emerald-50 dark:active:bg-emerald-900/20 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          {{ isExpanded ? $t('fantasy.gaming.continue.showLess') : $t('fantasy.gaming.continue.showAll', { count: hiddenCount }) }}
          <v-icon
            name="hi-solid-chevron-down"
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>

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
    </section>

    <!-- ── 2. Modos de juego ────────────────────────────────────────────────
         Oculta durante la carga: si se pintara, quien tiene partidas vería un
         instante la presentación completa antes de que la fila compacta la
         reemplace. -->
    <GameHubModes
      v-if="!showSkeleton"
      :variant="hasGames ? 'compact' : 'full'"
      :untouched="untouchedModes"
      @navigate="handleNavigation"
    >
      <!-- Estado vacío. Va aquí como entradilla, y no como tarjeta propia más
           arriba, para que el aviso y la acción que lo resuelve estén juntos:
           una tarjeta suelta que solo dice "no juegas nada" es un callejón. -->
      <div
        v-if="isEmpty"
        class="flex items-start gap-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-900/15 ring-1 ring-emerald-500/15 px-4 py-3"
      >
        <v-icon
          name="hi-solid-sparkles"
          class="w-5 h-5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
        />
        <div class="min-w-0">
          <p class="text-footnote font-bold text-gray-900 dark:text-white">
            {{ $t('fantasy.gaming.empty.title') }}
          </p>
          <p class="mt-0.5 text-footnote text-gray-500 dark:text-gray-400 leading-snug">
            {{ $t('fantasy.gaming.empty.subtitle') }}
          </p>
        </div>
      </div>
    </GameHubModes>

    <!-- ── 3. Más ───────────────────────────────────────────────────────────
         Cuatro atajos secundarios en una sola lista agrupada. Las dos primeras
         filas son el alta por código: estos juegos son sociales y se entra por
         el código que te pasa un amigo, así que merece un sitio fijo en el hub
         y no estar escondido tras un FAB dentro de cada modo (deep link
         `?join=`). Survivor no aparece porque la API no expone alta por código. -->
    <section aria-labelledby="game-hub-more-title">
      <h2
        id="game-hub-more-title"
        class="text-callout font-bold text-gray-900 dark:text-white mb-3"
      >
        {{ $t('fantasy.gaming.secondary.title') }}
      </h2>
      <div
        class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/60"
      >
        <RouterLink
          v-for="link in secondaryLinks"
          :key="link.key"
          :to="link.to"
          class="flex items-center gap-3 min-h-[44px] px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/40 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
        >
          <div
            class="w-9 h-9 rounded-xl grid place-items-center shrink-0"
            :class="link.accent
              ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-300'"
          >
            <v-icon :name="link.icon" class="w-[18px] h-[18px]" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">
              {{ link.title }}
            </h3>
            <p
              v-if="link.subtitle"
              class="mt-0.5 text-footnote text-gray-500 dark:text-gray-400 leading-snug truncate"
            >
              {{ link.subtitle }}
            </p>
          </div>
          <v-icon
            name="hi-solid-chevron-right"
            class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
          />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRouter, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useGameHub, ROUTE_BY_MODE, type ActiveGame, type GameMode } from '@/composables/useGameHub'
import GameHubModes from './gameHub/GameHubModes.vue'
import { MODE_STYLE, modeTitle, guideRouteForMode } from './gameHub/gameModes'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const { isLoading, hasLoaded, hasPartialFailure, games, hasGames, untouchedModes, load } = useGameHub()

// Se arranca de forma optimista con el token persistido —síncrono— y se corrige
// en `onMounted` con la validación real, que es asíncrona. Sin esto, quien ya
// tiene sesión ve durante un instante el hub de presentación ("Juega con tus
// amigos" + las tres tarjetas) antes de que aparezcan sus partidas: un parpadeo
// de contenido en la primera pantalla de cada arranque.
const isAuthenticated = ref(!!authStore.token)

// ── Qué zona se pinta ──
/**
 * Esqueleto mientras no sepamos qué tiene el usuario. Cubre también el hueco
 * entre el montaje y el inicio de `load()` (la comprobación de sesión es
 * asíncrona): si dependiera solo de `isLoading`, en ese hueco se colaría el hub
 * de presentación. Al recargar ya no aparece —`hasLoaded` sigue en `true`— y la
 * lista se mantiene en pantalla.
 */
const showSkeleton = computed(() => isAuthenticated.value && !hasLoaded.value)

/** La zona 1 solo existe si hay algo que continuar (o que esperar). */
const showContinue = computed(() => isAuthenticated.value && (showSkeleton.value || hasGames.value))

/** Con sesión y sin ninguna partida: el aviso pasa a la zona 2. */
const isEmpty = computed(() => isAuthenticated.value && hasLoaded.value && !hasGames.value)

/**
 * Cabecera de usuario que vuelve: título corto, sin argumento de venta. Incluye
 * el rato de carga a propósito — quien tiene sesión casi siempre tiene partidas,
 * así que apostar por esta versión evita que el titular grande y su subtítulo
 * aparezcan medio segundo para luego encogerse.
 */
const isReturning = computed(() => hasGames.value || showSkeleton.value)

// ── Lista de partidas ──
/**
 * Cuántas filas se ven sin desplegar. Cuatro entran en una pantalla de móvil
 * junto al título y dejan ver que debajo sigue habiendo hub.
 */
const COLLAPSED_COUNT = 4
const isExpanded = ref(false)

const visibleGames = computed(() =>
  isExpanded.value ? games.value : games.value.slice(0, COLLAPSED_COUNT)
)
const hiddenCount = computed(() => Math.max(0, games.value.length - COLLAPSED_COUNT))

// ── Zona 3 ──
interface SecondaryLink {
  key: string
  icon: string
  title: string
  subtitle?: string
  /** Acción, no navegación: se tiñe de esmeralda para separarla del resto. */
  accent?: boolean
  to: RouteLocationRaw
}

/**
 * El alta por código solo aparece con sesión: las hojas de "unirse" viven en
 * vistas protegidas y sin sesión la fila solo llevaría al login. El deep link
 * `?join=` (sin valor) abre la hoja vacía; con valor la abre prerrellenada, que
 * es como funcionan los enlaces de invitación que ya se comparten.
 */
const secondaryLinks = computed<SecondaryLink[]>(() => [
  ...(isAuthenticated.value
    ? [
        {
          key: 'joinFantasy',
          icon: 'hi-solid-user-add',
          accent: true,
          title: t('fantasy.gaming.invite.fantasy'),
          to: { name: 'userFantasyLeague', query: { join: '' } },
        },
        {
          key: 'joinPools',
          icon: 'hi-solid-user-add',
          accent: true,
          title: t('fantasy.gaming.invite.pools'),
          to: { name: 'pools', query: { join: '' } },
        },
      ]
    : []),
  {
    key: 'guides',
    icon: 'hi-solid-academic-cap',
    title: t('fantasy.gaming.guides.title'),
    subtitle: t('fantasy.gaming.guides.subtitle'),
    to: { name: 'guides' },
  },
  // Los datos de liga siguen a un toque, pero por debajo del juego: son el
  // soporte del producto, no el producto.
  {
    key: 'leagueData',
    icon: 'hi-solid-chart-bar',
    title: t('fantasy.gaming.leagueData.title'),
    subtitle: t('fantasy.gaming.leagueData.subtitle'),
    to: { name: 'leagueOverview' },
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
  // Sin sesión no se manda al login. Esta zona es el argumento de venta y el
  // muro castigaba justo a quien se interesaba: tocaba una tarjeta que le
  // acababan de vender y recibía un formulario. En su lugar va a la guía
  // pública del modo, que lo explica y termina con su propia invitación a
  // registrarse — la cuenta se pide al crear o unirse, no al mirar.
  if (!(await authStore.isAuthenticated())) {
    const guide = guideRouteForMode(gameMode)
    if (guide) {
      router.push(guide)
      return
    }
  }

  // Con sesión (o si un modo se quedara sin guía) va al modo. En ese segundo
  // caso el guardián del router se encarga de pedir sesión.
  router.push({ name: ROUTE_BY_MODE[gameMode] })
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
