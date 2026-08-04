<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-colors duration-300"
  >
    <!-- Cabecera + navegación de ronda -->
    <div class="px-4 py-2.5 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span v-if="showLiveDot" class="relative flex h-2 w-2 shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <div class="min-w-0">
          <h3 class="text-footnote font-semibold text-gray-900 dark:text-white leading-tight">
            {{ $t('fantasy.draft.board.title') }}
          </h3>
          <p class="text-2xs text-gray-500 dark:text-gray-400 truncate">
            {{ $t('fantasy.draft.board.progress', { picks: picksMade, total: totalPicks }) }}
            <span v-if="snakeOrder"> · {{ $t('fantasy.draft.board.snake') }}</span>
            <span v-if="onlineCount !== null">
              · <span class="text-green-500">{{ onlineCount }}</span>/{{ contenders.length }}
              {{ $t('fantasy.draft.order.online') }}
            </span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/60 rounded-lg p-0.5 shrink-0">
        <button
          type="button"
          :disabled="viewRound <= 1"
          class="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          :aria-label="$t('fantasy.draft.board.prevRound')"
          @click="viewRound--"
        >
          <v-icon name="hi-solid-chevron-left" class="w-3.5 h-3.5" />
        </button>
        <!-- Ronda del draft, no jornada del torneo: son las plazas de la
             plantilla (17 con la formación por defecto), no los partidos de la
             temporada. Reutilizar football.rounds.rounds hacía que en español
             se leyera "Jornada 17" en una liga que juega 38. -->
        <span class="text-2xs font-bold text-gray-700 dark:text-gray-300 min-w-[3.25rem] text-center tabular-nums">
          {{ $t('fantasy.draft.board.round', { round: viewRound }) }}
        </span>
        <button
          type="button"
          :disabled="viewRound >= rounds"
          class="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          :aria-label="$t('fantasy.draft.board.nextRound')"
          @click="viewRound++"
        >
          <v-icon name="hi-solid-chevron-right" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Carrusel de picks de la ronda -->
    <div ref="carouselRef" class="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth px-3 pb-3">
      <div
        v-for="slot in roundSlots"
        :key="slot.pick"
        class="shrink-0 w-[5.25rem] rounded-xl border p-2 transition-all duration-300"
        :class="[slotClasses(slot), { 'opacity-40': slot.contender && !slot.contender.isOnline && !slot.isCurrent }]"
      >
        <!-- Participante -->
        <div class="flex items-center gap-1 mb-1.5">
          <span
            class="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[0.5rem] font-bold shrink-0"
            :class="
              slot.contender?.isMe
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            "
          >
            <img
              v-if="slot.contender?.avatar"
              :src="slot.contender.avatar"
              :alt="slot.contender.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <template v-else>{{ slot.contender?.initials ?? '?' }}</template>
          </span>
          <span class="text-[0.5rem] font-semibold text-gray-400 dark:text-gray-500 tabular-nums">
            #{{ slot.pick }}
          </span>
        </div>

        <!-- Jugador fichado, o el estado del pick -->
        <template v-if="slot.pickData">
          <div
            class="w-9 h-9 mx-auto rounded-full overflow-hidden border-2 bg-gray-100 dark:bg-gray-700 mb-1"
            :class="positionBorderClass(slot.pickData.positionCode)"
          >
            <img
              v-if="slot.pickData.player?.image_path"
              :src="slot.pickData.player.image_path"
              :alt="slot.pickData.player?.display_name ?? ''"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-[0.5rem] font-bold text-gray-400 dark:text-gray-500"
            >
              {{ playerInitials(slot.pickData.player) }}
            </div>
          </div>
          <p class="text-[0.5rem] font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight truncate">
            {{ playerShortName(slot.pickData.player) }}
          </p>
          <p class="text-center">
            <span
              class="inline-block text-[0.5rem] font-bold px-1 rounded"
              :class="positionBadgeClass(slot.pickData.positionCode)"
            >
              {{ slot.pickData.positionCode ? $t(`fantasy.positionsShort.${slot.pickData.positionCode}`) : '' }}
            </span>
          </p>
        </template>

        <div v-else class="flex flex-col items-center justify-center h-[3.75rem] gap-1">
          <v-icon
            :name="slot.isCurrent ? 'ri-timer-flash-line' : 'hi-solid-dots-horizontal'"
            class="w-4 h-4"
            :class="slot.isCurrent ? 'text-amber-500 animate-pulse' : 'text-gray-300 dark:text-gray-600'"
          />
          <span v-if="slot.isCurrent" class="text-[0.5rem] font-semibold text-amber-500 text-center leading-tight">
            {{ $t('fantasy.draft.board.onTheClock') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  playerInitials,
  playerShortName,
  positionBadgeClass,
  positionBorderClass,
} from '@/components/fantasy/draft/shared/draftShared'
import type {
  DraftBoardPick,
  DraftBoardSlot,
  DraftContender,
} from '@/components/fantasy/draft/shared/draftShared'

/**
 * El board del draft: una tira por ronda con el hueco de cada participante.
 *
 * Nació en el mock draft y ahora lo usan los dos, así que no sabe nada de
 * usuarios ni de bots — recibe participantes y picks ya normalizados y deriva
 * el orden serpiente por su cuenta.
 */
const props = withDefaults(
  defineProps<{
    contenders: DraftContender[]
    picks: DraftBoardPick[]
    rounds: number
    totalPicks: number
    currentPick: number | null
    snakeOrder?: boolean
    /** Cuántos participantes están conectados; `null` oculta el indicador. */
    onlineCount?: number | null
    showLiveDot?: boolean
  }>(),
  { snakeOrder: true, onlineCount: null, showLiveDot: false },
)

const carouselRef = ref<HTMLElement | null>(null)
const viewRound = ref(1)
/** El usuario manda: si navega a otra ronda, dejamos de seguir el pick actual. */
const followsCurrentRound = ref(true)

const picksMade = computed(() => props.picks.length)

const picksByNumber = computed(() => new Map(props.picks.map((pick) => [pick.pick, pick])))

const currentRound = computed(() =>
  props.currentPick
    ? Math.floor((props.currentPick - 1) / Math.max(1, props.contenders.length)) + 1
    : props.rounds,
)

const roundSlots = computed<DraftBoardSlot[]>(() => {
  const count = props.contenders.length
  if (count === 0) return []

  // Snake: el orden se invierte en las rondas pares.
  const ordered = props.snakeOrder && viewRound.value % 2 === 0 ? [...props.contenders].reverse() : props.contenders
  const firstPick = (viewRound.value - 1) * count + 1

  return ordered.map((contender, index) => {
    const pick = firstPick + index
    return {
      pick,
      round: viewRound.value,
      pickInRound: index + 1,
      contender,
      pickData: picksByNumber.value.get(pick) ?? null,
      isCurrent: pick === props.currentPick,
    }
  })
})

function slotClasses(slot: DraftBoardSlot): string {
  if (slot.isCurrent) {
    return 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-500/10'
  }
  if (slot.contender?.isMe) {
    return 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/5'
  }
  return slot.pickData
    ? 'border-gray-100 bg-gray-50/60 dark:border-gray-700/50 dark:bg-gray-700/20'
    : 'border-dashed border-gray-200 dark:border-gray-700'
}

// Seguir la ronda en curso mientras el usuario no navegue por su cuenta.
watch(
  currentRound,
  (round) => {
    if (followsCurrentRound.value) viewRound.value = round
  },
  { immediate: true },
)

watch(viewRound, async (round) => {
  followsCurrentRound.value = round === currentRound.value
  await nextTick()
  carouselRef.value?.scrollTo({ left: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
