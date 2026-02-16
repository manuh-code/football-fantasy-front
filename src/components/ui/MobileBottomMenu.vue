<template>
  <!-- Menú inferior - solo móviles en rutas específicas -->
  <nav 
    aria-label="Mobile navigation" 
    class="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-200"
  >
    <div class="flex items-center justify-around px-2 py-2 safe-area-bottom">
      <!-- Home -->
      <button
        @click="handleGoHome"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          isRouteActive('home') 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Go to home"
      >
        <v-icon name="hi-solid-home" class="w-6 h-6" />
        <span class="text-xs font-medium">Home</span>
      </button>

      <!-- Gaming -->
      <button
        @click="handleGoGaming"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          isRouteActive('gaming') 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Go to games"
      >
        <v-icon name="hi-solid-sparkles" class="w-6 h-6" />
        <span class="text-xs font-medium">Games</span>
      </button>

      <!-- Profile -->
      <button
        v-if="isAuthenticatedRef"
        @click="handleViewProfile"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          isRouteActive('profile') 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Go to profile"
      >
        <v-icon name="hi-solid-user" class="w-6 h-6" />
        <span class="text-xs font-medium">Profile</span>
      </button>

      <!-- Login (when not authenticated) -->
      <button
        v-else
        @click="handleLogin"
        class="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        aria-label="Sign in"
      >
        <v-icon name="hi-solid-login" class="w-6 h-6" />
        <span class="text-xs font-medium">Login</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { ref, onMounted, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

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

// Navigation handlers
function handleGoHome() {
  router.replace({ name: 'home' })
}

function handleGoGaming() {
  router.push({ name: 'gaming' })
}

function handleViewProfile() {
  router.push({ name: 'profile' })
}

function handleLogin() {
  router.push({ name: 'login' })
}

// Check if route is active
function isRouteActive(routeName: string): boolean {
  return route.name === routeName
}
</script>

<style scoped>
/* Safe area padding for devices with notch (iPhone X+, etc.) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
