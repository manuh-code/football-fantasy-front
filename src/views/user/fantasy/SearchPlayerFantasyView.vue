<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
   

      <!-- Search Player Component -->
      <SearchPlayerFantasy
        :fantasy-league-uuid="fantasyLeagueUuid"
        @player-added="handlePlayerAdded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchPlayerFantasy from '@/components/user/fantasy/SearchPlayerFantasy.vue'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'

const route = useRoute()
const router = useRouter()
const leagueDetailStore = useFantasyLeagueDetailStore()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)

onMounted(async () => {
  if (!leagueDetailStore.currentLeague && fantasyLeagueUuid.value) {
    try {
      const league = await fantasyLeagueService.showFantasyLeague(fantasyLeagueUuid.value)
      leagueDetailStore.setCurrentLeague(league)
    } catch (error) {
      console.error('Error loading league for footer menu:', error)
    }
  }
})

/**
 * Navigate back to the league detail view (myteam tab).
 */
function goBack() {
  router.push({
    name: 'fantasyLeagueDetail',
    params: { uuid: fantasyLeagueUuid.value },
    query: { tab: 'myteam' },
  })
}

/**
 * After a player is added, redirect back to team view with highlight.
 */
function handlePlayerAdded(player: FantasyPlayerDraftResponse) {
  const playerUuid = player.player?.uuid
  router.push({
    name: 'fantasyLeagueDetail',
    params: { uuid: fantasyLeagueUuid.value },
    query: {
      tab: 'myteam',
      ...(playerUuid ? { highlightPlayer: playerUuid } : {}),
    },
  })
}
</script>
