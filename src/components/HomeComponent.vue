<template>
  <div>
    <template v-if="hasLeague">
      <RoundFixtureCarousel />
      <LeagueStandingCurrent />
    </template>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";

// Lazy-load these heavy components only when a league is selected
const RoundFixtureCarousel = defineAsyncComponent(() => import('@/components/football/fixtures/RoundFixtureCarousel.vue'))
const LeagueStandingCurrent = defineAsyncComponent(() => import('@/components/football/leagues/LeagueStandingCurrent.vue'))

const store = useFootballLeagueStore();

const hasLeague = computed(() => store.existLeague())
</script>

<style scoped>
/* HomeComponent minimal */
</style>
