<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <PageHeader
      title="Football Player Statistics"
      description="View detailed statistics and performance data for football players"
      :breadcrumbs="breadcrumbs"
    />
    
    <!-- Back to League Button (if coming from a league) -->
    <div v-if="returnPath" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <button
        @click="goBackToLeague"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <v-icon name="hi-solid-arrow-left" class="w-4 h-4" />
        <span class="text-sm font-medium">Back to League Details</span>
      </button>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FootballPlayerStatistic />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
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
