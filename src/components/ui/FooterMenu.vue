<template>
  <!-- Footer Navigation - Fixed Bottom Tab Bar -->
  <nav 
    v-if="shouldShowMenu"
    aria-label="Main navigation" 
    class="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
  >
    <div class="flex items-center justify-around px-2 py-2 safe-area-bottom min-h-[60px]">
      <!-- League Overview -->
      <button
        @click="handleTabChange('overview')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
          activeTab === 'overview' 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="League Overview"
      >
        <v-icon name="hi-solid-information-circle" class="w-6 h-6" />
        <span class="text-xs font-medium">Overview</span>
      </button>

      <!-- My Team -->
      <button
        @click="handleTabChange('myteam')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
          activeTab === 'myteam' 
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="My Team"
      >
        <v-icon name="hi-solid-user-group" class="w-6 h-6" />
        <span class="text-xs font-medium">My Team</span>
      </button>

      <!-- Player Statistics -->
      <button
        @click="handleTabChange('statistics')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
          activeTab === 'statistics' 
            ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Player Statistics"
      >
        <v-icon name="hi-solid-chart-bar" class="w-6 h-6" />
        <span class="text-xs font-medium">Statistics</span>
      </button>

      <!-- Management -->
      <button
        @click="handleTabChange('management')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
          activeTab === 'management' 
            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Management"
      >
        <v-icon name="hi-solid-cog" class="w-6 h-6" />
        <span class="text-xs font-medium">Management</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const isAuthenticatedRef = ref(false)

// Get active tab from route query or default based on route
const activeTab = computed(() => {
  // If we're in playersToDraft, set myteam as active
  if (route.name === 'playersToDraft') {
    return 'myteam'
  }
  return (route.query.tab as string) || 'overview'
})

// Only show footer menu in fantasy league related routes when authenticated
const shouldShowMenu = computed(() => {
  if (!isAuthenticatedRef.value) return false
  const fantasyRoutes = ['fantasyLeagueDetail', 'playersToDraft']
  return fantasyRoutes.includes(route.name as string)
})

// Check authentication status on mount
onMounted(async () => {
  isAuthenticatedRef.value = await authStore.isAuthenticated()
})

// Watch for token changes to update authentication status
watch(() => authStore.token, async (newToken) => {
  if (newToken) {
    isAuthenticatedRef.value = await authStore.isAuthenticated()
  } else {
    isAuthenticatedRef.value = false
  }
}, { immediate: true })

// Handle tab change
function handleTabChange(tab: string) {
  // If we're in playersToDraft view, redirect to fantasyLeagueDetail with the selected tab
  if (route.name === 'playersToDraft') {
    router.push({
      name: 'fantasyLeagueDetail',
      params: route.params,
      query: { tab }
    })
  } else {
    // Update the query parameter to change the active tab
    router.replace({
      query: { ...route.query, tab }
    })
  }
}
</script>

<style scoped>
/* Safe area padding for devices with notch (iPhone X+, etc.) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
