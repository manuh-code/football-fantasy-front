<template>
  <!-- Single centered primary action (Gaming) in the shared floating pill nav. -->
  <BottomNavBar
    :visible="isVisible"
    :items="items"
    active-key="gaming"
    aria-label="Home navigation"
    @select="goToGaming"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import BottomNavBar, { type BottomNavItem } from '@/components/ui/BottomNavBar.vue'

const router = useRouter()
const footballLeagueStore = useFootballLeagueStore()

const isVisible = computed(() => footballLeagueStore.existLeague())

const items: BottomNavItem[] = [
  { key: 'gaming', label: 'Gaming', icon: 'bi-trophy-fill', accent: 'blue' },
]

function goToGaming() {
  router.push({ name: 'gaming' })
}
</script>
