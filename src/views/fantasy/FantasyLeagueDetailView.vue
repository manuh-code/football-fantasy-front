<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-6 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Dynamic Content Area with Smooth Transitions -->
      <div class="relative">
        <Transition name="tab-content" mode="out-in" @enter="onEnter" @leave="onLeave">
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- My Team Content -->
          <div v-else-if="activeTab === 'myteam'" key="myteam">
            <MyFantasyTeamComponent :fantasy-league-uuid="uuid" />
          </div>

          <!-- Player Statistics Content -->
          <div v-else-if="activeTab === 'statistics'" key="statistics">
            <FootballPlayerStatisticMenu :fantasy-league-uuid="uuid" />
          </div>

          <!-- Matchups Content -->
          <div v-else-if="activeTab === 'matchups'" key="matchups">
            <FantasyLeagueMatchup :fantasy-league-uuid="uuid" />
          </div>

          <!-- Management Content -->
          <div v-else-if="activeTab === 'management'" key="management">
            <!-- Loading State -->
            <div v-if="isLoadingLeague" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center">
              <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" animation="spin" />
              <p class="text-[13px] text-gray-400 dark:text-gray-500 mt-3">Loading management data...</p>
            </div>
            
            <!-- No Scoring Data -->
            <div v-else-if="!scoringData" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center">
              <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">No Scoring Rules</h3>
              <p class="text-[13px] text-gray-400 dark:text-gray-500">
                This league doesn't have scoring rules configured yet.
              </p>
            </div>
            
            <!-- Management Component -->
            <FantasyLeagueManagement 
              v-else
              :scoring-data="scoringData" 
              :league-uuid="uuid"
              @saved="handleLeagueSaved"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FantasyLeagueManagement from '@/components/fantasy/FantasyLeagueManagement.vue'
import FootballPlayerStatisticMenu from '@/components/football/player/FootballPlayerStatisticMenu.vue'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'
import FantasyLeagueMatchup from '@/components/fantasy/matchups/FantasyLeagueMatchup.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import { FantasyLeagueScoringRules } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'

const route = useRoute()
const router = useRouter()
const leagueDetailStore = useFantasyLeagueDetailStore()
const uuid = route.params.uuid as string
// Initialize activeTab from query param or default to 'overview'
const activeTab = ref((route.query.tab as string) || 'overview')
const league = ref<FantasyLeaguesResponse | null>(null)
const isLoadingLeague = ref(false)

// Tabs that require membership
const memberTabs = new Set(['myteam', 'statistics', 'matchups'])
// Tabs that require admin
const adminTabs = new Set(['management'])

/**
 * Validate if the user has access to the given tab.
 * Returns the tab if allowed, or 'overview' if not.
 */
function validateTab(tab: string): string {
  const isMember = leagueDetailStore.isMember
  const isAdmin = leagueDetailStore.isAdmin

  if (adminTabs.has(tab) && !isAdmin) return 'overview'
  if (memberTabs.has(tab) && !isMember && !isAdmin) return 'overview'
  return tab
}

// Watch for changes in route query to sync activeTab (with validation)
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    const validTab = validateTab(newTab)
    activeTab.value = validTab
    // If tab was blocked, update URL to reflect the actual tab
    if (validTab !== newTab) {
      router.replace({ query: { ...route.query, tab: validTab } })
    }
  }
})

// Re-validate active tab when store permissions change (after league loads)
watch(() => [leagueDetailStore.isMember, leagueDetailStore.isAdmin], () => {
  const requestedTab = (route.query.tab as string) || 'overview'
  const validTab = validateTab(requestedTab)
  activeTab.value = validTab
  if (validTab !== requestedTab) {
    router.replace({ query: { ...route.query, tab: validTab } })
  }
})

// Computed para obtener las reglas de puntuación
const scoringData = computed<FantasyLeagueScoringRules[] | null>(() => {
  if (!league.value || !league.value.scoring_rules || league.value.scoring_rules.length === 0) {
    return null
  }
  // Retornar el array completo de scoring_rules (ya viene agrupado por posición)
  return league.value.scoring_rules
})

// Cargar datos de la liga
const fetchLeagueData = async () => {
  try {
    isLoadingLeague.value = true
    league.value = await fantasyLeagueService.showFantasyLeague(uuid)
    leagueDetailStore.setCurrentLeague(league.value)
  } catch (error) {
    console.error('Error loading league data:', error)
  } finally {
    isLoadingLeague.value = false
  }
}

const setActiveTab = (tab: string) => {
  activeTab.value = tab
  // Update URL query param to reflect active tab
  router.replace({ 
    name: 'fantasyLeagueDetail', 
    params: { uuid }, 
    query: { tab } 
  })
}

const handleLeagueSaved = () => {
  // Recargar datos de la liga después de guardar
  fetchLeagueData()
}

// Store persists across routes — no clearing on unmount

// Transition event handlers
const onEnter = (el: Element) => {
  nextTick(() => {
    (el as HTMLElement).style.opacity = '1'
  })
}

const onLeave = (el: Element) => {
  (el as HTMLElement).style.opacity = '0'
}

// Cargar datos al montar
onMounted(() => {
  fetchLeagueData()
})
</script>

<style scoped>
/* Tab content transitions */
.tab-content-enter-active,
.tab-content-leave-active {
  transition: opacity 0.2s ease;
}

.tab-content-enter-from,
.tab-content-leave-to {
  opacity: 0;
}

.tab-content-enter-to,
.tab-content-leave-from {
  opacity: 1;
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .tab-content-enter-active,
  .tab-content-leave-active {
    transition: none !important;
  }
}
</style>
