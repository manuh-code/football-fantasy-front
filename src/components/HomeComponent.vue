<template>
  <div class="space-y-4 sm:space-y-6">
    <template v-if="hasLeague">
      <WeeklyFixturesCarousel />
      <LeagueStanding />
    </template>
    <template v-else>
      <div class="text-center py-8 sm:py-12">
        <div class="text-gray-400 dark:text-gray-500">
          <v-icon name="md-sportssoccer" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 class="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
            Select a league
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Choose your favorite league to view fixtures and statistics
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";

// Lazy-load these heavy components only when a league is selected
const WeeklyFixturesCarousel = defineAsyncComponent(() => import('@/components/football/fixtures/WeeklyFixturesCarousel.vue'))
const LeagueStanding = defineAsyncComponent(() => import('@/components/football/leagues/LeagueStanding.vue'))

const store = useFootballLeagueStore();

const hasLeague = computed(() => store.existLeague())
</script>

<style scoped>
/* HomeComponent minimal */
</style>
