<template>
  <div class="space-y-2.5">
    <!-- Nota del draft -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-5 py-6 text-center"
    >
      <p class="text-2xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        {{ $t('fantasy.draft.results.gradeLabel') }}
      </p>
      <p class="text-5xl font-black leading-none mb-2" :class="gradeColor">
        {{ results.grade }}
      </p>
      <p class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ $t('fantasy.draft.results.finishedPosition', {
          position: results.user_position,
          total: results.ranking.length,
        }) }}
      </p>
      <p class="text-2xs text-gray-500 dark:text-gray-400 mt-1">
        {{ $t('fantasy.draft.results.vsAverage', {
          points: results.user_points,
          average: results.rivals_average,
        }) }}
        <span :class="results.difference >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
          ({{ results.difference >= 0 ? '+' : '' }}{{ results.difference }})
        </span>
      </p>

      <p class="text-2xs text-gray-400 dark:text-gray-500 mt-3 max-w-sm mx-auto">
        {{ $t('fantasy.draft.results.disclaimer') }}
      </p>
    </div>

    <!-- Mejor pick -->
    <div
      v-if="results.best_pick"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-4 py-3 flex items-center gap-3"
    >
      <div class="w-11 h-11 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
        <img
          v-if="results.best_pick.player?.image_path"
          :src="results.best_pick.player.image_path"
          :alt="results.best_pick.player?.display_name ?? ''"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-2xs font-bold text-gray-400 dark:text-gray-500"
        >
          {{ playerInitials(results.best_pick.player) }}
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-2xs uppercase tracking-wider text-amber-500 font-bold">
          {{ $t('fantasy.draft.results.bestPick') }}
        </p>
        <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
          {{ results.best_pick.player?.display_name }}
        </p>
        <p class="text-2xs text-gray-500 dark:text-gray-400 truncate">
          {{ $t('fantasy.draft.results.bestPickDetail', {
            pick: results.best_pick.pick,
            round: results.best_pick.round,
            points: results.best_pick.total_points,
          }) }}
        </p>
      </div>
    </div>

    <!-- Clasificación de la sala -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
    >
      <h3 class="px-4 py-2.5 text-footnote font-semibold text-gray-900 dark:text-white">
        {{ $t('fantasy.draft.results.rankingTitle') }}
      </h3>
      <ul class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <li
          v-for="entry in results.ranking"
          :key="entry.key"
          class="flex items-center gap-3 px-4 py-2"
          :class="entry.is_user ? 'bg-emerald-50/60 dark:bg-emerald-500/5' : ''"
        >
          <span class="w-5 text-2xs font-bold text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
            {{ entry.position }}
          </span>
          <span
            class="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[0.5rem] font-bold shrink-0"
            :class="
              entry.is_user
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            "
          >
            <img
              v-if="entry.avatar"
              :src="entry.avatar"
              :alt="entry.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <template v-else>{{ entry.initials }}</template>
          </span>
          <span class="flex-1 min-w-0 text-xs font-semibold text-gray-900 dark:text-white truncate">
            {{ entry.name }}
          </span>
          <span class="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums shrink-0">
            {{ entry.total_points }}
          </span>
        </li>
      </ul>
    </div>

    <div v-if="$slots.actions" class="flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { playerInitials } from '@/components/fantasy/draft/shared/draftShared'
import type { DraftResults } from '@/interfaces/fantasy/draft/DraftResults'

/**
 * La boleta del draft: nota, mejor pick y clasificación de la sala.
 *
 * La comparten el mock draft y el draft real, que devuelven exactamente el
 * mismo payload desde el backend (DraftGradeService), para que la nota que
 * sacas practicando se lea igual que la de tu liga.
 */
const props = defineProps<{ results: DraftResults }>()

const gradeColor = computed(() => {
  if (props.results.grade.startsWith('A')) return 'text-emerald-500'
  if (props.results.grade.startsWith('B')) return 'text-blue-500'
  if (props.results.grade.startsWith('C')) return 'text-amber-500'
  return 'text-red-500'
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
