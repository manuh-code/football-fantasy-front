<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Search Form -->
        <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Card Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-search" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Search Fantasy Leagues</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Find and join exciting fantasy football
                                leagues</p>
                        </div>
                    </div>
                </div>

                <!-- Search Form -->
                <form @submit.prevent="searchLeagues" class="p-6 space-y-5">
                    <!-- Search Input -->
                    <div>
                        <FormInput v-model="searchQuery" label="Search Fantasy Leagues"
                            placeholder="Search by league name or description..." :error="searchError"
                            :disabled="isLoading || leagueType === 'all'" icon="hi-solid-search" />
                        <p v-if="leagueType === 'all'" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Search is disabled when showing all leagues
                        </p>
                        <p v-else-if="leagueType === 'public' || leagueType === 'private'"
                            class="mt-2 text-sm text-blue-600 dark:text-blue-400">
                            <v-icon name="hi-solid-information-circle" class="w-4 h-4 inline mr-1" />
                            You can search with keywords or leave empty to show all {{ leagueType }} leagues
                        </p>
                    </div>

                    <!-- League Type Filter -->
                    <fieldset>
                        <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            League Type
                        </legend>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <!-- All Leagues Button -->
                            <button type="button" @click="setLeagueType('all')" :class="[
                                'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                leagueType === 'all'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-600'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                            ]" :disabled="isLoading">
                                <v-icon name="fa-database" class="w-4 h-4 mr-2 text-emerald-500" />
                                All Leagues
                            </button>

                            <label class="flex items-center">
                                <input type="radio" v-model="leagueType" value="public"
                                    class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    :disabled="isLoading" />
                                <span
                                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
                                    <v-icon name="hi-solid-globe-alt" class="w-4 h-4 mr-1 text-green-500" />
                                    Public
                                </span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" v-model="leagueType" value="private"
                                    class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    :disabled="isLoading" />
                                <span
                                    class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center">
                                    <v-icon name="hi-solid-lock-closed" class="w-4 h-4 mr-1 text-gray-500" />
                                    Private
                                </span>
                            </label>
                        </div>
                    </fieldset>

                    <!-- Form Actions -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <ButtonComponent type="submit" variant="primary" size="md"
                            :text="leagueType === 'all' ? 'Load All Leagues' : (searchQuery.trim() ? 'Search Leagues' : `Show All ${leagueType === 'public' ? 'Public' : 'Private'} Leagues`)"
                            :loading="isLoading" :disabled="false" :full-width="true" icon="hi-solid-search" />
                        <ButtonComponent type="button" variant="cancel" size="md" text="Clear" :full-width="true"
                            :disabled="isLoading || (!searchQuery && leagues.length === 0 && leagueType === 'all')"
                            @click="clearSearch" />
                    </div>
                </form>
            </div>

            <!-- Search Results -->
            <div v-if="hasSearched" class="mt-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <!-- Results Header -->
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Search Results</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    {{ leagues.length }} league{{ leagues.length !== 1 ? 's' : '' }} found
                                    {{ searchQuery ? `for "${searchQuery}"` : '' }}
                                </p>
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {{ getFilterDescription() }}
                            </div>
                        </div>
                    </div>

                    <!-- League Cards Grid -->
                    <div v-if="leagues.length > 0" class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FantasyLeagueCard v-for="league in leagues" :key="league.uuid" :league="league"
                                :show-join-button="true" @join="onJoinLeague" @viewDetails="onViewDetails" />
                        </div>
                    </div>

                    <!-- No Results -->
                    <div v-else class="p-6 text-center py-12">
                        <div
                            class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <v-icon name="hi-solid-search" class="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No leagues found</h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            Try adjusting your search criteria or browse all available leagues.
                        </p>
                        <ButtonComponent variant="outline" size="md" text="Clear Search" @click="clearSearch" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Search Tips Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Tips Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-information-circle"
                                class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Search Tips</h3>
                    </div>
                </div>

                <!-- Tips Content -->
                <div class="p-6 space-y-4">
                    <div class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">All Leagues</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Browse all available leagues
                                without filtering</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Public Leagues</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Open to everyone, join instantly
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Private Leagues</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Invitation only, request to join
                            </p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div
                            class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Search by Name</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Use keywords to find specific
                                leagues</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Welcome Message -->
            <div v-if="!hasSearched"
                class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="p-6 text-center">
                    <div
                        class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <v-icon name="hi-solid-user" class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Discover Leagues
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        Use the search form to find leagues that match your interests and join the competition!
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="animate-page-enter">
        <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 text-lg">Searching for fantasy leagues...</p>
        </div>
    </div>

    <!-- Error State -->
    <div v-if="errorMessage" class="animate-page-enter">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div class="flex items-center">
                <v-icon name="hi-solid-exclamation" class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <div>
                    <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Search Error</h3>
                    <p class="text-red-700 dark:text-red-300">{{ errorMessage }}</p>
                </div>
            </div>
            <ButtonComponent variant="outline" size="md" text="Try Again" class="mt-4" @click="retrySearch" />
        </div>
    </div>

    <!-- Join League Modal -->
    <JoinLeagueModal :is-visible="showJoinModal" :league="selectedLeague || null" :is-loading="isLoading"
        :password-error="passwordError" @close="closeJoinModal" @join="handleJoinLeague" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ButtonComponent, FormInput } from '@/components/ui'
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

// State
const searchQuery = ref('')
const isLoading = ref(false)
const hasSearched = ref(false)
const searchResults = ref<FantasyLeaguesResponse[]>([])
const showJoinModal = ref(false)
const selectedLeague = ref<FantasyLeaguesResponse | null>(null)
const searchError = ref('')
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
    // Clear any previous errors
    searchError.value = ''
    errorMessage.value = ''
    isLoading.value = true
    hasSearched.value = true

    try {
        const searchPayload: FantasyLeagueSearchPayload = {
            filters: {
                search: searchQuery.value.trim() || null,
                isPrivate: leagueType.value === 'private' ? true :
                    leagueType.value === 'public' ? false : undefined,
                skipJoinedUser: true // Always skip leagues the user has already joined
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
    if (type === 'all') {
        searchQuery.value = ''
        searchError.value = ''
    }
}

const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    leagues.value = []
    hasSearched.value = false
    leagueType.value = 'all'
    searchError.value = ''
    errorMessage.value = ''
}

const retrySearch = () => {
    errorMessage.value = ''
    searchLeagues()
}

const getFilterDescription = () => {
    switch (leagueType.value) {
        case 'public':
            return 'Showing only public leagues'
        case 'private':
            return 'Showing only private leagues'
        case 'all':
            return 'Showing all available leagues'
        default:
            return 'Showing all league types'
    }
}

const onJoinLeague = async (league: FantasyLeaguesResponse) => {
    // Clear any previous password error when opening modal
    validationStore.clearFieldError('password')

    // If league is public, join directly without modal
    if (!league.is_private) {
        await handleJoinLeague({ league })
    } else {
        // If league is private, show modal to request password
        selectedLeague.value = league
        showJoinModal.value = true
    }
}

const closeJoinModal = () => {
    showJoinModal.value = false
    validationStore.clearFieldError('password')
}

const onViewDetails = (league: FantasyLeaguesResponse) => {
    // Navigate to league details page
    router.push({ name: 'fantasyLeagueDetail', params: { uuid: league.uuid } })
}

const handleJoinLeague = async (joinData: { league: FantasyLeaguesResponse; password?: string }) => {
    try {
        isLoading.value = true
        validationStore.clearFieldError('password') // Clear previous password errors
        const { league, password } = joinData

        // Prepare payload for the API
        const payload: FantasyLeagueJoined = {
            password: league.is_private ? (password || null) : null
        }

        // Call the API to join the league
        await fantasyLeagueService.joinFantasyLeague(payload, league.uuid)

        toast.success('Success', `Successfully ${league.is_private ? 'requested to join' : 'joined'} "${league.name}"`)
        closeJoinModal()

        // Navigate to the league details page
        router.push({ name: 'fantasyLeagueDetail', params: { uuid: league.uuid } })

    } catch (error) {

        // The interceptor in useApiFantasy already handles 422 errors and stores them in the validation store
        // For non-422 errors, close the modal and let the interceptor show the toast
        if (error && typeof error === 'object' && 'status' in error && error.status !== 422) {
            closeJoinModal()
        }
        // If it's a 422 error, the modal stays open and shows the validation error from the store
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
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
