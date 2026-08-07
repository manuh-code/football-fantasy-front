<!--
  Selector de liga de fútbol, en su propia hoja.

  Antes cada formulario de creación (quiniela, liga fantasy) desplegaba la lista
  dentro del propio panel: la hoja crecía de golpe, los campos de abajo se iban
  fuera de pantalla y elegir liga competía por espacio con rellenar el
  formulario. Aquí la elección ocupa una capa propia sobre el formulario, se
  resuelve de un toque y devuelve al usuario justo donde estaba.

  La lista se carga una sola vez y se guarda: reabrir la hoja para comparar dos
  ligas no debería costar otra petición.
-->
<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="$t('football.leaguePicker.title')"
    :subtitle="$t('football.leaguePicker.subtitle')"
    icon="hi-solid-globe-alt"
    :icon-variant="accent"
    size="lg"
    role="dialog"
    :z-index="zIndex"
    @close="emit('close')"
  >
    <!-- Buscador: solo cuando la lista deja de caber de un vistazo. Por debajo
         de ese umbral el campo sería un obstáculo, no una ayuda. -->
    <div
      v-if="showSearch"
      class="sticky top-0 z-10 -mx-5 -mt-3 px-5 pt-3 pb-2.5 bg-white dark:bg-gray-900"
    >
      <div class="relative">
        <v-icon
          name="hi-solid-search"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
        />
        <input
          v-model="query"
          type="search"
          :placeholder="$t('football.leaguePicker.searchPlaceholder')"
          :aria-label="$t('football.leaguePicker.searchPlaceholder')"
          class="w-full h-11 pl-10 pr-3 rounded-xl border-[1.5px] border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-base md:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
        />
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="isLoading" class="space-y-1.5 py-1" aria-busy="true">
      <div v-for="n in 4" :key="`lg-sk-${n}`" class="flex items-center gap-3 px-3 py-2.5">
        <div class="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="h-2.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Falló la carga: el usuario no puede seguir sin liga, así que la salida
         es reintentar, no un mensaje muerto. -->
    <div v-else-if="hasError" class="py-10 text-center">
      <div
        class="w-12 h-12 rounded-2xl mx-auto mb-3 grid place-items-center bg-red-50 dark:bg-red-900/20"
      >
        <v-icon name="hi-solid-exclamation" class="w-6 h-6 text-red-400" />
      </div>
      <p class="text-footnote text-gray-500 dark:text-gray-400 mb-4">
        {{ $t('football.leaguePicker.error') }}
      </p>
      <button
        type="button"
        @click="load(true)"
        class="min-h-[44px] px-5 rounded-full text-footnote font-semibold text-white bg-emerald-600 active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Sin resultados: distinto mensaje según sea el catálogo vacío o el filtro. -->
    <div v-else-if="visibleLeagues.length === 0" class="py-10 text-center">
      <div
        class="w-12 h-12 rounded-2xl mx-auto mb-3 grid place-items-center bg-gray-100 dark:bg-gray-800"
      >
        <v-icon name="hi-solid-globe-alt" class="w-6 h-6 text-gray-300 dark:text-gray-600" />
      </div>
      <p class="text-footnote text-gray-400 dark:text-gray-500">
        {{ query.trim() ? $t('football.leaguePicker.noMatches', { query: query.trim() }) : $t('football.leaguePicker.empty') }}
      </p>
    </div>

    <!-- Opciones -->
    <ul v-else class="space-y-1 py-1" role="listbox" :aria-label="$t('football.leaguePicker.title')">
      <li v-for="league in visibleLeagues" :key="league.uuid">
        <button
          type="button"
          role="option"
          :aria-selected="league.uuid === selectedUuid"
          @click="choose(league)"
          class="w-full flex items-center gap-3 min-h-[56px] px-3 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer active:bg-gray-100 dark:active:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50"
          :class="league.uuid === selectedUuid
            ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-inset ring-emerald-500/25 dark:ring-emerald-400/25'
            : 'bg-gray-50 dark:bg-gray-800/50'"
        >
          <img
            :src="league.image_path || '/img/default-avatar.svg'"
            :alt="league.name"
            loading="lazy"
            class="w-10 h-10 object-contain shrink-0"
            @error="onLogoError"
          />
          <span class="flex-1 min-w-0">
            <span
              class="block truncate text-callout"
              :class="league.uuid === selectedUuid
                ? 'font-bold text-emerald-700 dark:text-emerald-400'
                : 'font-semibold text-gray-900 dark:text-white'"
            >
              {{ league.name }}
            </span>
            <span
              v-if="league.current_season?.name"
              class="block truncate text-2xs text-gray-500 dark:text-gray-400 mt-0.5"
            >
              {{ league.current_season.name }}
            </span>
          </span>
          <!-- La marca es un glifo, no solo el tinte de la fila: el color por sí
               solo no distingue la selección para todo el mundo. -->
          <v-icon
            v-if="league.uuid === selectedUuid"
            name="hi-solid-check-circle"
            class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"
          />
        </button>
      </li>
    </ul>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import catalogService from '@/services/catalog/CatalogService'
import type { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse'

const props = withDefaults(
  defineProps<{
    isVisible: boolean
    /** Liga marcada como activa en la lista. */
    selectedUuid?: string
    /** Color del icono de cabecera; sigue al formulario que abre la hoja. */
    accent?: 'emerald' | 'blue' | 'red' | 'amber'
    /**
     * Por defecto se apila sobre la hoja del formulario (120), que es de donde
     * siempre se abre.
     */
    zIndex?: number
  }>(),
  {
    selectedUuid: '',
    accent: 'emerald',
    zIndex: 130,
  },
)

const emit = defineEmits<{
  close: []
  select: [league: FootballLeagueResponse]
}>()

const leagues = ref<FootballLeagueResponse[]>([])
const isLoading = ref(false)
const hasError = ref(false)
const query = ref('')

/** Con pocas ligas el campo de búsqueda estorba más de lo que ayuda. */
const SEARCH_THRESHOLD = 7
const showSearch = computed(() => !isLoading.value && !hasError.value && leagues.value.length > SEARCH_THRESHOLD)

const visibleLeagues = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return leagues.value
  return leagues.value.filter((league) => league.name.toLowerCase().includes(term))
})

const onLogoError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = '/img/default-avatar.svg'
}

const load = async (force = false) => {
  if (!force && leagues.value.length > 0) return
  isLoading.value = true
  hasError.value = false
  try {
    leagues.value = await catalogService.getFootballLeagues()
  } catch (e) {
    console.error('Error loading football leagues:', e)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

const choose = (league: FootballLeagueResponse) => {
  emit('select', league)
  emit('close')
}

// La lista se pide al abrir, no al montar: la hoja vive dentro de formularios
// que pueden no abrirse nunca en toda la sesión.
watch(
  () => props.isVisible,
  (visible) => {
    if (!visible) return
    query.value = ''
    load()
  },
  { immediate: true },
)
</script>
