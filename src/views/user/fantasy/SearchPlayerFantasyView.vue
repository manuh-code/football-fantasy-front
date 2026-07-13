<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Secondary tabs shared across the fantasy-league screens -->
      <TopTabsBar
        :items="tabItems"
        active-key="players"
        :aria-label="$t('fantasy.detailTabs.nav')"
        @select="onTabSelect"
      />

      <!-- Search Player Component -->
      <SearchPlayerFantasy
        :fantasy-league-uuid="fantasyLeagueUuid"
        @player-added="handlePlayerAdded"
      />
    </div>

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from '@/components/home/HomeMenu.vue'
import TopTabsBar from '@/components/ui/TopTabsBar.vue'
import { useFantasyLeagueTabs } from '@/composables/useFantasyLeagueTabs'
import SearchPlayerFantasy from '@/components/user/fantasy/SearchPlayerFantasy.vue'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'

const route = useRoute()
const router = useRouter()
const leagueDetailStore = useFantasyLeagueDetailStore()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)

const { tabItems, onTabSelect } = useFantasyLeagueTabs(() => fantasyLeagueUuid.value)

// The member/admin gating of the tabs needs the league in the store (e.g.
// when this screen is opened directly via URL).
onMounted(async () => {
  if (!leagueDetailStore.currentLeague && fantasyLeagueUuid.value) {
    try {
      const league = await fantasyLeagueService.showFantasyLeague(fantasyLeagueUuid.value)
      leagueDetailStore.setCurrentLeague(league)
    } catch (error) {
      console.error('Error loading league for the tabs:', error)
    }
  }
})

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
