<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16">
      <!-- Left side - App name -->
      <div class="navbar-brand">
        <button 
          @click="handleGoHome"
          class="px-1 sm:px-2 py-1 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to home"
        >
          <span class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">FantasyMX</span>
        </button>
      </div>

      <!-- Right side - Selected league, Theme toggle, Login/User menu -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Selected football league (minimal, clickable on mobile) -->
        <div v-if="selectedLeague" class="flex items-center gap-2 mr-2">
          <div class="relative" ref="leaguePopoverRef">
            <button
              @click="toggleLeaguePopover"
              :title="selectedLeague.name"
              class="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1 py-0.5"
              aria-haspopup="true"
              :aria-expanded="isLeaguePopoverOpen"
            >
              <img :src="selectedLeague.image_path || '/img/default-avatar.svg'" :alt="selectedLeague.name" class="w-8 h-8 rounded-full object-cover shadow-sm" />
              <div class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[6rem] sm:max-w-[8rem]">{{ selectedLeague.name }}</div>
            </button>

            <Transition name="dropdown">
              <div v-if="isLeaguePopoverOpen" class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2">
                <div v-if="leaguesLoading" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                <div v-else-if="leaguesError" class="px-3 py-2 text-sm text-red-500">{{ leaguesError }}</div>
                <div v-else>
                  <template v-if="availableLeagues.length">
                    <button v-for="league in availableLeagues" :key="league.uuid" @click="selectLeague(league)" class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">{{ league.name }}</button>
                  </template>
                  <div v-else class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No leagues available at the moment.</div>
                  <hr class="border-t border-gray-100 dark:border-gray-700 my-1" />
                
                </div>
              </div>
            </Transition>
          </div>
        </div>
        <!-- Theme Toggle Button -->
        <button
          @click="handleThemeToggle"
          @keydown="handleKeydown"
          :title="themeTooltip"
          class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transform hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle theme"
          tabindex="0"
        >
          <v-icon 
            :name="themeIcon" 
            class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:rotate-180 transition-all duration-300"
          />
        </button>

        <!-- Login Button (when not authenticated) -->
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm sm:text-base transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Login"
        >
          Login
        </button>

        <!-- User Avatar Dropdown (when authenticated) -->
        <DropdownMenuComponent
          v-if="isAuthenticatedRef"
          :avatar-url="avatarUrl"
          :user-initials="userInitials"
          :user-name="userName"
          :user-email="userEmail"
          @logout="handleLogout"
          @view-profile="handleViewProfile"
          @change-password="handleChangePassword"
          @favorite-team="handleFavoriteTeam"
          @fantasy-leagues="handleFantasyLeagues"
        />
         
       
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useUserStore } from '@/store/user/useUserStore'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import catalogService from '@/services/catalog/CatalogService'
import type { FootballLeagueResponse } from '@/interfaces/football/league/FootballLeagueResponse'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { useRouter } from 'vue-router'
import { DropdownMenuComponent } from '@/components/ui'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const leagueStore = useFootballLeagueStore()

const selectedLeague = computed(() => leagueStore.getLeague)

// Popover state for quick league actions
const isLeaguePopoverOpen = ref(false)
const leaguePopoverRef = ref<HTMLElement | null>(null)
const leagues = ref<FootballLeagueResponse[]>([])
const leaguesLoading = ref(false)
const leaguesError = ref('')

function toggleLeaguePopover() {
  isLeaguePopoverOpen.value = !isLeaguePopoverOpen.value
  if (isLeaguePopoverOpen.value) {
    fetchLeagues()
  }
}

function closeLeaguePopover() {
  isLeaguePopoverOpen.value = false
}

async function fetchLeagues() {
  leaguesLoading.value = true
  leaguesError.value = ''
  try {
    const data = await catalogService.getFootballLeagues()
    leagues.value = data || []
  } catch (e) {
    leaguesError.value = 'Failed to load leagues.'
    leagues.value = []
  } finally {
    leaguesLoading.value = false
  }
}

function selectLeague(league: FootballLeagueResponse) {
  leagueStore.setLeague(league)
  closeLeaguePopover()
}

const availableLeagues = computed(() => {
  return leagues.value.filter(l => l.uuid !== selectedLeague.value?.uuid)
})

function handleClickOutsideLeague(event: MouseEvent) {
  if (leaguePopoverRef.value && !leaguePopoverRef.value.contains(event.target as Node)) {
    closeLeaguePopover()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutsideLeague)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideLeague)
})

// Computed properties for theme icon
const themeIcon = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'hi-solid-sun' : 'hi-solid-moon'
})

const themeTooltip = computed(() => {
  return themeStore.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
})

// Computed properties for authentication
const isAuthenticatedRef = ref(false)

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

const avatarUrl = computed(() => {
  return userStore.getAvatarUrl
})

const userInitials = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase()
  }
  return 'U'
})

const userName = computed(() => {
  const userData = userStore.getUserData
  if (userData?.firstname && userData?.lastname) {
    return `${userData.firstname} ${userData.lastname}`
  }
  return 'User'
})

const userEmail = computed(() => {
  const userData = userStore.getUserData
  return userData?.email || 'user@example.com'
})

function handleThemeToggle() {
  themeStore.toggleTheme()
}

function handleLogin() {
  router.push({name: 'login'})
}

function handleViewProfile() {
  router.push({name: 'profile'})
}

function handleChangePassword() {
  router.push({name: 'change-password'})
}

function handleFavoriteTeam() {
  router.push({name: 'favorite-football-team'})
}

function handleFantasyLeagues() {
  router.push({name: 'userFantasyLeague'})
}

async function handleLogout() {
  await authStore.logout()
  // Use replace to avoid creating a history entry that might cause navigation loops
  router.replace({ name: 'home' })
}

function handleGoHome() {
  router.replace({ name: 'home' })
}

// Keyboard support
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleThemeToggle()
  }
}
</script>

<style lang="scss" scoped>
// Accessibility: Respect user's motion preferences
@media (prefers-reduced-motion: reduce) {
  // Disable all transforms and transitions for users who prefer reduced motion
  * {
    transition: none !important;
    transform: none !important;
  }
}
</style>
