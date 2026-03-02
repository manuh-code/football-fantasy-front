<template>
  <div class="space-y-4">
    <!-- Statistics Header with Segmented Control -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
      <!-- Header -->
      <div class="px-4 py-3">
        <div class="flex items-center gap-2">
          <v-icon name="hi-solid-chart-bar" class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0" />
          <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">Player Statistics</h2>
        </div>
      </div>

      <!-- iOS Segmented Control -->
      <div class="px-4 pb-3">
        <div class="flex bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1 gap-1">
          <button
            @click="setActiveStatistic('statistics')"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-[10px] transition-all duration-200',
              activeStatistic === 'statistics'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-600/50'
            ]"
          >
            <v-icon name="hi-solid-table" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Details</span>
          </button>

          <button
            @click="setActiveStatistic('topscorers')"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-[10px] transition-all duration-200',
              activeStatistic === 'topscorers'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-600/50'
            ]"
          >
            <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Top Scorers</span>
            <span class="sm:hidden">Top</span>
          </button>

          <button
            @click="setActiveStatistic('fantasypoints')"
            :class="[
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-[10px] transition-all duration-200',
              activeStatistic === 'fantasypoints'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-600/50'
            ]"
          >
            <v-icon name="gi-soccer-ball" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Fantasy</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Dynamic Content Area -->
    <div class="relative">
      <Transition name="statistic-content" mode="out-in">
        <div v-if="activeStatistic === 'statistics'" key="statistics">
          <FootballPlayerStatistic :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>
        <div v-else-if="activeStatistic === 'topscorers'" key="topscorers">
          <FootballPlayerTopScore :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>
        <div v-else-if="activeStatistic === 'fantasypoints'" key="fantasypoints">
          <FootballPlayerFantasyPoints :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FootballPlayerStatistic from '@/components/football/player/FootballPlayerStatistic.vue'
import FootballPlayerTopScore from '@/components/football/player/FootballPlayerTopScore.vue'
import FootballPlayerFantasyPoints from '@/components/football/player/FootballPlayerFantasyPoints.vue'

// Props
interface Props {
  fantasyLeagueUuid: string
}

defineProps<Props>()

// Reactive data
const activeStatistic = ref<'statistics' | 'topscorers' | 'fantasypoints'>('statistics')

// Methods
const setActiveStatistic = (statistic: 'statistics' | 'topscorers' | 'fantasypoints') => {
  activeStatistic.value = statistic
}
</script>

<style scoped>
.statistic-content-enter-active,
.statistic-content-leave-active {
  transition: opacity 0.2s ease;
}

.statistic-content-enter-from,
.statistic-content-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .statistic-content-enter-active,
  .statistic-content-leave-active {
    transition: none !important;
  }
}
</style>
