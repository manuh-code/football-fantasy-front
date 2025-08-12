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
                    <div v-for="league in fantasyLeagues" :key="league.uuid" 
                        class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 overflow-hidden">
                        
                        <!-- League Header -->
                        <div class="relative h-24 overflow-hidden">
                            <!-- Background Image or Fallback Gradient -->
                            <div v-if="league.image_path" 
                                class="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                :style="{ backgroundImage: `url(${league.image_path})` }">
                            </div>
                            <div v-else 
                                class="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
                            </div>
                            
                            <!-- Dark overlay for better text readability -->
                            <div class="absolute inset-0 bg-black/40"></div>
                            
                            <!-- Badge -->
                            <div class="absolute top-3 right-3 z-10">
                                <span v-if="league.isAdmin" 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                    <v-icon name="hi-solid-star" class="w-3 h-3 mr-1" />
                                    Admin
                                </span>
                                <span v-else 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                    <v-icon name="hi-solid-user" class="w-3 h-3 mr-1" />
                                    Member
                                </span>
                            </div>
                            
                            <!-- League Name Overlay (optional) -->
                            <div class="absolute bottom-3 left-3 z-10">
                                <h4 class="text-white font-semibold text-sm drop-shadow-lg">
                                    {{ league.name }}
                                </h4>
                            </div>
                            
                            <!-- Bottom accent line -->
                            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                        </div>
                        
                        <!-- League Content -->
                        <div class="p-6">
                            <div class="mb-4">
                                <!-- Show description if available, otherwise show league name -->
                                <div v-if="league.description">
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {{ league.name }}
                                    </h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {{ league.description }}
                                    </p>
                                </div>
                                <div v-else>
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {{ league.name }}
                                    </h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                                        No description available
                                    </p>
                                </div>
                            </div>
                            
                            <!-- League Stats -->
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Members</p>
                                    <p class="text-lg font-bold text-gray-900 dark:text-white">{{ league.members_count || 'N/A' }}</p>
                                </div>
                                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                                    <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">Active</p>
                                </div>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex gap-2">
                                <ButtonComponent
                                    variant="outline"
                                    size="sm"
                                    text="View Details"
                                    icon="hi-solid-eye"
                                    :full-width="true"
                                    @click="viewLeague(league.uuid)"
                                />
                                <ButtonComponent
                                    v-if="league.isAdmin"
                                    variant="primary"
                                    size="sm"
                                    text="Manage"
                                    icon="hi-solid-cog"
                                    @click="manageLeague(league.uuid)"
                                />
                            </div>
                        </div>
                    </div>
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
                
                <!-- Action Buttons for Empty State -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
                    <ButtonComponent
                        variant="primary"
                        size="lg"
                        text="Create League"
                        icon="hi-solid-plus"
                        :full-width="true"
                        class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        @click="createLeague"
                    />
                    <ButtonComponent
                        variant="secondary"
                        size="lg"
                        text="Join League"
                        icon="hi-solid-user"
                        :full-width="true"
                        @click="joinLeague"
                    />
                </div>
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

const viewLeague = (leagueUuid: string) => {
    // TODO: Navigate to league details page
    console.log('Viewing league:', leagueUuid)
    toast.info('Coming Soon', 'League details page is under development!')
}

const manageLeague = (leagueUuid: string) => {
    // TODO: Navigate to league management page
    console.log('Managing league:', leagueUuid)
    toast.info('Coming Soon', 'League management page is under development!')
}

const createLeague = () => {
    // Navigate to create league page
    router.push({ path: '/fantasy-league/create' })
}

const joinLeague = () => {
    // Navigate to join league page  
    router.push({ path: '/fantasy-league/join' })
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

/* Text truncation */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Hover effects */
.group:hover .group-hover\:text-emerald-600 {
    color: rgb(5 150 105);
}

.dark .group:hover .dark\:group-hover\:text-emerald-400 {
    color: rgb(52 211 153);
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
