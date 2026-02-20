<template>
    <div class="animate-page-enter space-y-4">
        <!-- Header compacto -->
        <div class="flex items-center gap-3 px-1">
            <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <v-icon name="hi-solid-search" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h1 class="text-lg font-bold text-gray-900 dark:text-white">Search Leagues</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">Find and join fantasy football leagues</p>
            </div>
        </div>

        <!-- Search bar sticky estilo iOS -->
        <div class="sticky top-0 z-30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
            <form @submit.prevent="searchLeagues" class="space-y-3">
                <!-- Search Input nativo -->
                <div class="relative">
                    <v-icon name="hi-solid-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                    <input
                        v-model="searchQuery"
                        type="search"
                        placeholder="Search by name..."
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-200/60 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    />
                    <button
                        v-if="searchQuery"
                        type="button"
                        @click="searchQuery = ''"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <v-icon name="hi-solid-x-circle" class="w-4 h-4" />
                    </button>
                </div>

                <!-- Filtros tipo: chips horizontales -->
                <div class="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                    <button
                        v-for="filter in leagueFilters"
                        :key="filter.value"
                        type="button"
                        @click="setLeagueType(filter.value)"
                        :class="[
                            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                            leagueType === filter.value
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                                : 'bg-gray-200/70 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:scale-95'
                        ]"
                        :disabled="isLoading"
                    >
                        <v-icon :name="filter.icon" class="w-3.5 h-3.5" />
                        {{ filter.label }}
                    </button>

                    <!-- Search button -->
                    <button
                        type="submit"
                        :disabled="isLoading"
                        class="ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <v-icon v-if="!isLoading" name="hi-solid-search" class="w-3.5 h-3.5" />
                        <div v-else class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Search
                    </button>
                </div>
            </form>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultados -->
        <div v-else-if="hasSearched">
            <!-- Results count -->
            <div class="flex items-center justify-between px-1">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {{ leagues.length }} league{{ leagues.length !== 1 ? 's' : '' }} found
                </p>
                <button
                    v-if="leagues.length > 0 || searchQuery"
                    @click="clearSearch"
                    class="text-xs font-medium text-emerald-600 dark:text-emerald-400 active:opacity-70"
                >
                    Clear
                </button>
            </div>

            <!-- League list -->
            <div v-if="leagues.length > 0" class="space-y-3">
                <FantasyLeagueCard
                    v-for="league in leagues"
                    :key="league.uuid"
                    :league="league"
                    :show-join-button="true"
                    :clickable="false"
                    @join="onJoinLeague"
                />
            </div>

            <!-- No results -->
            <div v-else class="py-16 text-center">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <v-icon name="hi-solid-search" class="w-7 h-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p class="text-base font-semibold text-gray-900 dark:text-white mb-1">No leagues found</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Try a different search or browse all available leagues
                </p>
                <button
                    @click="clearSearch"
                    class="mt-4 px-4 py-2 rounded-full text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 active:scale-95 transition-all"
                >
                    Clear filters
                </button>
            </div>
        </div>

        <!-- Estado vacío inicial (antes de buscar) -->
        <div v-else class="py-20 text-center">
            <div class="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl mx-auto mb-5 flex items-center justify-center">
                <v-icon name="bi-trophy-fill" class="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Discover Leagues</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Search by name or browse all available leagues to join the competition
            </p>
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div class="flex items-start gap-3">
                <v-icon name="hi-solid-exclamation" class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p class="text-sm font-medium text-red-800 dark:text-red-200">{{ errorMessage }}</p>
                    <button
                        @click="retrySearch"
                        class="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 active:opacity-70"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>

        <!-- Join League Modal -->
        <JoinLeagueModal
            :is-visible="showJoinModal"
            :league="selectedLeague || null"
            :is-loading="isLoading"
            :password-error="passwordError"
            @close="closeJoinModal"
            @join="handleJoinLeague"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useValidationStore } from '@/store/validation/useValidationStore'
import { catalogService } from '@/services'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import FantasyLeagueCard from '@/components/fantasy/FantasyLeagueCard.vue'
import JoinLeagueModal from '@/components/fantasy/JoinLeagueModal.vue'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import type { FantasyLeagueSearchPayload } from '@/interfaces/fantasy/leagues/FantasyLeagueSearchPayload'
import { FantasyLeagueJoined } from '@/interfaces/fantasy/leagues/FantasyLeagueJoined'

// Composables
const router = useRouter()
const toast = useToast()
const validationStore = useValidationStore()

// Filter options
const leagueFilters = [
    { value: 'all', label: 'All', icon: 'fa-database' },
    { value: 'public', label: 'Public', icon: 'hi-solid-globe-alt' },
    { value: 'private', label: 'Private', icon: 'hi-solid-lock-closed' },
]

// State
const searchQuery = ref('')
const isLoading = ref(false)
const hasSearched = ref(false)
const searchResults = ref<FantasyLeaguesResponse[]>([])
const showJoinModal = ref(false)
const selectedLeague = ref<FantasyLeaguesResponse | null>(null)
const errorMessage = ref('')

// Computed properties
const leagues = ref<FantasyLeaguesResponse[]>([])
const leagueType = ref('all')

// Get password error from validation store
const passwordError = computed(() => {
    const passwordErrors = validationStore.getFieldError('password')
    return passwordErrors.length > 0 ? passwordErrors[0] : ''
})

// Methods
const searchLeagues = async () => {
    errorMessage.value = ''
    isLoading.value = true
    hasSearched.value = true

    try {
        const searchPayload: FantasyLeagueSearchPayload = {
            filters: {
                search: searchQuery.value.trim() || null,
                isPrivate: leagueType.value === 'private' ? true :
                    leagueType.value === 'public' ? false : undefined,
                skipJoinedUser: true
            }
        }

        const response = await catalogService.getFantasyLeaguesAll(searchPayload)
        leagues.value = response || []
        searchResults.value = response || []

        if (leagues.value.length === 0) {
            if (leagueType.value === 'all') {
                toast.info('No Results', 'No leagues available at the moment')
            } else if (searchQuery.value.trim()) {
                toast.info('No Results', `No ${leagueType.value} leagues found for "${searchQuery.value}"`)
            } else {
                toast.info('No Results', `No ${leagueType.value} leagues available at the moment`)
            }
        }
    } catch (error) {
        console.error('Error searching leagues:', error)
        errorMessage.value = 'Failed to search for leagues. Please try again.'
        leagues.value = []
        searchResults.value = []
    } finally {
        isLoading.value = false
    }
}

const setLeagueType = (type: string) => {
    leagueType.value = type
}

const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    leagues.value = []
    hasSearched.value = false
    leagueType.value = 'all'
    errorMessage.value = ''
}

const retrySearch = () => {
    errorMessage.value = ''
    searchLeagues()
}

const onJoinLeague = async (league: FantasyLeaguesResponse) => {
    validationStore.clearFieldError('password')

    if (!league.is_private) {
        await handleJoinLeague({ league })
    } else {
        selectedLeague.value = league
        showJoinModal.value = true
    }
}

const closeJoinModal = () => {
    showJoinModal.value = false
    validationStore.clearFieldError('password')
}

const handleJoinLeague = async (joinData: { league: FantasyLeaguesResponse; password?: string }) => {
    try {
        isLoading.value = true
        validationStore.clearFieldError('password')
        const { league, password } = joinData

        const payload: FantasyLeagueJoined = {
            password: league.is_private ? (password || null) : null
        }

        await fantasyLeagueService.joinFantasyLeague(payload, league.uuid)

        toast.success('Success', `Successfully ${league.is_private ? 'requested to join' : 'joined'} "${league.name}"`)
        closeJoinModal()

        router.push({ name: 'fantasyLeagueDetail', params: { uuid: league.uuid } })

    } catch (error) {
        if (error && typeof error === 'object' && 'status' in error && error.status !== 422) {
            closeJoinModal()
        }
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
/* Hide scrollbar for chips container */
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
