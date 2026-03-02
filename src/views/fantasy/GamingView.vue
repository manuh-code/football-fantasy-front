<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
    <div class="max-w-lg mx-auto px-4 py-6 sm:py-8 space-y-4">

      <!-- Game Mode Cards — compact iOS-style -->
      <!-- Fantasy Card -->
      <button
        @click="handleNavigation('fantasy')"
        class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden active:scale-[0.98] transition-transform duration-150 focus:outline-none text-left"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="bi-trophy-fill" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">Fantasy</h3>
            <p class="text-[13px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">Build your dream team and compete</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              Live
            </span>
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </button>

      <!-- Survivor Card -->
      <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden opacity-60">
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-fire" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">Survivor</h3>
            <p class="text-[13px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">Pick one team per week to win</p>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 shrink-0">
            Soon
          </span>
        </div>
      </div>

      <!-- Quiniela Card -->
      <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden opacity-60">
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-document-text" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">Quiniela</h3>
            <p class="text-[13px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">Predict match results and compete</p>
          </div>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 shrink-0">
            Soon
          </span>
        </div>
      </div>

      <!-- Info banner — subtle -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3 border border-blue-100 dark:border-blue-800/40">
        <div class="flex items-center gap-2.5">
          <v-icon name="hi-solid-information-circle" class="w-[18px] h-[18px] text-blue-400 shrink-0" />
          <p class="text-[13px] text-blue-600 dark:text-blue-300 leading-snug">
            More game modes coming soon. Stay tuned!
          </p>
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
/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
    transform: none !important;
  }
}
</style>
