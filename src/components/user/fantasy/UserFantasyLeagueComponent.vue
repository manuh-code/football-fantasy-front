<template>
    <div class="animate-page-enter w-full max-w-6xl mx-auto">
        <!-- Header with Action Buttons -->
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Fantasy Leagues</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your fantasy football leagues</p>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
                <ButtonComponent
                    variant="secondary"
                    size="md"
                    @click="joinLeague"
                    class="flex items-center justify-center"
                >
                    <v-icon name="hi-solid-user" class="w-4 h-4 mr-2" />
                    Join League
                </ButtonComponent>
                
                <ButtonComponent
                    variant="primary"
                    size="md"
                    @click="createLeague"
                    class="flex items-center justify-center"
                >
                    <v-icon name="hi-solid-plus" class="w-4 h-4 mr-2" />
                    Create League
                </ButtonComponent>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400 text-lg">Loading your fantasy leagues...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" 
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <div class="flex items-center">
                <v-icon name="hi-solid-exclamation-triangle"
                    class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                <div>
                    <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Leagues</h3>
                    <p class="text-red-700 dark:text-red-300">{{ errorMessage }}</p>
                </div>
            </div>
            <button @click="loadFantasyLeagues" 
                class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                Try Again
            </button>
        </div>

        <!-- Fantasy Leagues Content -->
        <div v-else-if="fantasyLeagues && fantasyLeagues.length > 0">
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="bi-trophy-fill" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leagues</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ fantasyLeagues.length }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Leagues</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ adminLeaguesCount }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-user-group" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Member Leagues</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ memberLeaguesCount }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Leagues Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="league in fantasyLeagues" :key="league.uuid" 
                    class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transform hover:-translate-y-1 transition-all duration-300">
                    
                    <!-- League Header with Image/Gradient -->
                    <div class="relative h-40 overflow-hidden">
                        <div v-if="league.image_path" class="relative h-full">
                            <img :src="league.image_path" 
                                :alt="league.name"
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                @error="onImageError" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        </div>
                        <div v-else class="h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 relative">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <v-icon name="bi-trophy-fill" class="w-12 h-12 text-white/80" />
                            </div>
                        </div>
                        
                        <!-- Status Badges -->
                        <div class="absolute top-3 right-3 flex flex-col gap-2">
                            <span v-if="league.isAdmin" 
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                                <v-icon name="hi-solid-star" class="w-3 h-3 mr-1" />
                                Admin
                            </span>
                            <span v-else 
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                                <v-icon name="hi-solid-user" class="w-3 h-3 mr-1" />
                                Member
                            </span>
                        </div>
                        
                        <!-- Privacy Badge -->
                        <div class="absolute top-3 left-3">
                            <span v-if="league.is_private" 
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900/70 text-white border border-white/20 backdrop-blur-sm">
                                <v-icon name="hi-solid-lock-closed" class="w-3 h-3 mr-1" />
                                Private
                            </span>
                            <span v-else 
                                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-600/80 text-white border border-white/20 backdrop-blur-sm">
                                <v-icon name="hi-solid-globe-alt" class="w-3 h-3 mr-1" />
                                Public
                            </span>
                        </div>
                        
                        <!-- League Name Overlay -->
                        <div class="absolute bottom-4 left-4 right-4">
                            <h3 class="text-xl font-bold text-white drop-shadow-lg mb-1 line-clamp-1">{{ league.name }}</h3>
                            <div class="flex items-center text-white/90 text-sm">
                                <v-icon name="hi-solid-calendar" class="w-4 h-4 mr-1" />
                                <span>{{ formatDate(league.started_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- League Content -->
                    <div class="p-6">
                        <!-- Description -->
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {{ league.description || 'No description provided for this league.' }}
                        </p>

                        <!-- Stats Grid -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-3 text-center border border-emerald-200 dark:border-emerald-700/50">
                                <div class="flex items-center justify-center mb-1">
                                    <v-icon name="hi-solid-users" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1" />
                                </div>
                                <p class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{{ league.participants_count }}</p>
                                <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Participants</p>
                            </div>
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-700/50">
                                <div class="flex items-center justify-center mb-1">
                                    <v-icon name="hi-solid-user-group" class="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1" />
                                </div>
                                <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ league.members_count }}</p>
                                <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">Members</p>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <ButtonComponent
                            variant="primary"
                            size="sm"
                            :full-width="true"
                            @click="viewLeague(league.uuid)"
                            class="group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-colors duration-300"
                        >
                            <v-icon name="hi-solid-eye" class="w-4 h-4 mr-2" />
                            View League Details
                        </ButtonComponent>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else
            class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl rounded-2xl p-8 md:p-12 text-center border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-5">
                <div class="absolute top-4 right-4 w-32 h-32 bg-emerald-600 rounded-full"></div>
                <div class="absolute bottom-4 left-4 w-24 h-24 bg-blue-600 rounded-full"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-600 rounded-full"></div>
            </div>
            
            <!-- Content -->
            <div class="relative z-10">
                <div class="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <v-icon name="bi-trophy-fill" class="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Ready to Start Your Fantasy Journey?
                </h2>
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    You haven't joined any fantasy leagues yet. Create your own league or join existing ones to compete with friends and other players!
                </p>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <ButtonComponent
                        variant="primary"
                        @click="createLeague"
                        class="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <v-icon name="hi-solid-plus" class="w-5 h-5 mr-2" />
                        Create New League
                    </ButtonComponent>
                    <ButtonComponent
                        variant="secondary"
                        @click="joinLeague"
                        class="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <v-icon name="hi-solid-user" class="w-5 h-5 mr-2" />
                        Join Existing League
                    </ButtonComponent>
                </div>
                
                <!-- Features Preview -->
                <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div class="p-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <v-icon name="hi-solid-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Compete with Friends</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Invite your friends and compete in private leagues</p>
                    </div>
                    
                    <div class="p-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Performance</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Monitor your team's performance and rankings</p>
                    </div>
                    
                    <div class="p-4">
                        <div class="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <v-icon name="hi-solid-star" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Win Prizes</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Compete for exciting prizes and bragging rights</p>
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

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const onImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
}

const viewLeague = (leagueUuid: string) => {
    // TODO: Navigate to league details page
    console.log('Viewing league:', leagueUuid)
    toast.info('Coming Soon', 'League details page is under development!')
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
/* Line clamp utility for description */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

/* Custom hover effects for league cards */
.group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
}

/* Enhanced shadow effects */
.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Backdrop blur effect for badges */
.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

/* Smooth gradient animations */
@keyframes gradient-shift {
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.animate-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
}

/* Enhanced focus states */
.focus\:ring-emerald-500:focus {
    --tw-ring-color: rgb(16 185 129);
}

/* Improved button hover states */
.hover\:shadow-emerald-500\/25:hover {
    box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25);
}

/* Dark mode specific enhancements */
@media (prefers-color-scheme: dark) {
    .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
    }
    
    .shadow-xl {
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
    .group:hover .group-hover\:scale-110,
    .transform,
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