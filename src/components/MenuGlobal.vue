<template>
  <!-- Menú superior - siempre visible -->
  <nav aria-label="Main navigation" class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 h-14 sm:h-16">
      <!-- Left side - Logo/Brand (clickable to gaming) -->
      <button
        @click="handleGoGaming"
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
        aria-label="Go to games"
        title="Go to Games"
      >
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <v-icon name="hi-solid-lightning-bolt" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div class="hidden sm:flex flex-col items-start">
          <span class="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">Fantasy MX</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 leading-tight">Football</span>
        </div>
      </button>

      <!-- Center - Selected football league (clickable to home) -->
      <div class="flex items-center justify-center flex-1">
        <button
          v-if="selectedLeague"
          @click="handleGoHome"
          :title="`${selectedLeague.name} - Go to home`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to home"
        >
          <img 
            :src="selectedLeague.image_path || '/img/default-avatar.svg'" 
            :alt="selectedLeague.name" 
            class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm" 
          />
          <div class="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[8rem] sm:max-w-[12rem]">
            {{ selectedLeague.name }}
          </div>
        </button>
      </div>

      <!-- Right side - User Avatar -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Login Button (when not authenticated) -->
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm sm:text-base transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Login"
        >
          Login
        </button>

        <!-- User Avatar (when authenticated) -->
        <button
          v-if="isAuthenticatedRef"
          @click="handleViewProfile"
          class="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :title="`Go to ${userName} profile`"
          aria-label="Go to profile"
        >
          <img 
            v-if="avatarUrl" 
            :src="avatarUrl" 
            :alt="userName"
            class="w-full h-full object-cover"
          />
          <div 
            v-else 
            class="w-full h-full flex items-center justify-center bg-blue-600 dark:bg-blue-700 text-white text-xs sm:text-sm font-semibold"
          >
            {{ userInitials }}
          </div>
        </button>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useUserStore } from '@/store/user/useUserStore'
import { computed, ref, onMounted, watch } from 'vue'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const leagueStore = useFootballLeagueStore()

const selectedLeague = computed(() => leagueStore.getLeague)

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

function handleLogin() {
  router.push({name: 'login'})
}

function handleGoHome() {
  router.push({ name: 'home' })
}

function handleGoGaming() {
  router.push({ name: 'gaming' })
}

function handleViewProfile() {
  router.push({ name: 'profile' })
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

// Safe area padding for devices with notch (iPhone X+, etc.)
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

// Transición para el dropdown
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
