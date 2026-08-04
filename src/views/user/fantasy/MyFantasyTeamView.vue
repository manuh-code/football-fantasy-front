<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Navegación de liga compartida por las tres pantallas de fantasy -->
      <FantasyLeagueNav active-key="myteam" :league-uuid="fantasyLeagueUuid" />

      <MyFantasyTeamComponent :fantasy-league-uuid="fantasyLeagueUuid" />
    </div>

    <!-- Soft fade behind the floating nav so the long lineup scrolling under it
         fades out instead of being hard-clipped by the pill. -->
    <div
      class="fixed inset-x-0 bottom-0 h-24 z-[90] pointer-events-none bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"
      aria-hidden="true"
    />

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import HomeMenu from '@/components/home/HomeMenu.vue'
import FantasyLeagueNav from '@/components/fantasy/FantasyLeagueNav.vue'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'

const { t } = useI18n()

// Set page title (localized, consistent with the other fantasy views)
document.title = t('fantasy.myTeam.pageTitle')

const route = useRoute()
const leagueDetailStore = useFantasyLeagueDetailStore()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)

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
