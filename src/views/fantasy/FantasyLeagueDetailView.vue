<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 py-4 md:py-6 pb-20 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Navegación de liga: salir ← / pestañas principales / "Más" -->
      <FantasyLeagueNav :active-key="activeTab" :league-uuid="uuid" />

      <!-- Contenido de la pestaña activa.
           La entrada es una animación CSS sobre un contenedor con :key, no un
           <Transition>: el modo out-in se quedaba a medias y dejaba pegada la
           clase tab-content-enter-from (opacity: 0), que había que contrarrestar
           a mano con un hook onEnter. Con :key el bloque se vuelve a montar en
           cada cambio y la animación se dispara sola. -->
      <div class="relative">
        <div :key="activeTab" class="tab-panel">
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- Standings Content — league-wide table (visible to everyone) -->
          <div v-else-if="activeTab === 'standings'" key="standings">
            <FantasyStandings :fantasy-league-uuid="uuid" />
          </div>

          <!-- Playoff bracket — only rendered for leagues that play one -->
          <div v-else-if="activeTab === 'playoffs'" key="playoffs">
            <FantasyPlayoffBracket :fantasy-league-uuid="uuid" />
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

          <!-- Management Content — el editor pide sus propias reglas, que traen
               además el valor por defecto y el estado de bloqueo. -->
          <div v-else-if="activeTab === 'management'" key="management">
            <FantasyScoringRulesEditor :league-uuid="uuid" />
          </div>
        </div>
      </div>
    </div>

    <!-- Soft fade behind the floating nav so content scrolling under it fades
         out instead of being hard-clipped by the pill. -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from '@/components/home/HomeMenu.vue'
import FantasyLeagueNav from '@/components/fantasy/FantasyLeagueNav.vue'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FantasyStandings from '@/components/fantasy/standings/FantasyStandings.vue'
import FantasyPlayoffBracket from '@/components/fantasy/playoffs/FantasyPlayoffBracket.vue'
import FantasyScoringRules from '@/components/fantasy/rules/FantasyScoringRules.vue'
import FantasyScoringRulesEditor from '@/components/fantasy/rules/FantasyScoringRulesEditor.vue'
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

// Store persists across routes — no clearing on unmount

// Cargar datos al montar
onMounted(() => {
  fetchLeagueData()
})
</script>

<style scoped>
/* Tab content: sólo entrada, sin salida animada (ver el comentario del bloque).
   Sin fill-mode a propósito: con `both`, una pestaña en segundo plano deja la
   animación congelada en su primer fotograma y el contenido se queda en
   opacity 0. Sin fill, si la animación no corre el bloque simplemente se ve. */
.tab-panel {
  animation: tab-panel-in 0.2s ease;
}

@keyframes tab-panel-in {
  from {
    opacity: 0;
  }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .tab-panel {
    animation: none;
  }
}
</style>
