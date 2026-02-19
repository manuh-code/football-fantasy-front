<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Dynamic Content Area with Smooth Transitions -->
      <div class="relative">
        <Transition name="tab-content" mode="out-in" @enter="onEnter" @leave="onLeave">
          <!-- League Overview Content -->
          <div v-if="activeTab === 'overview'" key="overview" class="animate-fade-in">
            <FantasyLeagueDetail :uuid="uuid" />
          </div>

          <!-- My Team Content -->
          <div v-else-if="activeTab === 'myteam'" key="myteam" class="animate-fade-in">
            <MyFantasyTeamComponent :fantasy-league-uuid="uuid" />
          </div>

          <!-- Player Statistics Content -->
          <div v-else-if="activeTab === 'statistics'" key="statistics" class="animate-fade-in">
            <!-- Football Player Statistics Menu Component -->
            <FootballPlayerStatisticMenu :fantasy-league-uuid="uuid" />
          </div>

          <!-- Management Content -->
          <div v-else-if="activeTab === 'management'" key="management" class="animate-fade-in">
            <!-- Loading State -->
            <div v-if="isLoadingLeague" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Cargando datos de gestión...</p>
            </div>
            
            <!-- No Scoring Data -->
            <div v-else-if="!scoringData" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div class="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                <v-icon name="hi-solid-exclamation" class="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sin Reglas de Puntuación</h3>
              <p class="text-gray-600 dark:text-gray-400">
                Esta liga aún no tiene reglas de puntuación configuradas.
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
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FantasyLeagueDetail from '@/components/fantasy/FantasyLeagueDetail.vue'
import FantasyLeagueManagement from '@/components/fantasy/FantasyLeagueManagement.vue'
import FootballPlayerStatisticMenu from '@/components/football/player/FootballPlayerStatisticMenu.vue'
import MyFantasyTeamComponent from '@/components/user/fantasy/MyFantasyTeamComponent.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import { FantasyLeagueScoringRules } from '@/interfaces/fantasy/leagues/FantasyLeagueScoringRules'

const route = useRoute()
const router = useRouter()
const uuid = route.params.uuid as string
// Initialize activeTab from query param or default to 'overview'
const activeTab = ref((route.query.tab as string) || 'overview')
const league = ref<FantasyLeaguesResponse | null>(null)
const isLoadingLeague = ref(false)

// Watch for changes in route query to sync activeTab
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    activeTab.value = newTab
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
  transition: all 0.3s ease-in-out;
}

.tab-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.tab-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.tab-content-enter-to,
.tab-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Fade in animation for tab content */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {

  .tab-content-enter-active,
  .tab-content-leave-active,
  .animate-fade-in {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
</style>
