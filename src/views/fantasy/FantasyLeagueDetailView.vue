<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Page Header -->
      <PageHeader back-text="Back" breadcrumb-to="/user-fantasy-leagues" breadcrumb-text="My Leagues"
        current-page-text="League Details" />

      <!-- Sub Navigation Menu -->
      <TabNavigationComponent 
        :tabs="navigationTabs" 
        :active-tab="activeTab"
        @update:active-tab="setActiveTab"
      />

      <!-- Dynamic Content Area with Smooth Transitions -->
      <div class="relative">
        <Transition name="tab-content" mode="out-in" @enter="onEnter" @leave="onLeave">
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview" class="animate-fade-in">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- Player Statistics Content -->
          <div v-else-if="activeTab === 'statistics'" key="statistics" class="animate-fade-in">
            <!-- Football Player Statistics Menu Component -->
            <FootballPlayerStatisticMenu :fantasy-league-uuid="uuid" />
          </div>

          <!-- Management Content (Coming Soon) -->
          <div v-else-if="activeTab === 'management'" key="management" class="animate-fade-in">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-12 text-center">
                <div
                  class="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <v-icon name="hi-solid-cog" class="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">League Management</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Manage your league settings, participants, and administrative functions.
                </p>
                <div
                  class="inline-flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg">
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
                <div
                  class="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <v-icon name="hi-solid-adjustments" class="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">League Settings</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Configure league preferences, privacy settings, and advanced options.
                </p>
                <div
                  class="inline-flex items-center px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg">
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
import { ref, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FootballPlayerStatisticMenu from '@/components/football/player/FootballPlayerStatisticMenu.vue'
import { PageHeader, TabNavigationComponent } from '@/components/ui'
import type { Tab } from '@/components/ui/TabNavigationComponent.vue'

const route = useRoute()
const uuid = route.params.uuid as string
const activeTab = ref('overview')

// Navigation tabs configuration
const navigationTabs = computed<Tab[]>(() => [
  {
    key: 'overview',
    label: 'League Overview',
    icon: 'hi-solid-information-circle',
    color: 'blue'
  },
  {
    key: 'statistics', 
    label: 'Player Statistics',
    icon: 'hi-solid-chart-bar',
    color: 'emerald'
  },
  {
    key: 'management',
    label: 'Management',
    icon: 'hi-solid-cog',
    color: 'purple',
    disabled: true,
    badge: 'Soon'
  },
  {
    key: 'settings',
    label: 'Settings', 
    icon: 'hi-solid-adjustments',
    color: 'orange',
    disabled: true,
    badge: 'Soon'
  }
])

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
