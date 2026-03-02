<template>
  <div class="space-y-4">
    <!-- Filters Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
      <div class="px-4 py-3">
        <div class="flex items-center gap-2">
          <v-icon name="bi-trophy-fill" class="w-[16px] h-[16px] text-amber-500 dark:text-amber-400 shrink-0" />
          <h2 class="text-[13px] font-semibold text-gray-900 dark:text-white">Top Scorers</h2>
        </div>
      </div>

      <div class="px-4 pb-4">
        <form @submit.prevent="() => searchTopScorers()"
          class="space-y-3">
          <!-- Filters Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Season Selection -->
          <div>
            <SearchableSelectComponent
              v-model="selectedSeasonUuid"
              :options="seasons"
              value-key="uuid"
              label-key="name"
              placeholder="Select a season"
              :disabled="isLoadingSeasons"
              :loading="isLoadingSeasons"
              :error="seasonError"
              :clearable="false"
              accent-color="amber"
              @change="onSeasonChange"
            />
            <div v-if="isLoadingSeasons" class="mt-1 text-[11px] text-gray-400">
              <v-icon name="pr-spinner" class="w-3 h-3 inline mr-1" animation="spin" />
              Loading seasons...
            </div>
            <div v-if="seasonError" class="mt-1 text-[11px] text-red-500 dark:text-red-400">
              {{ seasonError }}
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <SearchableSelectComponent
              v-model="selectedTypeUuid"
              :options="typeOptions"
              placeholder="Select score type..."
              :disabled="!selectedSeasonUuid || loadingTypes"
              :loading="loadingTypes"
              :clearable="false"
              accent-color="amber"
            />
          </div>
          </div>

          <!-- Search Buttons -->
          <div class="flex flex-col md:flex-row justify-end gap-2">
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
    <div ref="resultsSection" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
      <div class="px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div class="flex items-center gap-2">
            <v-icon name="bi-trophy-fill" class="w-[16px] h-[16px] text-amber-500 dark:text-amber-400 shrink-0" />
            <div class="min-w-0">
              <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Top Scorers Results</h3>
              <p v-if="topScorers.length" class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                {{ paginationData?.from }}-{{ paginationData?.to }} of {{ paginationData?.total || 0 }} players
              </p>
            </div>
          </div>
          
          <!-- Items per page selector -->
          <div v-if="topScorers.length" class="flex items-center gap-2">
            <label for="per-page-select" class="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Show
            </label>
            <SearchableSelectComponent
              v-model="perPage"
              :options="perPageOptions"
              value-key="value"
              label-key="label"
              :searchable="false"
              :clearable="false"
              accent-color="gray"
              class="w-20"
              @change="onPerPageChange"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loadingTopScorers" class="py-12 text-center">
        <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto mb-2" animation="spin" />
        <p class="text-[12px] text-gray-400 dark:text-gray-500">Loading top scorers...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="px-4 pb-4">
        <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
          <v-icon name="hi-solid-exclamation-circle" class="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <p class="text-[12px] font-medium text-red-800 dark:text-red-200">Error loading data</p>
            <p class="text-[11px] text-red-600 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loadingTopScorers && topScorers.length === 0 && hasSearched" class="py-12 text-center">
        <v-icon name="hi-solid-search" class="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
        <h3 class="text-[13px] font-medium text-gray-900 dark:text-white mb-1">No results found</h3>
        <p class="text-[12px] text-gray-400 dark:text-gray-500">Try adjusting your filters.</p>
      </div>

      <!-- Initial State -->
      <div v-else-if="!hasSearched" class="py-12 text-center">
        <v-icon name="bi-trophy-fill" class="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
        <h3 class="text-[13px] font-medium text-gray-900 dark:text-white mb-1">Search Top Scorers</h3>
        <p class="text-[12px] text-gray-400 dark:text-gray-500">Select a season and score type to view rankings.</p>
      </div>

      <!-- Results Table -->
      <div v-else-if="topScorers.length > 0" key="results-table">
        <!-- Desktop Table -->
        <div class="hidden lg:block table-container overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-700/60">
            <thead>
              <tr class="bg-gray-50/80 dark:bg-gray-750">
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Country
                </th>
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-3 py-2 text-left text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/60">
              <tr v-for="scorer in topScorers" :key="scorer.uuid" class="active:bg-gray-50 dark:active:bg-gray-700/50">
                <!-- Position -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <span 
                    :class="[
                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold tabular-nums',
                      scorer.position === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      scorer.position === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                      scorer.position === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                      'text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    {{ scorer.position }}
                  </span>
                </td>

                <!-- Player -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <PlayerAvatar 
                      :player="scorer.player"
                      size="md"
                      variant="circle"
                    />
                    <div>
                      <div class="text-[13px] font-medium text-gray-900 dark:text-white">
                        {{ scorer.player.display_name }}
                      </div>
                      <div class="text-[11px] text-gray-400 dark:text-gray-500">
                        Age: {{ scorer.player.age }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Team -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <TeamLogo 
                      :team="scorer.team"
                      size="sm"
                      variant="rounded"
                    />
                    <div>
                      <div class="text-[12px] font-medium text-gray-900 dark:text-white">
                        {{ scorer.team.name }}
                      </div>
                      <div class="text-[10px] text-gray-400 dark:text-gray-500">
                        {{ scorer.team.short_code }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Country -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <img 
                      v-if="scorer.player.country.image_path"
                      :src="scorer.player.country.image_path" 
                      :alt="scorer.player.country.name || 'Unknown'"
                      class="w-4 h-4 rounded"
                    />
                    <span class="text-[12px] text-gray-600 dark:text-gray-300">
                      {{ scorer.player.country.fifa_name }}
                    </span>
                  </div>
                </td>

                <!-- Total -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <span class="text-[15px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {{ scorer.total }}
                  </span>
                </td>

                <!-- Type -->
                <td class="px-3 py-2.5 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {{ scorer.type.name }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tablet/Mobile Cards -->
        <div class="lg:hidden space-y-2 p-3">
          <div v-for="scorer in topScorers" :key="scorer.uuid"
            class="bg-white dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/50 p-3 active:scale-[0.98] transition-transform">
            
            <!-- Scorer Header -->
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-2.5">
                <span 
                  :class="[
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold tabular-nums',
                    scorer.position === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    scorer.position === 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    scorer.position === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                    'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  ]"
                >
                  {{ scorer.position }}
                </span>
                <PlayerAvatar 
                  :player="scorer.player"
                  size="md"
                  variant="circle"
                />
                <div class="min-w-0">
                  <h4 class="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                    {{ scorer.player.display_name }}
                  </h4>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">
                    Age: {{ scorer.player.age }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[18px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {{ scorer.total }}
                </p>
                <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ scorer.type.name }}</span>
              </div>
            </div>

            <!-- Details Row -->
            <div class="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-600/50">
              <div class="flex items-center gap-1.5">
                <TeamLogo 
                  :team="scorer.team"
                  size="xs"
                  variant="rounded"
                />
                <span class="text-[11px] text-gray-600 dark:text-gray-300 truncate">{{ scorer.team.name }}</span>
              </div>
              <div class="flex items-center gap-1">
                <img 
                  v-if="scorer.player.country.image_path" 
                  :src="scorer.player.country.image_path"
                  :alt="scorer.player.country.name || ''" 
                  class="w-3.5 h-3.5 rounded" 
                />
                <span class="text-[11px] text-gray-600 dark:text-gray-300">{{ scorer.player.country.fifa_name }}</span>
              </div>
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
import { SearchableSelectComponent, ButtonComponent, PaginationComponent } from '@/components/ui'
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
    console.error('Error initializing top scorers:', error)
  }
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
