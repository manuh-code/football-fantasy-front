<template>
  <!-- Skeleton con la misma silueta que la tira cargada, para que no salte el
       layout cuando llegan los datos. -->
  <div
    v-if="isLoading"
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-3 py-2.5 flex items-center gap-3"
  >
    <div class="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
    <div class="flex-1 space-y-2">
      <div class="h-3 w-36 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div class="h-2.5 w-28 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
    </div>
  </div>

  <!-- Bajo candado: la tira se enseña igual, con la nota tapada. Esconderla
       dejaría al usuario sin saber que la boleta existe, que es justo lo que
       hay que vender aquí. -->
  <button
    v-else-if="!canSeeGrade"
    type="button"
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-500/30 px-3 py-2.5 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.99] transition-all duration-200 cursor-pointer"
    @click="requirePremium(PREMIUM_FEATURES.fantasyRosterGrade)"
  >
    <span class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-500/10">
      <v-icon name="hi-solid-lock-closed" class="w-5 h-5 text-amber-500" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="flex items-center gap-1.5 min-w-0">
        <span class="truncate text-footnote font-semibold text-gray-900 dark:text-white">
          {{ $t('fantasy.rosterGrade.title') }}
        </span>
        <PremiumBadge class="shrink-0" />
      </span>
      <span class="block text-2xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
        {{ $t('premium.features.fantasy.roster_grade') }}
      </span>
    </span>

    <v-icon
      name="hi-solid-chevron-right"
      class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
      aria-hidden="true"
    />
  </button>

  <!-- Sin plantilla que calificar (liga sin draft todavía): la tira simplemente
       no existe, no hay nada que explicar aquí. -->
  <template v-else-if="grade">
    <button
      type="button"
      class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-3 py-2.5 flex items-center gap-3 text-left hover:border-gray-200 dark:hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99] transition-all duration-200 cursor-pointer"
      @click="isDrawerOpen = true"
    >
      <span
        class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        :class="gradeTheme.box"
      >
        <span class="text-xl font-black leading-none tabular-nums" :class="gradeTheme.text">
          {{ grade.scored ? grade.grade : '—' }}
        </span>
      </span>

      <span class="min-w-0 flex-1">
        <span class="block text-footnote font-semibold text-gray-900 dark:text-white truncate">
          {{ $t('fantasy.rosterGrade.title') }}
        </span>

        <span v-if="grade.scored" class="flex items-center gap-1.5 mt-0.5 min-w-0">
          <span class="text-2xs text-gray-500 dark:text-gray-400 truncate">
            {{ $t('fantasy.rosterGrade.position', {
              position: grade.user_position,
              total: grade.ranking.length,
            }) }}
          </span>
          <span
            class="shrink-0 text-2xs font-bold tabular-nums"
            :class="grade.difference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
          >
            {{ grade.difference >= 0 ? '+' : '' }}{{ grade.difference }}
          </span>
        </span>

        <span v-else class="block text-2xs text-amber-600 dark:text-amber-400 mt-0.5 truncate">
          {{ $t('fantasy.rosterGrade.unscoredTitle') }}
        </span>
      </span>

      <v-icon
        name="hi-solid-chevron-right"
        class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
        aria-hidden="true"
      />
    </button>

    <RosterGradeDrawer v-model="isDrawerOpen" :grade="grade" />
  </template>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import RosterGradeDrawer from '@/components/fantasy/team/RosterGradeDrawer.vue'
import PremiumBadge from '@/components/premium/PremiumBadge.vue'
import { usePremium } from '@/composables/usePremium'
import { PREMIUM_FEATURES } from '@/interfaces/user/billing/EntitlementsResponse'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { RosterGrade } from '@/interfaces/fantasy/team/RosterGrade'

/**
 * La calificación de la plantilla actual, dentro de "Mi equipo".
 *
 * En pantalla ocupa una tira: nota, posición y diferencia con la media. Todo el
 * detalle (fuerza por línea, mejor titular, clasificación) vive en el drawer,
 * porque esta pantalla ya carga jornada, enfrentamiento y alineación completa.
 *
 * Es la misma boleta que sale al terminar el draft, pero viva: el backend la
 * recalcula sobre el lineup vigente, así que sube o baja con cada traspaso.
 * Mientras la liga no tenga plantilla (antes del draft) el endpoint responde
 * 404 y la tira no se dibuja: no hay nada que decir todavía.
 */
const props = defineProps<{ leagueUuid: string }>()

const grade = ref<RosterGrade | null>(null)
const isLoading = ref(false)
const isDrawerOpen = ref(false)

const gradeTheme = computed(() => {
  const letter = grade.value?.scored ? grade.value.grade : ''
  if (letter.startsWith('A')) {
    return { box: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500' }
  }
  if (letter.startsWith('B')) {
    return { box: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500' }
  }
  if (letter.startsWith('C')) {
    return { box: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500' }
  }
  if (letter.startsWith('D')) {
    return { box: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-500' }
  }
  // Sin nota que mostrar: gris, para que el guion no se lea como un resultado.
  return { box: 'bg-gray-100 dark:bg-gray-700/60', text: 'text-gray-400 dark:text-gray-500' }
})

const { requirePremium, can } = usePremium()

const canSeeGrade = computed(() => can(PREMIUM_FEATURES.fantasyRosterGrade))

async function loadGrade(): Promise<void> {
  // Sin la función desbloqueada no se llama al endpoint: contestaría 402 y el
  // interceptor abriría la hoja de venta sola, sin que el usuario tocara nada.
  // Aquí se pinta la tira de cebo y se espera a que la toque.
  if (!props.leagueUuid || !canSeeGrade.value) {
    grade.value = null
    return
  }

  isLoading.value = true
  try {
    grade.value = await fantasyLeagueService.getRosterGrade(props.leagueUuid)
  } catch {
    // 404 mientras no haya draft; cualquier otro fallo tampoco justifica
    // molestar al usuario: la boleta es un extra sobre "Mi equipo".
    grade.value = null
    isDrawerOpen.value = false
  } finally {
    isLoading.value = false
  }
}

// También se observa el candado: el estado premium llega de forma asíncrona, y
// sin esto la tira se quedaría de cebo hasta recargar la pantalla.
watch([() => props.leagueUuid, canSeeGrade], loadGrade, { immediate: true })

defineExpose({ reload: loadGrade })
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none !important;
  }
}
</style>
