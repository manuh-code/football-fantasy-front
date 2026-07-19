import { ref, computed, nextTick } from 'vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyRoundResponse } from '@/interfaces/fantasy/rounds/FantasyRoundResponse'

/**
 * Extract a short label from the round name (e.g. "Regular Season - 10" → "J10")
 */
function extractRoundLabel(name: string): string {
  const match = /(\d+)/.exec(name)
  return match ? `J${match[1]}` : name.substring(0, 6)
}

/**
 * Format a date string to a short, readable format.
 */
function formatRoundDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

/**
 * Numeric round value parsed from the round name (e.g. "Regular Season - 10" → 10).
 * Rounds without a number (knockouts) sort last.
 */
function roundNumber(r: FantasyRoundResponse): number {
  const match = /(\d+)/.exec(r.round?.name ?? '')
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER
}

/** Kickoff time of a round, used as a tie-breaker / fallback for sorting. */
function roundTime(r: FantasyRoundResponse): number {
  const t = r.round?.starting_at ? new Date(r.round.starting_at).getTime() : NaN
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t
}

/**
 * Composable to manage fantasy league rounds selection.
 * Encapsulates loading, navigation, and UI scroll logic for round chips.
 */
export function useFantasyRounds(leagueUuid: () => string | undefined) {
  // State
  const rounds = ref<FantasyRoundResponse[]>([])
  const selectedRoundUuid = ref<string | null>(null)
  const isLoadingRounds = ref(true)
  const roundsScrollContainer = ref<HTMLElement | null>(null)
  const selectedRoundEl = ref<HTMLElement | null>(null)

  // Computed
  const selectedRound = computed(
    () => rounds.value.find((r) => r.uuid === selectedRoundUuid.value) || null
  )

  const selectedRoundIndex = computed(() =>
    rounds.value.findIndex((r) => r.uuid === selectedRoundUuid.value)
  )

  const canSelectPrevious = computed(() => selectedRoundIndex.value > 0)
  const canSelectNext = computed(
    () => selectedRoundIndex.value < rounds.value.length - 1
  )

  // Methods

  function selectPreviousRound() {
    if (canSelectPrevious.value) {
      selectedRoundUuid.value = rounds.value[selectedRoundIndex.value - 1].uuid
      scrollToSelectedRound()
    }
  }

  function selectNextRound() {
    if (canSelectNext.value) {
      selectedRoundUuid.value = rounds.value[selectedRoundIndex.value + 1].uuid
      scrollToSelectedRound()
    }
  }

  function scrollToSelectedRound() {
    nextTick(() => {
      if (selectedRoundEl.value && roundsScrollContainer.value) {
        selectedRoundEl.value.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    })
  }

  async function loadRounds() {
    const uuid = leagueUuid()
    if (!uuid) {
      isLoadingRounds.value = false
      return
    }

    isLoadingRounds.value = true

    try {
      const data = await fantasyLeagueService.getFantasyRoundsByLeagueUuid(uuid)

      // The API doesn't guarantee round order (e.g. "Jornada 1" came back between
      // rounds 10 and 11), which left the current round rendered out of place in
      // the strip. Sort ascending by round number, falling back to the kickoff
      // date for rounds whose name has no number (knockouts).
      rounds.value = [...data].sort((a, b) => roundNumber(a) - roundNumber(b) || roundTime(a) - roundTime(b))

      // Auto-select current round
      const currentRound = rounds.value.find((r) => r.is_current)
      if (currentRound) {
        selectedRoundUuid.value = currentRound.uuid
      } else if (rounds.value.length > 0) {
        selectedRoundUuid.value = rounds.value[0].uuid
      }

      scrollToSelectedRound()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error loading rounds'
      console.error('Error loading rounds:', errorMsg)
    } finally {
      isLoadingRounds.value = false
    }
  }

  return {
    // State
    rounds,
    selectedRoundUuid,
    isLoadingRounds,
    roundsScrollContainer,
    selectedRoundEl,
    // Computed
    selectedRound,
    selectedRoundIndex,
    canSelectPrevious,
    canSelectNext,
    // Methods
    extractRoundLabel,
    formatRoundDate,
    selectPreviousRound,
    selectNextRound,
    scrollToSelectedRound,
    loadRounds,
  }
}
