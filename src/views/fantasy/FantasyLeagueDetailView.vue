<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-6 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Secondary tabs: My Leagues / Overview / Team / Players / Matches -->
      <TopTabsBar
        :items="tabItems"
        :active-key="activeTab"
        :aria-label="$t('fantasy.detailTabs.nav')"
        @select="onTabSelect"
      />

      <!-- Dynamic Content Area with Smooth Transitions -->
      <div class="relative">
        <Transition name="tab-content" mode="out-in" @enter="onEnter" @leave="onLeave">
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- Standings Content — league-wide table (visible to everyone) -->
          <div v-else-if="activeTab === 'standings'" key="standings">
            <FantasyStandings :fantasy-league-uuid="uuid" />
          </div>

          <!-- Scoring Rules Content — read-only, visible to everyone -->
          <div v-else-if="activeTab === 'rules'" key="rules">
            <!-- Loading State -->
            <div v-if="isLoadingLeague" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center">
              <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" animation="spin" />
              <p class="text-footnote text-gray-400 dark:text-gray-500 mt-3">{{ $t('fantasy.rules.loading') }}</p>
            </div>

            <!-- No Scoring Data -->
            <div v-else-if="!scoringData" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center px-6">
              <div class="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <v-icon name="hi-solid-exclamation" class="w-7 h-7 text-amber-400" />
              </div>
              <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.rules.emptyTitle') }}</h3>
              <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                {{ $t('fantasy.rules.emptyBody') }}
              </p>
            </div>

            <!-- Scoring Rules Component -->
            <FantasyScoringRules v-else :scoring-data="scoringData" />
          </div>

          <!-- My Team Content -->
          <div v-else-if="activeTab === 'myteam'" key="myteam">
            <MyFantasyTeamComponent :fantasy-league-uuid="uuid" />
          </div>

          <!-- Player Statistics Content -->
          <div v-else-if="activeTab === 'statistics'" key="statistics">
            <FootballPlayerStatisticMenu :fantasy-league-uuid="uuid" />
          </div>

          <!-- Matches Content ("Partidos" tab) -->
          <div v-else-if="activeTab === 'matches'" key="matches">
            <FantasyLeagueMatchup :fantasy-league-uuid="uuid" />
          </div>

          <!-- Trades Content -->
          <div v-else-if="activeTab === 'trades'" key="trades">
            <FantasyTradeCenter :fantasy-league-uuid="uuid" />
          </div>

          <!-- Management Content -->
          <div v-else-if="activeTab === 'management'" key="management">
            <!-- Loading State -->
            <div v-if="isLoadingLeague" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center">
              <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" animation="spin" />
              <p class="text-footnote text-gray-400 dark:text-gray-500 mt-3">{{ $t('fantasy.management.loadingRules') }}</p>
            </div>

            <!-- No Scoring Data -->
            <div v-else-if="!scoringData" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-16 text-center px-6">
              <div class="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <v-icon name="hi-solid-exclamation" class="w-7 h-7 text-amber-400" />
              </div>
              <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.management.noRulesTitle') }}</h3>
              <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                {{ $t('fantasy.management.noRulesBody') }}
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

    <!-- Fixed bottom navigation; Play stays selected here and returns to the
         Gaming screen — see HomeMenu. -->
    <HomeMenu />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from '@/components/home/HomeMenu.vue'
import TopTabsBar from '@/components/ui/TopTabsBar.vue'
import { useFantasyLeagueTabs } from '@/composables/useFantasyLeagueTabs'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FantasyStandings from '@/components/fantasy/standings/FantasyStandings.vue'
import FantasyScoringRules from '@/components/fantasy/rules/FantasyScoringRules.vue'
import FantasyLeagueManagement from '@/components/fantasy/FantasyLeagueManagement.vue'
import FootballPlayerStatisticMenu from '@/components/football/player/FootballPlayerStatisticMenu.vue'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'
import FantasyLeagueMatchup from '@/components/fantasy/matchups/FantasyLeagueMatchup.vue'
import FantasyTradeCenter from '@/components/fantasy/trades/FantasyTradeCenter.vue'
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
const memberTabs = new Set(['myteam', 'statistics', 'matchups', 'matches', 'trades'])
// Tabs that require admin
const adminTabs = new Set(['management'])

// Secondary top tabs shared across the fantasy-league screens (the fixed
// bottom nav lives in HomeMenu) — items, gating and navigation come from the
// composable so detail / player search / my team stay in sync.
const { tabItems, onTabSelect } = useFantasyLeagueTabs(() => uuid)

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
