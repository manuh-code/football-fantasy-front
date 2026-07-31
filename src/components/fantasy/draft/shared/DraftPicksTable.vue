<template>
  <div class="w-full">
    <!-- Vacío -->
    <div
      v-if="!picks.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-8 text-center"
    >
      <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <v-icon name="hi-solid-clipboard-list" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {{ $t('fantasy.draft.board.noPicks') }}
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('fantasy.draft.board.noPicksSub') }}</p>
    </div>

    <!-- Rejilla: una columna por participante, una fila por ronda -->
    <div
      v-else
      class="overflow-x-auto scrollbar-hide rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800"
    >
      <table class="w-full border-collapse min-w-max">
        <thead>
          <tr>
            <th
              v-for="(contender, idx) in contenders"
              :key="contender.key"
              class="sticky top-0 z-10 px-1.5 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': idx < contenders.length - 1 }"
            >
              <div class="flex flex-col items-center gap-1 min-w-[72px] sm:min-w-[80px]">
                <div
                  class="w-8 h-8 rounded-full overflow-hidden ring-2 bg-gray-200 dark:bg-gray-600"
                  :class="contender.isMe ? 'ring-emerald-400' : 'ring-white dark:ring-gray-800'"
                >
                  <img
                    v-if="contender.avatar"
                    :src="contender.avatar"
                    :alt="contender.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xs font-bold text-gray-500 dark:text-gray-400"
                  >
                    {{ contender.initials }}
                  </div>
                </div>
                <span
                  class="text-2xs font-semibold truncate max-w-[72px] text-center leading-tight"
                  :class="
                    contender.isMe
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300'
                  "
                >
                  {{ contender.name }}
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in boardRows" :key="row.number">
            <td
              v-for="(cell, colIdx) in row.cells"
              :key="colIdx"
              class="px-1 py-1.5 align-top border-b border-gray-50 dark:border-gray-700/30"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': colIdx < row.cells.length - 1 }"
            >
              <div v-if="cell" class="flex flex-col items-center gap-0.5 min-w-[72px] sm:min-w-[80px]">
                <span
                  class="text-2xs font-bold px-1 py-px rounded-full tabular-nums"
                  :class="positionPillClass(cell.positionCode)"
                >
                  {{ row.number }}.{{ cell.pickInRound }} ({{ cell.pick }})
                </span>

                <div
                  class="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2"
                  :class="positionBorderClass(cell.positionCode)"
                >
                  <img
                    v-if="cell.player?.image_path"
                    :src="cell.player.image_path"
                    :alt="cell.player?.display_name ?? ''"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-2xs font-bold text-gray-400 dark:text-gray-500"
                  >
                    {{ playerInitials(cell.player) }}
                  </div>
                </div>

                <p
                  class="text-2xs font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight truncate w-full max-w-[72px] sm:max-w-[80px]"
                >
                  {{ playerShortName(cell.player) }}
                </p>

                <span class="text-2xs font-bold px-1.5 py-px rounded" :class="positionBadgeClass(cell.positionCode)">
                  {{ cell.positionCode ? $t(`fantasy.positionsShort.${cell.positionCode}`) : '—' }}
                </span>
              </div>

              <div v-else class="flex items-center justify-center min-w-[72px] sm:min-w-[80px] h-[72px]">
                <div class="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import {
  playerInitials,
  playerShortName,
  positionBadgeClass,
  positionBorderClass,
  positionPillClass,
} from '@/components/fantasy/draft/shared/draftShared'
import type { DraftBoardPick, DraftContender } from '@/components/fantasy/draft/shared/draftShared'

/**
 * La rejilla completa del draft: participantes en columnas, rondas en filas.
 *
 * Venía del draft real (DraftPlayerPicked) y ahora la comparten los dos drafts;
 * por eso trabaja con participantes y picks normalizados en vez de con usuarios.
 */
const props = withDefaults(
  defineProps<{
    contenders: DraftContender[]
    picks: DraftBoardPick[]
    snakeOrder?: boolean
  }>(),
  { snakeOrder: true },
)

const boardRows = computed(() => {
  const count = props.contenders.length
  if (count === 0 || props.picks.length === 0) return []

  const maxRound = Math.max(...props.picks.map((pick) => pick.round))
  // Solo cuentan los picks con jugador: el resto son casillas por llenar.
  const byPick = new Map(props.picks.filter((pick) => pick.player).map((pick) => [pick.pick, pick]))
  const rows: { number: number; cells: (DraftBoardPick | null)[] }[] = []

  for (let round = 1; round <= maxRound; round++) {
    const cells: (DraftBoardPick | null)[] = []

    for (let col = 0; col < count; col++) {
      cells.push(byPick.get((round - 1) * count + col + 1) ?? null)
    }

    // Snake: en las rondas pares el orden de columnas se invierte, así que el
    // pick que ocupa cada celda también.
    rows.push({
      number: round,
      cells: props.snakeOrder && round % 2 === 0 ? cells.reverse() : cells,
    })
  }

  return rows
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
