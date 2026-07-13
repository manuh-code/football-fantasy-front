<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
    <div class="max-w-lg mx-auto px-4 py-6 sm:py-8 space-y-4">

      <!-- Game Mode Cards — compact iOS-style -->
      <!-- Fantasy Card -->

      <!-- <button
        @click="handleNavigation('fantasy')"
        class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden active:scale-[0.98] transition-transform duration-150 focus:outline-none text-left"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="bi-trophy-fill" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">{{ $t('fantasy.gaming.fantasy.title') }}</h3>
            <p class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{{ $t('fantasy.gaming.fantasy.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              {{ $t('fantasy.gaming.live') }}
            </span>
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </button>  -->

      <!-- Pools Card -->
      <button
        @click="handleNavigation('pools')"
        class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden active:scale-[0.98] transition-transform duration-150 focus:outline-none text-left"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-document-text" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">{{ $t('fantasy.gaming.pools.title') }}</h3>
            <p class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{{ $t('fantasy.gaming.pools.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              {{ $t('fantasy.gaming.live') }}
            </span>
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </button>

      <!-- Survivor Card -->
      <button
        @click="handleNavigation('survivor')"
        class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden active:scale-[0.98] transition-transform duration-150 focus:outline-none text-left"
      >
        <div class="flex items-center gap-4 px-4 py-3.5">
          <div class="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-shield-check" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <!-- "Survivor" is a brand name — intentionally not translated. -->
            <h3 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">Survivor</h3>
            <p class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5">{{ $t('survivor.gaming.subtitle') }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              {{ $t('fantasy.gaming.live') }}
            </span>
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      </button>
    </div>
  </div>
  <HomeMenu />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth/useAuthStore'
import { useToast } from '@/composables/useToast'
import HomeMenu from '@/components/home/HomeMenu.vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const { info } = useToast()

const handleNavigation = async (gameMode: string) => {
  // Check if user is authenticated
  const isAuthenticated = await authStore.isAuthenticated()

  if (!isAuthenticated) {
    info(t('fantasy.gaming.loginRequired'))
    router.push({ name: 'login', query: { redirect: '/gaming' } })
    return
  }

  switch (gameMode) {
    case 'fantasy':
      router.push({ name: 'userFantasyLeague' })
      break
    case 'pools':
      router.push({ name: 'pools' })
      break
    case 'survivor':
      router.push({ name: 'survivor' })
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
