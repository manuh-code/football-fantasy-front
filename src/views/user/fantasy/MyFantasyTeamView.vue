<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Secondary tabs shared across the fantasy-league screens -->
      <TopTabsBar
        :items="tabItems"
        active-key="myteam"
        :aria-label="$t('fantasy.detailTabs.nav')"
        @select="onTabSelect"
      />

      <MyFantasyTeamComponent :fantasy-league-uuid="fantasyLeagueUuid" />
    </div>

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HomeMenu from '@/components/home/HomeMenu.vue'
import TopTabsBar from '@/components/ui/TopTabsBar.vue'
import { useFantasyLeagueTabs } from '@/composables/useFantasyLeagueTabs'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'

// Set page title
document.title = 'My Fantasy Team - Football Fantasy'

const route = useRoute()
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
</script>
