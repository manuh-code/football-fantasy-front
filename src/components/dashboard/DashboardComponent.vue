<template>
    <div class="animate-page-enter grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Dashboard Panel -->
        <div class="lg:col-span-2">
            <!-- Stats Overview -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                <!-- Card Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-chart-bar" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Your FantasyMX performance summary</p>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Stat Card 1 -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <v-icon name="hi-solid-users" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teams</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                                </div>
                            </div>
                        </div>

                        <!-- Stat Card 2 -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                                    <v-icon name="bi-trophy-fill" class="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Points</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                                </div>
                            </div>
                        </div>

                        <!-- Stat Card 3 -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <v-icon name="hi-solid-star" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Rank</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">#5</p>
                                </div>
                            </div>
                        </div>

                        <!-- Stat Card 4 -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <v-icon name="hi-solid-fire" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Streak</p>
                                    <p class="text-2xl font-bold text-gray-900 dark:text-white">3 wins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Panel -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Card Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-clock" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Your latest fantasy football updates</p>
                        </div>
                    </div>
                </div>

                <!-- Activity Content -->
                <div class="p-6 space-y-5">
                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-check" class="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Welcome to your FantasyMX Dashboard</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Just now</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-globe-alt" class="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Football leagues loaded successfully</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">2 minutes ago</p>
                        </div>
                    </div>

                    <div class="flex items-start gap-3">
                        <div class="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <v-icon name="hi-solid-cog" class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">Dashboard supports both light and dark themes</p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">5 minutes ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Football Leagues Sidebar -->
        <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <!-- Leagues Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <v-icon name="hi-solid-globe-alt" class="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Football Leagues</h3>
                    </div>
                </div>

                <!-- Leagues Content -->
                <div class="p-6 space-y-4">
                    <!-- Loading State -->
                    <div v-if="isLoadingLeagues" class="text-center py-8">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-3"></div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Loading leagues...</p>
                    </div>
                    
                    <!-- Error State -->
                    <div v-else-if="leaguesError" class="text-center py-8">
                        <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <p class="text-sm text-red-600 dark:text-red-400 mb-3">{{ leaguesError }}</p>
                        <button 
                            @click="loadFootballLeagues" 
                            class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                    
                    <!-- Leagues List -->
                    <div v-else-if="footballLeagues.length > 0" class="space-y-3">
                        <div 
                            v-for="league in footballLeagues" 
                            :key="league.uuid"
                            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-100 dark:border-gray-600"
                        >
                            <div class="flex-shrink-0">
                                <img 
                                    v-if="league.image_path" 
                                    :src="league.image_path"
                                    :alt="league.name"
                                    class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                    @error="(event) => (event.target as HTMLImageElement).style.display = 'none'"
                                />
                                <div 
                                    v-else 
                                    class="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center"
                                >
                                    <v-icon name="hi-solid-globe-alt" class="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {{ league.name }}
                                </p>
                                <p v-if="league.current_season" class="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                    Current: {{ league.current_season.name }}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Empty State -->
                    <div v-else class="text-center py-8">
                        <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <v-icon name="hi-solid-globe-alt" class="w-5 h-5 text-gray-400" />
                        </div>
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">No leagues available</h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400">Check back later for available competitions</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/user/useUserStore';
import { catalogService } from '@/services/catalog/CatalogService';
import { onMounted, ref } from 'vue';
import type { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse';

const userStore = useUserStore();

// Reactive data for leagues
const footballLeagues = ref<FootballLeagueResponse[]>([]);
const isLoadingLeagues = ref(false);
const leaguesError = ref<string | null>(null);

// Methods
const loadFootballLeagues = async () => {
  isLoadingLeagues.value = true;
  leaguesError.value = null;
  
  try {
    footballLeagues.value = await catalogService.getFootballLeagues();
  } catch (error) {
    console.error('Error loading football leagues:', error);
    leaguesError.value = 'Failed to load football leagues';
    footballLeagues.value = [];
  } finally {
    isLoadingLeagues.value = false;
  }
};

onMounted(async () => {
  // Initialize user store or any necessary data fetching
  if(userStore.getUserData === null){
    userStore.setUserDataFromApi();
  }
  
  // Load football leagues
  await loadFootballLeagues();
});
</script>

<style scoped>
/* All styles are now handled by TailwindCSS classes in the template */
/* Animations are provided by global animation utilities in main.scss */
/* This provides better consistency and maintainability */
</style>
