<template>
  <!-- Footer Navigation — iOS Tab Bar style -->
  <nav 
    v-if="shouldShowMenu"
    aria-label="Main navigation" 
    class="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800"
  >
    <div class="flex items-center justify-around px-1 pt-1.5 pb-1.5" style="padding-bottom: max(0.375rem, env(safe-area-inset-bottom, 0.375rem))">
      <!-- League Overview -->
      <button
        @click="handleTabChange('overview')"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
          activeTab === 'overview' 
            ? 'text-blue-500 dark:text-blue-400' 
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
        ]"
        aria-label="League Overview"
      >
        <v-icon name="hi-solid-information-circle" :class="['w-[22px] h-[22px]', activeTab === 'overview' ? 'scale-110' : '']" />
        <span class="text-[10px] font-medium leading-tight">Overview</span>
      </button>

      <!-- My Leagues -->
      <button
        @click="goToMyLeagues"
        class="flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150 text-gray-400 dark:text-gray-500 active:text-gray-600"
        aria-label="My Leagues"
      >
        <v-icon name="bi-trophy-fill" class="w-[22px] h-[22px]" />
        <span class="text-[10px] font-medium leading-tight">Leagues</span>
      </button>

      <!-- My Team -->
      <button
        v-if="canAccessMemberTabs"
        @click="handleTabChange('myteam')"
        :disabled="leagueDetailStore.isDraftNotStarted"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
          leagueDetailStore.isDraftNotStarted
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
            : activeTab === 'myteam' 
              ? 'text-emerald-500 dark:text-emerald-400' 
              : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
        ]"
        aria-label="Team"
      >
        <v-icon name="hi-solid-user-group" :class="['w-[22px] h-[22px]', activeTab === 'myteam' ? 'scale-110' : '']" />
        <span class="text-[10px] font-medium leading-tight">Team</span>
      </button>

      <!-- Player Statistics -->
      <button
        v-if="canAccessMemberTabs"
        @click="handleTabChange('statistics')"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
          activeTab === 'statistics' 
            ? 'text-orange-500 dark:text-orange-400' 
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
        ]"
        aria-label="Player Statistics"
      >
        <v-icon name="hi-solid-chart-bar" :class="['w-[22px] h-[22px]', activeTab === 'statistics' ? 'scale-110' : '']" />
        <span class="text-[10px] font-medium leading-tight">Stats</span>
      </button>

      <!-- Matchups -->
      <button
        v-if="canAccessMemberTabs"
        @click="handleTabChange('matchups')"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
          activeTab === 'matchups' 
            ? 'text-red-500 dark:text-red-400' 
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
        ]"
        aria-label="Matchups"
      >
        <v-icon name="gi-crossed-swords" :class="['w-[22px] h-[22px]', activeTab === 'matchups' ? 'scale-110' : '']" />
        <span class="text-[10px] font-medium leading-tight">Matchups</span>
      </button>

      <!-- Management -->
      <button
        v-if="canAccessAdminTabs"
        @click="handleTabChange('management')"
        :class="[
          'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-150',
          activeTab === 'management' 
            ? 'text-purple-500 dark:text-purple-400' 
            : 'text-gray-400 dark:text-gray-500 active:text-gray-600'
        ]"
        aria-label="Management"
      >
        <v-icon name="hi-solid-cog" :class="['w-[22px] h-[22px]', activeTab === 'management' ? 'scale-110' : '']" />
        <span class="text-[10px] font-medium leading-tight">Manage</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const leagueDetailStore = useFantasyLeagueDetailStore()
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

// Only show member-only tabs when user is a member or admin of the league
const canAccessMemberTabs = computed(() => leagueDetailStore.isMember || leagueDetailStore.isAdmin)

// Only show admin tabs when user is an admin of the league
const canAccessAdminTabs = computed(() => leagueDetailStore.isAdmin)

// Only show footer menu in fantasy league related routes when authenticated
const shouldShowMenu = computed(() => {
  if (!isAuthenticatedRef.value) return false
  const fantasyRoutes = ['fantasyLeagueDetail']
  return fantasyRoutes.includes(route.name as string)
})

// Watch for token changes to update authentication status (immediate covers mount)
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

function goToMyLeagues() {
  router.push({ name: 'userFantasyLeague' })
}
</script>

<style scoped>
/* Safe area padding for devices with notch (iPhone X+, etc.) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
