<template>
  <div class="space-y-6">
    <!-- Statistics Header with Menu -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <!-- Simplified Header for Mobile -->
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <v-icon name="hi-solid-chart-bar" class="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base md:text-xl font-semibold text-gray-900 dark:text-white truncate">Player Statistics</h2>
            <p class="hidden md:block text-sm text-gray-600 dark:text-gray-400">
              View detailed statistics and rankings for players in this league
            </p>
          </div>
        </div>
      </div>

      <!-- Mobile-Friendly Statistics Type Menu -->
      <div class="px-3 md:px-6 py-3 md:py-4 bg-gray-50 dark:bg-gray-750">
        <!-- Desktop: Row layout with full buttons -->
        <div class="hidden md:flex gap-2">
          <!-- Player Statistics Tab -->
          <button
            @click="setActiveStatistic('statistics')"
            :class="[
              'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
              activeStatistic === 'statistics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <v-icon name="hi-solid-table" class="w-4 h-4" />
              <span>Detailed Statistics</span>
            </div>
          </button>

          <!-- Top Scorers Tab -->
          <button
            @click="setActiveStatistic('topscorers')"
            :class="[
              'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500',
              activeStatistic === 'topscorers'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <v-icon name="bi-trophy-fill" class="w-4 h-4" />
              <span>Top Scorers</span>
            </div>
          </button>

          <!-- Fantasy Points Tab -->
          <button
            @click="setActiveStatistic('fantasypoints')"
            :class="[
              'flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500',
              activeStatistic === 'fantasypoints'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <div class="flex items-center justify-center gap-2">
              <v-icon name="gi-soccer-ball" class="w-4 h-4" />
              <span>Fantasy Points</span>
            </div>
          </button>
        </div>

        <!-- Mobile: Compact grid layout with icons -->
        <div class="md:hidden grid grid-cols-3 gap-2">
          <!-- Player Statistics Tab -->
          <button
            @click="setActiveStatistic('statistics')"
            :class="[
              'flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
              activeStatistic === 'statistics'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <v-icon name="hi-solid-table" class="w-6 h-6" />
            <span class="text-xs font-medium leading-tight text-center">Details</span>
          </button>

          <!-- Top Scorers Tab -->
          <button
            @click="setActiveStatistic('topscorers')"
            :class="[
              'flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500',
              activeStatistic === 'topscorers'
                ? 'bg-yellow-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <v-icon name="bi-trophy-fill" class="w-6 h-6" />
            <span class="text-xs font-medium leading-tight text-center">Top Scorers</span>
          </button>

          <!-- Fantasy Points Tab -->
          <button
            @click="setActiveStatistic('fantasypoints')"
            :class="[
              'flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500',
              activeStatistic === 'fantasypoints'
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            ]"
          >
            <v-icon name="gi-soccer-ball" class="w-6 h-6" />
            <span class="text-xs font-medium leading-tight text-center">Fantasy</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Dynamic Content Area -->
    <div class="relative">
      <Transition name="statistic-content" mode="out-in" @enter="onEnter" @leave="onLeave">
        <!-- Detailed Statistics Component -->
        <div v-if="activeStatistic === 'statistics'" key="statistics" class="animate-fade-in">
          <FootballPlayerStatistic :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>

        <!-- Top Scorers Component -->
        <div v-else-if="activeStatistic === 'topscorers'" key="topscorers" class="animate-fade-in">
          <FootballPlayerTopScore :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>

        <!-- Fantasy Points Component -->
        <div v-else-if="activeStatistic === 'fantasypoints'" key="fantasypoints" class="animate-fade-in">
          <FootballPlayerFantasyPoints :fantasy-league-uuid="fantasyLeagueUuid" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
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

// Transition event handlers
const onEnter = (el: Element) => {
  nextTick(() => {
    (el as HTMLElement).style.opacity = '1'
  })
}

const onLeave = (el: Element) => {
  (el as HTMLElement).style.opacity = '0'
}
</script>

<style scoped>
/* Statistic content transitions */
.statistic-content-enter-active,
.statistic-content-leave-active {
  transition: all 0.3s ease-in-out;
}

.statistic-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.statistic-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.statistic-content-enter-to,
.statistic-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Fade in animation for statistic content */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .statistic-content-enter-active,
  .statistic-content-leave-active,
  .animate-fade-in {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>
