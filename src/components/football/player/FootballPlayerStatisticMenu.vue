<template>
  <div class="space-y-6">
    <!-- Statistics Header with Menu -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Player Statistics</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                View detailed statistics and rankings for players in this league
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Type Menu -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-750">
        <div class="flex flex-col sm:flex-row gap-2">
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
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, defineProps } from 'vue'
import FootballPlayerStatistic from '@/components/football/player/FootballPlayerStatistic.vue'
import FootballPlayerTopScore from '@/components/football/player/FootballPlayerTopScore.vue'

// Props
interface Props {
  fantasyLeagueUuid: string
}

defineProps<Props>()

// Reactive data
const activeStatistic = ref<'statistics' | 'topscorers'>('statistics')

// Methods
const setActiveStatistic = (statistic: 'statistics' | 'topscorers') => {
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
