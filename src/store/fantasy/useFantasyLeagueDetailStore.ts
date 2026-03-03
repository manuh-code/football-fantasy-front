import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'

/**
 * Store for the currently viewed fantasy league detail.
 * Shared between FantasyLeagueDetail and FooterMenu components.
 */
export const useFantasyLeagueDetailStore = defineStore('fantasyLeagueDetail', () => {
  // State
  const currentLeague = ref<FantasyLeaguesResponse | null>(null)

  // Getters
  const isMember = computed(() => currentLeague.value?.isMember === true)
  const isAdmin = computed(() => currentLeague.value?.isAdmin === true)
  const draftStatus = computed(() =>
    (currentLeague.value?.draft?.status?.value || '').toUpperCase()
  )
  const isDraftNotStarted = computed(() => draftStatus.value === 'NOT_STARTED')

  // Actions
  function setCurrentLeague(league: FantasyLeaguesResponse | null) {
    currentLeague.value = league
  }

  function clearCurrentLeague() {
    currentLeague.value = null
  }

  return {
    currentLeague,
    isMember,
    isAdmin,
    draftStatus,
    isDraftNotStarted,
    setCurrentLeague,
    clearCurrentLeague,
  }
})
