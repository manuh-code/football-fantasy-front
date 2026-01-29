<template>

    <div class="space-y-6">
        <!-- Filters Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <v-icon name="bi-funnel-fill" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Search Filters</h2>
                </div>
            </div>

            <div class="p-6">
                <form @submit.prevent="() => searchPlayers()"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Season Selection -->
                    <div>
                        <SelectComponent
                            v-model="filters.seasons"
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

                    <!-- Teams Selection -->
                    <div>
                        <MultiselectComponent
                            v-model="filters.teamsUuids"
                            :options="teams"
                            value-key="uuid"
                            label-key="name"
                            label="Teams"
                            placeholder="Select teams"
                            :disabled="!filters.seasons || isLoadingTeams"
                            :loading="isLoadingTeams"
                            :no-options-text="!filters.seasons ? 'Select a season first' : 'No teams available'"
                            no-result-text="No teams found."
                        />
                    </div>

                    <!-- Player Name -->
                    <div>
                        <label for="player-name"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Player Name
                        </label>
                        <input id="player-name" v-model="filters.name" type="text" placeholder="Search by player name"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                    </div>

                    <!-- Statistic Types -->
                    <div>
                        <MultiselectComponent
                            v-model="filters.statTypes"
                            :options="statTypes"
                            value-key="uuid"
                            label-key="name"
                            label="Statistic Types"
                            placeholder="Select statistic types"
                            :disabled="isLoadingStatTypes"
                            :loading="isLoadingStatTypes"
                            no-result-text="No statistic types found."
                        />
                    </div>

                    <!-- Search Button -->
                    <div class="lg:col-span-3 flex justify-end gap-3">
                        <ButtonComponent type="button" variant="outline" size="md" text="Clear Filters"
                            @click="clearFilters" />
                        <ButtonComponent type="submit" variant="primary" size="md" text="Search Players"
                            icon="hi-search" :loading="isLoadingPlayers" />
                    </div>
                    
                    <!-- Current Sort Indicator -->
                    <div v-if="sortBy && sortDirection" class="lg:col-span-3">
                        <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                            <v-icon :name="sortDirection === 'asc' ? 'hi-solid-sort-ascending' : 'hi-solid-sort-descending'" class="w-4 h-4" />
                            <span>Sorted by <strong>{{ formatStatColumnName(sortBy) }}</strong> ({{ sortDirection === 'asc' ? 'Ascending' : 'Descending' }})</span>
                            <button @click="sortBy = null; sortDirection = 'desc'; searchPlayers(1)" 
                                    class="ml-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                                    title="Clear sorting">
                                <v-icon name="hi-solid-x" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Results Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Player Statistics</h2>
                            <p v-if="pagination.total" class="text-sm text-gray-600 dark:text-gray-400">
                                Showing {{ pagination.from }}-{{ pagination.to }} of {{ pagination.total }} players
                            </p>
                        </div>
                    </div>
                    
                    <!-- Items per page selector -->
                    <div v-if="players.length" class="flex items-center gap-2">
                        <label for="per-page-select" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Show:
                        </label>
                        <SelectComponent
                            id="per-page-select"
                            v-model="pagination.per_page"
                            :options="perPageOptions"
                            value-key="value"
                            label-key="label"
                            placeholder=""
                            class="w-20"
                            @change="onPerPageChange"
                        />
                        <span class="text-sm text-gray-600 dark:text-gray-400">per page</span>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingPlayers" class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading player statistics...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!players.length && !isInitialLoad" class="p-8 text-center">
                <div
                    class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <v-icon name="hi-solid-chart-bar" class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No players found</h3>
                <p class="text-gray-600 dark:text-gray-400">Try adjusting your search filters to find players.</p>
            </div>

            <!-- Results Table -->
            <div v-else-if="players.length" key="results-table">
                <!-- Desktop Table View -->
                <PlayerStatisticsDesktopTable
                    :key="`desktop-${players.length}-${sortBy}-${sortDirection}`"
                    :players="players"
                    :dynamic-stat-columns="dynamicStatColumns"
                    :sort-by="sortBy"
                    :sort-direction="sortDirection"
                    @sort="handleSort"
                />

                <!-- Tablet Table View -->
                <PlayerStatisticsTabletTable
                    :key="`tablet-${players.length}-${sortBy}-${sortDirection}`"
                    :players="players"
                    :dynamic-stat-columns="dynamicStatColumns"
                    :sort-by="sortBy"
                    :sort-direction="sortDirection"
                    @sort="handleSort"
                />

                <!-- Mobile Cards View -->
                <PlayerStatisticsMobileCards
                    :key="`mobile-${players.length}-${sortBy}-${sortDirection}`"
                    :players="players"
                    :dynamic-stat-columns="dynamicStatColumns"
                    :sort-by="sortBy"
                    :sort-direction="sortDirection"
                    :expanded-players="expandedPlayers"
                    @sort="handleSort"
                    @toggle-player-stats="togglePlayerStats"
                />
            </div>

            <!-- Pagination -->
            <PaginationComponent
                v-if="players.length"
                :key="`pagination-${pagination.current_page}-${pagination.last_page}`"
                :current-page="pagination.current_page"
                :last-page="pagination.last_page"
                :from="pagination.from"
                :to="pagination.to"
                :total="pagination.total"
                results-label="players"
                @page-change="changePage"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineProps } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { ButtonComponent, PaginationComponent, SelectComponent, MultiselectComponent } from '@/components/ui'
import PlayerStatisticsDesktopTable from './PlayerStatisticsDesktopTable.vue'
import PlayerStatisticsTabletTable from './PlayerStatisticsTabletTable.vue'
import PlayerStatisticsMobileCards from './PlayerStatisticsMobileCards.vue'
import { catalogService } from '@/services/catalog/CatalogService'
import { footballPlayerService } from '@/services/football/player/FootballPlayerService'
import type { FootballSeasonResponse } from '@/interfaces/football/season/FootballSeasonResponse'
import type { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'
import type { FootballPlayerStatisticResponse } from '@/interfaces/football/player/FootballPlayerStatisticResponse'
import type { FootballPlayerStatisticPayload } from '@/interfaces/football/player/FootballPlayerStatisticPayload'

// Props
const props = defineProps<{
    fantasyLeagueUuid?: string
}>()

// Composables
const toast = useToast()
const route = useRoute()

// State
const seasons = ref<FootballSeasonResponse[]>([])
const teams = ref<FootballTeamResponse[]>([])
const statTypes = ref<TypeResponse[]>([])
const players = ref<FootballPlayerStatisticResponse[]>([])

// Loading states
const isLoadingSeasons = ref(false)
const isLoadingTeams = ref(false)
const isLoadingStatTypes = ref(false)
const isLoadingPlayers = ref(false)
const isInitialLoad = ref(true)

// Validation states
const seasonError = ref('')

// Filters (removed fantasyLeague since it comes from props)
const filters = ref({
    seasons: '',
    teamsUuids: [] as FootballTeamResponse[],
    name: '',
    statTypes: [] as TypeResponse[]
})

// Pagination
const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
})

// Sorting
const sortBy = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('desc')

// Mobile state for expanded player stats
const expandedPlayers = ref<string[]>([])

// Per page options
const perPageOptions = ref([
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
])

// Computed
const dynamicStatColumns = computed(() => {
    try {
        if (!players.value || players.value.length === 0) return []

        // Take the first player and get all statistic keys from details
        const firstPlayer = players.value[0]
        
        if (!firstPlayer || !firstPlayer.statistics || !firstPlayer.statistics.details) {
            return []
        }
        
        const columns = Object.keys(firstPlayer.statistics.details).filter(key => key !== null && key !== undefined).sort()
        return columns
    } catch (error) {
        console.error('Error computing dynamic stat columns:', error)
        return []
    }
})

// Methods
const loadSeasons = async (fantasyLeagueUuid: string) => {
    isLoadingSeasons.value = true
    try {
        seasons.value = await catalogService.getSeasonByFantasyLeagueUuid(fantasyLeagueUuid)
        
        // Auto-select the first season if available
        if (seasons.value.length > 0) {
            filters.value.seasons = seasons.value[0].uuid
            // Trigger season change to load teams
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

const loadTeams = async (seasonUuid: string) => {
    isLoadingTeams.value = true
    try {
        teams.value = await catalogService.getTeamsBySeasonUuid(seasonUuid)
    } catch (error) {
        console.error('Error loading teams:', error)
        toast.error('Error', 'Failed to load teams')
        teams.value = []
    } finally {
        isLoadingTeams.value = false
    }
}

const loadStatTypes = async () => {
    isLoadingStatTypes.value = true
    try {
        statTypes.value = await catalogService.getTypeStatistic()
    } catch (error) {
        console.error('Error loading statistic types:', error)
        toast.error('Error', 'Failed to load statistic types')
    } finally {
        isLoadingStatTypes.value = false
    }
}

const searchPlayers = async (page = 1) => {
    // Clear previous season error
    seasonError.value = ''
    
    if (!filters.value.seasons) {
        seasonError.value = 'Please select a season first'
        return
    }

    isLoadingPlayers.value = true
    try {
        const payload: FootballPlayerStatisticPayload = {
            page,
            per_page: pagination.value.per_page,
            filters: {
                statisticUuids: filters.value.statTypes.length > 0 ? filters.value.statTypes.map(type => type.uuid) : null,
                teamsUuids: filters.value.teamsUuids.length > 0 ? filters.value.teamsUuids.map(team => team.uuid) : null,
                name: filters.value.name || null
            },
            sort_direction: sortDirection.value,
            sort_by: sortBy.value
        }

        const response = await footballPlayerService.getFootballPlayerStatistics(payload, filters.value.seasons)
        
        // Ensure we have valid data
        if (!response || !response.data) {
            throw new Error('Invalid response from server')
        }
        
        players.value = Array.isArray(response.data) ? response.data : []

        // Update pagination info (assuming the response includes pagination data)
        if (response.pagination) {
            const paginationData = response.pagination
            if ('total' in paginationData && 'last_page' in paginationData && 'from' in paginationData && 'to' in paginationData) {
                pagination.value = {
                    current_page: paginationData.current_page ?? 1,
                    last_page: paginationData.last_page ?? 1,
                    per_page: paginationData.per_page ?? 15,
                    total: paginationData.total ?? 0,
                    from: paginationData.from ?? 0,
                    to: paginationData.to ?? 0
                }
            } else {
                const currentPage = 'current_page' in paginationData && typeof paginationData.current_page === 'number'
                    ? paginationData.current_page
                    : 1
                const perPage = 'per_page' in paginationData && typeof paginationData.per_page === 'number'
                    ? paginationData.per_page
                    : pagination.value.per_page
                const totalItems = players.value.length
                const from = totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0
                const to = totalItems > 0 ? from + totalItems - 1 : 0

                pagination.value = {
                    current_page: currentPage,
                    last_page: currentPage,
                    per_page: perPage,
                    total: totalItems,
                    from,
                    to
                }
            }
        }

        isInitialLoad.value = false
    } catch (error) {
        players.value = []
        // Reset pagination on error
        pagination.value = {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
            from: 0,
            to: 0
        }
    } finally {
        isLoadingPlayers.value = false
    }
}

const onFantasyLeagueChange = async (fantasyLeagueUuid: string) => {
    try {
        if (fantasyLeagueUuid) {
            filters.value.seasons = ''
            filters.value.teamsUuids = []
            seasons.value = []
            teams.value = []
            await loadSeasons(fantasyLeagueUuid)
        } else {
            seasons.value = []
            teams.value = []
        }
    } catch (error) {
        console.error('Error changing fantasy league:', error)
        toast.error('Error', 'Failed to load seasons for the selected league')
    }
}

const onSeasonChange = () => {
    // Clear season error when a season is selected
    seasonError.value = ''
    
    if (filters.value.seasons) {
        filters.value.teamsUuids = []
        teams.value = []
        loadTeams(filters.value.seasons)
    } else {
        teams.value = []
    }
}

const clearFilters = () => {
    // Preserve the selected season
    const currentSeason = filters.value.seasons
    
    // Clear validation errors
    seasonError.value = ''
    
    filters.value = {
        seasons: currentSeason, // Keep the current season
        teamsUuids: [],
        name: '',
        statTypes: []
    }
    
    // Don't clear seasons array if we have a season selected
    // seasons.value = [] // Commented out to preserve seasons
    teams.value = [] // Clear teams since user might want to reselect
    players.value = []
    pagination.value.current_page = 1
    sortBy.value = null
    sortDirection.value = 'desc'
    expandedPlayers.value = []
    isInitialLoad.value = true
    
    // If we have a season, reload teams for that season
    if (currentSeason) {
        loadTeams(currentSeason)
    }
}

const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.value.last_page) {
        pagination.value.current_page = page
        searchPlayers(page)
    }
}

const onPerPageChange = () => {
    // Reset to first page when changing per page
    pagination.value.current_page = 1
    searchPlayers(1)
}

const handleSort = (column: string) => {
    if (sortBy.value === column) {
        // Same column clicked, toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        // New column clicked, set to descending
        sortBy.value = column
        sortDirection.value = 'desc'
    }
    
    // Reset to first page when sorting
    pagination.value.current_page = 1
    searchPlayers(1)
}

const togglePlayerStats = (playerUuid: string) => {
    const index = expandedPlayers.value.indexOf(playerUuid)
    if (index > -1) {
        expandedPlayers.value.splice(index, 1)
    } else {
        expandedPlayers.value.push(playerUuid)
    }
}

const formatStatColumnName = (statKey: string): string => {
    return statKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
}

// Lifecycle
onMounted(async () => {
    try {
        await loadStatTypes()

        // Check if we have a league UUID in query params (from league detail page)
        const leagueUuid = route.query.leagueUuid as string

        // Use the prop or fallback to query param
        const targetLeagueUuid = props.fantasyLeagueUuid || leagueUuid

        if (targetLeagueUuid) {
            await onFantasyLeagueChange(targetLeagueUuid)
        }
    } catch (error) {
        toast.error('Error', 'Failed to initialize player statistics component')
    }
})

// Watch for season changes to automatically load teams
watch(() => filters.value.seasons, onSeasonChange)

// Watch for statistic types changes to reset sorting
watch(() => filters.value.statTypes, () => {
    // Reset sorting when statistic types change
    sortBy.value = null
    sortDirection.value = 'desc'
})
</script>

<style>
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

/* Responsive table improvements */
@media (max-width: 1023px) {
    .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }
}

/* Mobile card hover effects */
@media (max-width: 767px) {
    .player-card {
        transition: all 0.2s ease-in-out;
    }
    
    .player-card:active {
        transform: scale(0.98);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
}
</style>
