<!--
  Zona "modos de juego" del hub. Se extrajo de GameHub.vue porque es el bloque
  más grande y el único que no depende del estado de carga ni del temporizador
  de plazos: solo necesita saber en qué variante presentarse.

  `full`    — presentación completa. Es el argumento de venta: quien no juega a
              nada todavía tiene que entender qué es cada modo.
  `compact`  — fila de tres iconos. Cuando ya hay partidas en curso, los modos
              compiten con "continuar jugando" y deben perder.
-->
<template>
  <section aria-labelledby="game-hub-modes-title">
    <h2
      id="game-hub-modes-title"
      class="text-callout font-bold text-gray-900 dark:text-white mb-3"
    >
      {{ variant === 'compact' ? $t('fantasy.gaming.more.title') : $t('fantasy.gaming.modes.title') }}
    </h2>

    <!-- Entradilla opcional: la usa el estado vacío para explicar por qué esta
         sección es lo siguiente que hay que mirar. -->
    <div v-if="$slots.default" class="mb-3">
      <slot />
    </div>

    <div v-if="variant === 'full'" class="space-y-3">
      <!-- Fantasy — tarjeta principal. Tres tarjetas idénticas comunican "tres
           cosas equivalentes", que es lo mismo que no comunicar jerarquía. -->
      <button
        type="button"
        @click="emit('navigate', 'fantasy')"
        class="group w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-medium cursor-pointer active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
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
              <h3 class="mt-1.5 text-2xl font-black text-white leading-tight">
                {{ $t('fantasy.gaming.fantasy.title') }}
              </h3>
              <!-- /90 y no /80: sobre el esmeralda de la tarjeta, el blanco al
                   80% se queda en 4.16:1 y no llega al mínimo de 4.5:1. -->
              <p class="mt-0.5 text-sm text-white/90 leading-snug">
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
          @click="emit('navigate', mode.key)"
          class="group flex flex-col h-full text-left rounded-2xl px-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm cursor-pointer active:scale-[0.98] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <div
            class="w-11 h-11 rounded-2xl grid place-items-center shrink-0 bg-gradient-to-br"
            :class="MODE_STYLE[mode.key].gradient"
          >
            <v-icon :name="MODE_STYLE[mode.key].icon" class="w-5 h-5 text-white" />
          </div>
          <h3 class="mt-3 text-lg font-bold text-gray-900 dark:text-white leading-tight">
            {{ mode.title }}
          </h3>
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
    </div>

    <!-- Fila compacta. Los modos que el usuario todavía no ha probado van
         primero y marcados: es la vía natural de crecimiento en el producto. -->
    <div v-else class="grid grid-cols-3 gap-2.5">
      <button
        v-for="mode in compactModes"
        :key="mode.key"
        type="button"
        @click="emit('navigate', mode.key)"
        class="flex flex-col items-center gap-2 min-h-[44px] px-2 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 cursor-pointer active:scale-[0.97] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        <div
          class="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br"
          :class="MODE_STYLE[mode.key].gradient"
        >
          <v-icon :name="MODE_STYLE[mode.key].icon" class="w-4 h-4 text-white" />
        </div>
        <span class="text-2xs font-bold text-gray-700 dark:text-gray-200 text-center leading-tight">
          {{ mode.title }}
        </span>
        <!-- Etiqueta de texto y no un punto de color: el color por sí solo no
             transmite nada a quien no lo distingue. -->
        <span
          v-if="mode.isUntried"
          class="text-2xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 text-center leading-none"
        >
          {{ $t('fantasy.gaming.more.untried') }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ROUTE_BY_MODE, type GameMode } from '@/composables/useGameHub'
import { MODE_STYLE, modeTitle } from './gameModes'

const props = defineProps<{
  variant: 'full' | 'compact'
  /** Modos en los que el usuario no tiene ninguna partida. */
  untouched: GameMode[]
}>()

const emit = defineEmits<{ navigate: [mode: GameMode] }>()

const { t } = useI18n()

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

const compactModes = computed(() => {
  const untried = new Set(props.untouched)
  return (Object.keys(ROUTE_BY_MODE) as GameMode[])
    .map((key) => ({ key, title: modeTitle(key, t), isUntried: untried.has(key) }))
    .sort((a, b) => Number(b.isUntried) - Number(a.isUntried))
})
</script>

<style scoped>
/* Accesibilidad: respetar la preferencia de movimiento reducido. */
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
    transform: none !important;
  }
}
</style>
