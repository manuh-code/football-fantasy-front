<template>
  <div class="space-y-6">
    <!-- Filters Section -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <v-icon name="bi-trophy-fill" class="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base md:text-xl font-semibold text-gray-900 dark:text-white truncate">Top Scorers</h2>
            <p class="hidden md:block text-sm text-gray-600 dark:text-gray-400">
              Find the highest scoring players
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 md:p-6">
        <form @submit.prevent="() => searchTopScorers()"
          class="space-y-4">
          <!-- Filters Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Season Selection -->
          <div>
            <SelectComponent
              v-model="selectedSeasonUuid"
              :options="seasons"
              value-key="uuid"
              label-key="name"
              label="Season"
              placeholder="Select a season"
              :disabled="isLoadingSeasons"
              :class="seasonError ? 'border-red-500' : ''"
              @change="onSeasonChange"
            />
            <div v-if="isLoadingSeasons" class="mt-1 text-xs text-gray-500">
              <v-icon name="pr-spinner" class="w-3 h-3 inline mr-1" animation="spin" />
              Loading seasons...
            </div>
            <div v-if="seasonError" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ seasonError }}
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <SelectComponent
              v-model="selectedTypeUuid"
              :options="typeOptions"
              label="Score Type"
              placeholder="Select score type..."
              :disabled="!selectedSeasonUuid || loadingTypes"
              :loading="loadingTypes"
            />
          </div>
          </div>

          <!-- Search Buttons -->
          <div class="flex flex-col md:flex-row justify-end gap-3">
            <ButtonComponent 
              type="button" 
              variant="outline" 
              size="md" 
              text="Clear Filters"
              @click="clearFilters" 
              :full-width="true"
              class="md:w-auto"
            />
            <ButtonComponent
              type="submit"
              variant="primary"
              size="md"
              text="Search Top Scorers"
              icon="hi-search"
              :loading="loadingTopScorers"
              :disabled="!selectedSeasonUuid || !selectedTypeUuid"
              :full-width="true"
              class="md:w-auto"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- Results Section -->
    <div ref="resultsSection" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex items-center gap-2 md:gap-3">
            <div class="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <v-icon name="bi-trophy-fill" class="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="min-w-0">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">Top Scorers Results</h3>
              <p v-if="topScorers.length" class="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {{ paginationData?.from }}-{{ paginationData?.to }} of {{ paginationData?.total || 0 }} players
              </p>
            </div>
          </div>
          
          <!-- Items per page selector -->
          <div v-if="topScorers.length" class="flex items-center gap-2">
            <label for="per-page-select" class="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
              Show
            </label>
            <SelectComponent
              id="per-page-select"
              v-model="perPage"
              :options="perPageOptions"
              value-key="value"
              label-key="label"
              class="w-16 md:w-20"
              @change="onPerPageChange"
            />
            <span class="text-xs md:text-sm text-gray-600 dark:text-gray-400">per page</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingTopScorers" class="p-6 md:p-8 text-center">
        <div class="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading top scorers...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center">
            <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading data</h3>
              <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loadingTopScorers && topScorers.length === 0 && hasSearched" class="p-6 md:p-8 text-center">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <v-icon name="hi-solid-search" class="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
        </div>
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
        <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">
          No top scorers found for the selected criteria. Try adjusting your filters.
        </p>
      </div>

      <!-- Initial State -->
      <div v-else-if="!hasSearched" class="p-6 md:p-8 text-center">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
          <v-icon name="bi-trophy-fill" class="w-6 h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 class="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">Search Top Scorers</h3>
        <p class="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Select a season and score type, then click search to view the top scoring players.
        </p>
      </div>

      <!-- Results Table -->
      <div v-else-if="topScorers.length > 0" key="results-table">
        <!-- Desktop Table -->
        <div class="hidden lg:block table-container overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Player
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Country
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="scorer in topScorers" :key="scorer.uuid" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <!-- Position -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div 
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        scorer.position === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        scorer.position === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                        scorer.position === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      ]"
                    >
                      {{ scorer.position }}
                    </div>
                  </div>
                </td>

                <!-- Player -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <PlayerAvatar 
                      :player="scorer.player"
                      size="md"
                      variant="circle"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ scorer.player.display_name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        Age: {{ scorer.player.age }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Team -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <TeamLogo 
                      :team="scorer.team"
                      size="sm"
                      variant="rounded"
                      class="mr-2"
                    />
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ scorer.team.name }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ scorer.team.short_code }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Country -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      v-if="scorer.player.country.image_path"
                      :src="scorer.player.country.image_path" 
                      :alt="scorer.player.country.name || 'Unknown'"
                      class="w-5 h-5 rounded mr-2"
                    />
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ scorer.player.country.fifa_name }}
                    </span>
                  </div>
                </td>

                <!-- Total -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span class="text-lg font-bold text-green-600 dark:text-green-400">
                    {{ scorer.total }}
                  </span>
                </td>

                <!-- Type -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {{ scorer.type.name }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tablet/Mobile Cards -->
        <div class="lg:hidden space-y-4 p-4">
          <!-- Mobile Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Top Scorers</h3>
          </div>

          <!-- Top Scorer Cards -->
          <div v-for="scorer in topScorers" :key="scorer.uuid"
            class="scorer-card bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
            
            <!-- Scorer Header with Position and Score -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    scorer.position === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    scorer.position === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                    scorer.position === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  ]"
                >
                  {{ scorer.position }}
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Position</p>
                  <p class="text-lg font-bold text-green-600 dark:text-green-400">
                    #{{ scorer.position }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 dark:text-gray-400">Total {{ scorer.type.name }}</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ scorer.total }}
                </p>
              </div>
            </div>

            <!-- Player Info -->
            <div class="flex items-center space-x-3 mb-3">
              <PlayerAvatar 
                :player="scorer.player"
                size="lg"
                variant="circle"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ scorer.player.display_name }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Age: {{ scorer.player.age }}
                </p>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-3 mb-3">
              <!-- Team -->
              <div class="flex items-center space-x-2">
                <TeamLogo 
                  :team="scorer.team"
                  size="xs"
                  variant="rounded"
                />
                <div class="min-w-0">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Team</p>
                  <p class="text-sm text-gray-900 dark:text-white truncate">{{ scorer.team.name }}</p>
                </div>
              </div>

              <!-- Country -->
              <div class="flex items-center space-x-2">
                <img 
                  v-if="scorer.player.country.image_path" 
                  :src="scorer.player.country.image_path"
                  :alt="scorer.player.country.name || ''" 
                  class="w-4 h-4 rounded" 
                />
                <div class="min-w-0">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Country</p>
                  <p class="text-sm text-gray-900 dark:text-white truncate">{{ scorer.player.country.fifa_name }}</p>
                </div>
              </div>
            </div>

            <!-- Type Badge -->
            <div class="flex justify-center pt-3 border-t border-gray-200 dark:border-gray-600">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <v-icon name="bi-trophy-fill" class="w-3 h-3 mr-1" />
                {{ scorer.type.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <PaginationComponent
          v-if="paginationData"
          :current-page="paginationData.current_page"
          :last-page="paginationData.last_page"
          :from="paginationData.from"
          :to="paginationData.to"
          :total="paginationData.total"
          results-label="players"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { SelectComponent, ButtonComponent, PaginationComponent } from '@/components/ui'
import PlayerAvatar from '@/components/football/ui/PlayerAvatar.vue'
import TeamLogo from '@/components/football/ui/TeamLogo.vue'
import { catalogService } from '@/services/catalog/CatalogService'
import { footballPlayerService } from '@/services/football/player/FootballPlayerService'
import { useToast } from '@/composables/useToast'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'
import type { FootballSeasonResponse } from '@/interfaces/football/season/FootballSeasonResponse'
import type { FootballPlayerTopScoreResponse } from '@/interfaces/football/player/FootballPlayerTopScoreResponse'
import type { FootballPlayerTopScorePayload } from '@/interfaces/football/player/FootballPlayerTopScorePayload'

// Props
interface Props {
  fantasyLeagueUuid?: string
}

const props = defineProps<Props>()

// Composables
const toast = useToast()
const route = useRoute()

// Refs
const resultsSection = ref<HTMLElement | null>(null)

// Reactive data
const loadingTypes = ref(false)
const loadingTopScorers = ref(false)
const isLoadingSeasons = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)
const seasonError = ref('')

// Form data
const selectedSeasonUuid = ref<string>('')
const selectedTypeUuid = ref<string>('')
const currentPage = ref(1)
const perPage = ref(10)

// Data
const seasons = ref<FootballSeasonResponse[]>([])
const types = ref<TypeResponse[]>([])
const topScorers = ref<FootballPlayerTopScoreResponse[]>([])
const paginationData = ref<{
  current_page: number
  last_page: number
  from: number
  to: number
  total: number
} | null>(null)

// Per page options
const perPageOptions = ref([
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
])

// Computed
const typeOptions = computed(() => {
  return types.value.map(type => ({
    id: type.uuid,
    name: type.name
  }))
})

// Methods
const loadSeasons = async (fantasyLeagueUuid: string) => {
  isLoadingSeasons.value = true
  try {
    seasons.value = await catalogService.getSeasonByFantasyLeagueUuid(fantasyLeagueUuid)
    
    // Auto-select the first season if available
    if (seasons.value.length > 0) {
      selectedSeasonUuid.value = seasons.value[0].uuid
      // Trigger season change logic
      onSeasonChange()
    }
  } catch (error) {
    console.error('Error loading seasons:', error)
    toast.error('Error', 'Failed to load seasons')
    seasons.value = []
  } finally {
    isLoadingSeasons.value = false
  }
}

const onSeasonChange = () => {
  // Clear season error when a season is selected
  seasonError.value = ''
  
  // Clear previous search results and type selection
  selectedTypeUuid.value = ''
  topScorers.value = []
  hasSearched.value = false
  error.value = null
}

const loadTypes = async () => {
  try {
    loadingTypes.value = true
    error.value = null
    
    const response = await catalogService.getTypeTopScore()
    types.value = response
    
    if (response.length === 0) {
      toast.info('Info', 'No top score types are available at the moment')
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load score types'
    error.value = errorMessage
    toast.error('Error', 'Failed to load score types')
  } finally {
    loadingTypes.value = false
  }
}

const searchTopScorers = async () => {
  // Clear previous season error
  seasonError.value = ''
  
  if (!selectedSeasonUuid.value) {
    seasonError.value = 'Please select a season first'
    return
  }

  if (!selectedTypeUuid.value) {
    toast.warning('Warning', 'Please select a score type first')
    return
  }

  try {
    loadingTopScorers.value = true
    error.value = null
    hasSearched.value = true

    const payload: FootballPlayerTopScorePayload = {
      page: currentPage.value,
      per_page: perPage.value,
      filters: {
        typeUuids: [selectedTypeUuid.value]
      },
      sort_direction: 'asc',
      sort_by: 'total'
    }

    const response = await footballPlayerService.getFootballPlayerTopScore(payload, selectedSeasonUuid.value)
    topScorers.value = response.data
    paginationData.value = response.pagination
    
    // Scroll to results section after search (with slight delay for render)
    if (topScorers.value.length > 0) {
      await nextTick()
      setTimeout(() => {
        scrollToResults()
      }, 300)
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load top scorers'
    error.value = errorMessage
    toast.error('Error', 'Failed to load top scorers')
  } finally {
    loadingTopScorers.value = false
  }
}

const clearFilters = () => {
  // Preserve the selected season
  const currentSeason = selectedSeasonUuid.value
  
  // Clear validation errors
  seasonError.value = ''
  
  selectedSeasonUuid.value = currentSeason // Keep the current season
  selectedTypeUuid.value = ''
  topScorers.value = []
  currentPage.value = 1
  hasSearched.value = false
  error.value = null
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  searchTopScorers()
}

const onPerPageChange = () => {
  // Reset to first page when changing per page
  currentPage.value = 1
  searchTopScorers()
}

const scrollToResults = () => {
  if (resultsSection.value) {
    // Calculate offset for fixed bottom menu (adjust if needed)
    const offset = 80 // Account for any fixed headers/menus
    const elementPosition = resultsSection.value.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const onFantasyLeagueChange = async (fantasyLeagueUuid: string) => {
  try {
    if (fantasyLeagueUuid) {
      selectedSeasonUuid.value = ''
      selectedTypeUuid.value = ''
      seasons.value = []
      topScorers.value = []
      hasSearched.value = false
      await loadSeasons(fantasyLeagueUuid)
    } else {
      seasons.value = []
      topScorers.value = []
    }
  } catch (error) {
    console.error('Error changing fantasy league:', error)
    toast.error('Error', 'Failed to load seasons for the selected league')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await loadTypes()

    // Check if we have a league UUID in query params (from league detail page)
    const leagueUuid = route.query.leagueUuid as string

    // Use the prop or fallback to query param
    const targetLeagueUuid = props.fantasyLeagueUuid || leagueUuid

    if (targetLeagueUuid) {
      await onFantasyLeagueChange(targetLeagueUuid)
    }
  } catch (error) {
    toast.error('Error', 'Failed to initialize top scorers component')
  }
})
</script>

<style scoped>
/* Responsive table improvements */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Loading spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
