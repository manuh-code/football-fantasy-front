<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
    <!-- Back to League Button -->
    <div v-if="returnPath" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 mb-2">
      <button
        @click="goBackToLeague"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 rounded-lg active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
      >
        <v-icon name="hi-solid-arrow-left" class="w-3.5 h-3.5" />
        Back to League
      </button>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <FootballPlayerStatistic />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FootballPlayerStatistic from '@/components/football/player/FootballPlayerStatistic.vue'

const route = useRoute()
const router = useRouter()

// Check if we have a return path (coming from league detail)
const returnPath = computed(() => route.query.returnTo as string)

// Dynamic breadcrumbs based on context
const breadcrumbs = computed(() => {
  if (returnPath.value) {
    return [
      { name: 'Dashboard', to: { name: 'dashboard' } },
      { name: 'My Leagues', to: { name: 'userFantasyLeague' } },
      { name: 'League Details', to: returnPath.value },
      { name: 'Player Statistics' }
    ]
  }
  return [
    { name: 'Dashboard', to: { name: 'dashboard' } },
    { name: 'Player Statistics' }
  ]
})

const goBackToLeague = () => {
  if (returnPath.value) {
    router.push(returnPath.value)
  }
}
</script>
