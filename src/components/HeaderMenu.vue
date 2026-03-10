<template>
  <!-- Top Navigation — iOS / Apple Sports style -->
  <nav aria-label="Main navigation" class="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 safe-area-top">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4 h-12 sm:h-14">
      <!-- Left side - Logo/Brand -->
      <button
        @click="handleGoHome"
        class="flex items-center gap-2 -ml-1 px-1.5 py-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-150 focus:outline-none group"
        aria-label="Go to home"
        title="Go to Home"
      >
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[10px] flex items-center justify-center">
          <v-icon name="hi-solid-lightning-bolt" class="w-[18px] h-[18px] text-white" />
        </div>
        <div class="hidden sm:flex flex-col items-start">
          <span class="text-[15px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">Fantasy MX</span>
        </div>
      </button>

      <!-- Center - Spacer -->
      <div class="flex-1"></div>

      <!-- Right side - User Avatar -->
      <div class="flex items-center gap-2.5">
        <!-- Login Button (when not authenticated) -->
        <button
          v-if="!isAuthenticatedRef"
          @click="handleLogin"
          class="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full font-semibold text-[13px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Login"
        >
          Login
        </button>

        <!-- User Avatar (when authenticated) -->
        <button
          v-if="isAuthenticatedRef"
          @click="handleViewProfile"
          class="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 hover:ring-blue-500/50 dark:hover:ring-blue-400/50 transition-all duration-150 focus:outline-none active:scale-95"
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
            class="w-full h-full flex items-center justify-center bg-blue-500 text-white text-[11px] font-bold"
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
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

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
  if (router.currentRoute.value.name === 'home') return
  router.push({ name: 'home' }).catch(() => {})
}

function handleViewProfile() {
  if (router.currentRoute.value.name === 'userSettings') return
  router.push({ name: 'userSettings' })
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
