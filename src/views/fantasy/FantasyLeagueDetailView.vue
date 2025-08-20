<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader
        back-text="Back"
        breadcrumb-to="/user-fantasy-leagues"
        breadcrumb-text="My Leagues"
        current-page-text="League Details"
      />

      <!-- Sub Navigation Menu -->
      <div class="mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <!-- Desktop Navigation (hidden on mobile) -->
          <nav class="hidden md:flex" aria-label="League Navigation">
            <!-- League Overview Tab -->
            <button
              @click="setActiveTab('overview')"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                activeTab === 'overview'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <v-icon name="hi-solid-information-circle" class="w-4 h-4" />
                <span>League Overview</span>
              </div>
            </button>

            <!-- Player Statistics Tab -->
            <button
              @click="setActiveTab('statistics')"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                activeTab === 'statistics'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <div class="flex items-center justify-center gap-2">
                <v-icon name="hi-solid-chart-bar" class="w-4 h-4" />
                <span>Player Statistics</span>
              </div>
            </button>

            <!-- League Management Tab (for future use) -->
            <button
              @click="setActiveTab('management')"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                activeTab === 'management'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
              disabled
            >
              <div class="flex items-center justify-center gap-2">
                <v-icon name="hi-solid-cog" class="w-4 h-4" />
                <span>Management</span>
                <span class="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                  Soon
                </span>
              </div>
            </button>

            <!-- League Settings Tab (for future use) -->
            <button
              @click="setActiveTab('settings')"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                activeTab === 'settings'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-b-2 border-orange-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
              disabled
            >
              <div class="flex items-center justify-center gap-2">
                <v-icon name="hi-solid-adjustments" class="w-4 h-4" />
                <span>Settings</span>
                <span class="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                  Soon
                </span>
              </div>
            </button>
          </nav>

          <!-- Mobile Navigation (visible only on mobile) -->
          <nav class="md:hidden" aria-label="League Navigation">
            <!-- Active tabs section -->
            <div class="grid grid-cols-2 gap-0">
              <!-- League Overview Tab -->
              <button
                @click="setActiveTab('overview')"
                :class="[
                  'px-3 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  activeTab === 'overview'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex flex-col items-center gap-1">
                  <v-icon name="hi-solid-information-circle" class="w-5 h-5" />
                  <span class="text-xs leading-tight">League Overview</span>
                </div>
              </button>

              <!-- Player Statistics Tab -->
              <button
                @click="setActiveTab('statistics')"
                :class="[
                  'px-3 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  activeTab === 'statistics'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex flex-col items-center gap-1">
                  <v-icon name="hi-solid-chart-bar" class="w-5 h-5" />
                  <span class="text-xs leading-tight">Player Statistics</span>
                </div>
              </button>
            </div>

            <!-- Coming Soon tabs section -->
            <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div class="grid grid-cols-2 gap-0">
                <!-- League Management Tab (disabled) -->
                <button
                  disabled
                  class="px-3 py-3 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  <div class="flex flex-col items-center gap-1">
                    <div class="relative">
                      <v-icon name="hi-solid-cog" class="w-4 h-4" />
                    </div>
                    <span class="text-xs leading-tight">Management</span>
                    <span class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </div>
                </button>

                <!-- League Settings Tab (disabled) -->
                <button
                  disabled
                  class="px-3 py-3 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  <div class="flex flex-col items-center gap-1">
                    <div class="relative">
                      <v-icon name="hi-solid-adjustments" class="w-4 h-4" />
                    </div>
                    <span class="text-xs leading-tight">Settings</span>
                    <span class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <!-- Dynamic Content Area with Smooth Transitions -->
      <div class="relative">
        <Transition 
          name="tab-content" 
          mode="out-in"
          @enter="onEnter"
          @leave="onLeave"
        >
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview" class="animate-fade-in">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- Player Statistics Content -->
          <div v-else-if="activeTab === 'statistics'" key="statistics" class="animate-fade-in">
            <!-- Statistics Header -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Player Statistics</h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      View detailed statistics for players in this league
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Football Player Statistics Component -->
            <FootballPlayerStatistic :fantasy-league-uuid="uuid" />
          </div>

          <!-- Management Content (Coming Soon) -->
          <div v-else-if="activeTab === 'management'" key="management" class="animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-12 text-center">
                <div class="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <v-icon name="hi-solid-cog" class="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">League Management</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Manage your league settings, participants, and administrative functions.
                </p>
                <div class="inline-flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg">
                  <v-icon name="hi-solid-clock" class="w-4 h-4 mr-2" />
                  <span class="text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Content (Coming Soon) -->
          <div v-else-if="activeTab === 'settings'" key="settings" class="animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-12 text-center">
                <div class="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <v-icon name="hi-solid-adjustments" class="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">League Settings</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Configure league preferences, privacy settings, and advanced options.
                </p>
                <div class="inline-flex items-center px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg">
                  <v-icon name="hi-solid-clock" class="w-4 h-4 mr-2" />
                  <span class="text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FootballPlayerStatistic from '@/components/football/player/FootballPlayerStatistic.vue'
import { PageHeader } from '@/components/ui'

const route = useRoute()
const uuid = route.params.uuid as string
const activeTab = ref('overview')

const setActiveTab = (tab: string) => {
  activeTab.value = tab
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
/* Tab content transitions */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: all 0.3s ease-in-out;
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.tab-content-enter-to,
.tab-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Fade in animation for tab content */
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
  .tab-content-enter-active,
  .tab-content-leave-active,
  .animate-fade-in {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>
