<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Back Navigation -->
      <div class="mb-4">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <v-icon name="hi-solid-arrow-left" class="w-4 h-4" />
          Back to My Team
        </button>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <v-icon name="hi-solid-user-add" class="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Search &amp; Add Players
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find and add players to your fantasy team
        </p>
      </div>

      <!-- Search Player Component -->
      <SearchPlayerFantasy
        :fantasy-league-uuid="fantasyLeagueUuid"
        @player-added="handlePlayerAdded"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchPlayerFantasy from '@/components/user/fantasy/SearchPlayerFantasy.vue'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'

const route = useRoute()
const router = useRouter()

const fantasyLeagueUuid = computed(() => route.params.uuid as string)

/**
 * Navigate back to the league detail view (myteam tab).
 */
function goBack() {
  router.push({
    name: 'fantasyLeagueDetail',
    params: { uuid: fantasyLeagueUuid.value },
    query: { tab: 'myteam' },
  })
}

/**
 * After a player is added, redirect back to team view with highlight.
 */
function handlePlayerAdded(player: FantasyPlayerDraftResponse) {
  const playerUuid = player.player?.uuid
  router.push({
    name: 'fantasyLeagueDetail',
    params: { uuid: fantasyLeagueUuid.value },
    query: {
      tab: 'myteam',
      ...(playerUuid ? { highlightPlayer: playerUuid } : {}),
    },
  })
}
</script>
