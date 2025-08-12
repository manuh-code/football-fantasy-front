<template>
  <div class="animate-page-enter min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Welcome to your FantasyMX Dashboard
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stat Card 1 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
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

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Panel -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <!-- Activity Item -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 dark:text-white">
                      You're currently viewing the <span class="font-semibold text-blue-600 dark:text-blue-400">Dashboard Component</span>
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Just now</p>
                  </div>
                </div>

                <!-- Activity Item -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 dark:text-white">
                      Welcome to your FantasyMX dashboard! This is where you'll manage your fantasy teams.
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                  </div>
                </div>

                <!-- Activity Item -->
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 dark:text-white">
                      Your dashboard is fully responsive and supports both light and dark themes.
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div class="p-6 space-y-3">
              <button class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                <v-icon name="hi-solid-plus" class="w-4 h-4 mr-2" />
                Create Team
              </button>
              <button class="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors duration-200">
                <v-icon name="hi-solid-chart-bar" class="w-4 h-4 mr-2" />
                View Stats
              </button>
              <button class="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors duration-200">
                <v-icon name="io-settings-sharp" class="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>

          <!-- Status Panel -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">System Status</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                    Online
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Database</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                    Connected
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">2 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/user/useUserStore';
import { onMounted } from 'vue';

const userStore = useUserStore();

onMounted(() => {
  // Initialize user store or any necessary data fetching
  if(userStore.getUserData === null){
    userStore.setUserDataFromApi();
  }
  
});
</script>

<style scoped>
/* All styles are now handled by TailwindCSS classes in the template */
/* Animations are provided by global animation utilities in main.scss */
/* This provides better consistency and maintainability */
</style>
