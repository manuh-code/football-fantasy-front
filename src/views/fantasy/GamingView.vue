<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-24 md:pb-8">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Gaming Hub
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Choose your game mode and start competing
        </p>
      </div>

      <!-- Gaming Options Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        <!-- Fantasy Card -->
        <button
          @click="handleNavigation('fantasy')"
          class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div class="p-6 sm:p-8">
            <div class="flex flex-col items-center text-center">
              <!-- Icon -->
              <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <v-icon name="bi-trophy-fill" class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <!-- Title -->
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Fantasy
              </h3>
              
              <!-- Description -->
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Build your dream team and compete against other managers
              </p>
              
              <!-- Status Badge -->
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                <v-icon name="hi-solid-check-circle" class="w-4 h-4" />
                Available
              </span>
            </div>
          </div>
          
          <!-- Hover Effect -->
          <div class="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        <!-- Survivor Card -->
        <div class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden opacity-75">
          <div class="p-6 sm:p-8">
            <div class="flex flex-col items-center text-center">
              <!-- Icon -->
              <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <v-icon name="hi-solid-fire" class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <!-- Title -->
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Survivor
              </h3>
              
              <!-- Description -->
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pick one team per week to win. One loss and you're out
              </p>
              
              <!-- Status Badge -->
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                <v-icon name="hi-solid-clock" class="w-4 h-4" />
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <!-- Quiniela Card -->
        <div class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden opacity-75">
          <div class="p-6 sm:p-8">
            <div class="flex flex-col items-center text-center">
              <!-- Icon -->
              <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <v-icon name="hi-solid-document-text" class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              
              <!-- Title -->
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiniela
              </h3>
              
              <!-- Description -->
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Predict match results and compete for the top spot
              </p>
              
              <!-- Status Badge -->
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                <v-icon name="hi-solid-clock" class="w-4 h-4" />
                Coming Soon
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- Info Section -->
      <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <v-icon name="hi-solid-information-circle" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              New Game Modes Coming Soon
            </h4>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              We're working hard to bring you more exciting game modes. Stay tuned for Survivor and Quiniela launching soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { info } = useToast()

const handleNavigation = async (gameMode: string) => {
  // Check if user is authenticated
  const isAuthenticated = await authStore.isAuthenticated()
  
  if (!isAuthenticated) {
    info('Please login to access Fantasy games')
    router.push({ name: 'login', query: { redirect: '/gaming' } })
    return
  }

  switch (gameMode) {
    case 'fantasy':
      router.push({ name: 'userFantasyLeague' })
      break
    case 'survivor':
      info('Survivor mode coming soon!')
      break
    case 'quiniela':
      info('Quiniela mode coming soon!')
      break
    default:
      break
  }
}
</script>

<style scoped>
/* Card hover animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

button:hover {
  animation: float 0.3s ease-in-out;
}

/* Smooth gradient transitions */
.group:hover .bg-gradient-to-br {
  background-size: 120% 120%;
}
</style>
