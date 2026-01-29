<template>
    <div class="animate-page-enter space-y-6">
        <!-- Header with Stats and Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <!-- Title and Stats -->
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <v-icon name="bi-trophy-fill" class="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Fantasy Leagues</h1>
                                <p class="text-gray-600 dark:text-gray-400">Manage and view your fantasy football leagues</p>
                            </div>
                        </div>
                        
                        <!-- Quick Stats -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                        <v-icon name="hi-solid-user-group" class="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total Leagues</p>
                                        <p class="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{{ fantasyLeagues?.length || 0 }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <v-icon name="hi-solid-star" class="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-purple-800 dark:text-purple-200">Admin</p>
                                        <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ adminLeaguesCount }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <v-icon name="hi-solid-users" class="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Member</p>
                                        <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ memberLeaguesCount }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3 lg:flex-col lg:w-48">
                        <ButtonComponent
                            variant="primary"
                            size="md"
                            text="Create League"
                            icon="hi-solid-plus"
                            :full-width="true"
                            class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                            @click="createLeague"
                        />
                        <ButtonComponent
                            variant="secondary"
                            size="md"
                            text="Join League"
                            icon="hi-solid-user"
                            :full-width="true"
                            @click="joinLeague"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div>
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-16">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400 text-lg">Loading your fantasy leagues...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="text-center py-16">
                <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <v-icon name="hi-solid-exclamation" class="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">Error Loading Leagues</h3>
                <p class="text-red-700 dark:text-red-300 mb-8">{{ errorMessage }}</p>
                <ButtonComponent
                    variant="outline"
                    size="md"
                    text="Try Again"
                    @click="loadFantasyLeagues"
                />
            </div>

            <!-- Fantasy Leagues Cards -->
            <div v-else-if="fantasyLeagues && fantasyLeagues.length > 0">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <FantasyLeagueCard
                        v-for="league in fantasyLeagues"
                        :key="league.uuid"
                        :league="league"
                        :show-join-button="false"
                        :show-view-button="true"
                        :show-manage-button="true"
                        @viewDetails="viewLeague"
                        @manage="manageLeague"
                    />
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16">
                <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <v-icon name="bi-trophy-fill" class="w-12 h-12 text-gray-400" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    No Fantasy Leagues Yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    Start your fantasy football journey by creating your own league or joining an existing one!
                </p>
                
            
            </div>
        </div>

        <!-- Quick Tips (moved to bottom) -->
        <div v-if="fantasyLeagues && fantasyLeagues.length > 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <v-icon name="hi-solid-light-bulb" class="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Tips</h3>
                    <div class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>Create a League:</strong> Set up your own league with custom rules and invite friends to compete.</p>
                        <p><strong>Join a League:</strong> Search for public leagues or join private ones with invitation codes.</p>
                        <p><strong>Manage Teams:</strong> Build your fantasy team, make transfers, and compete for the championship.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/useUserStore'
import { useToast } from '@/composables/useToast'
import { ButtonComponent } from '@/components/ui'
import FantasyLeagueCard from '@/components/fantasy/FantasyLeagueCard.vue'

// Stores and composables
const userStore = useUserStore()
const toast = useToast()
const router = useRouter()

// State
const isLoading = ref(false)
const errorMessage = ref<string>('')

// Computed properties
const fantasyLeagues = computed(() => userStore.getUserFantasyLeagues)

const adminLeaguesCount = computed(() => {
    return fantasyLeagues.value?.filter(league => league.isAdmin).length || 0
})

const memberLeaguesCount = computed(() => {
    return fantasyLeagues.value?.filter(league => !league.isAdmin).length || 0
})

// Methods
const loadFantasyLeagues = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        await userStore.getUserFantasyLeaguesFromApi()
    } catch (error) {
        console.error('Error loading fantasy leagues:', error)
        errorMessage.value = 'Failed to load your fantasy leagues. Please try again later.'
    } finally {
        isLoading.value = false
    }
}

const viewLeague = (league: string | { uuid: string }) => {
    // Navigate to league details page using the league object or UUID
    const leagueUuid = typeof league === 'string' ? league : league.uuid
    router.push({ name: 'fantasyLeagueDetail', params: { uuid: leagueUuid } })
}

const manageLeague = (league: string | { uuid: string }) => {
    // TODO: Navigate to league management page
    const leagueUuid = typeof league === 'string' ? league : league.uuid
    console.log('Managing league:', leagueUuid)
    toast.info('Coming Soon', 'League management page is under development!')
}

const createLeague = () => {
    // Navigate to create league page
    router.push({ name: 'createFantasyLeague' })
}

const joinLeague = () => {
    // Navigate to join league page  
    router.push({ name: 'joinFantasyLeague' })
}

// Lifecycle
onMounted(async () => {
    // Check if fantasy leagues are already loaded
    if (!fantasyLeagues.value) {
        await loadFantasyLeagues()
    }
})
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

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
    .animate-spin,
    .transition-all,
    .transition-transform,
    .transition-colors,
    .transition-shadow {
        transition: none !important;
        transform: none !important;
        animation: none !important;
    }
}
</style>
