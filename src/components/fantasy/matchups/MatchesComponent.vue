<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { getUserService } from '@/services/user/UserService'
import { useFantasyRounds } from '@/composables/useFantasyRounds'
import MatchupCarousel from '@/components/fantasy/matchups/MatchupCarousel.vue'
import MatchupVersusTable from '@/components/fantasy/matchups/MatchupVersusTable.vue'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'
import type { FantasyRoundResponse } from '@/interfaces/fantasy/rounds/FantasyRoundResponse'
import type { FantasyFootballPlayerVersusResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse'

interface Props {
  fantasyLeagueUuid?: string
}

const props = defineProps<Props>()

const leagueUuid = computed(() => props.fantasyLeagueUuid)

// Rounds
const {
  rounds,
  selectedRoundUuid,
  isLoadingRounds,
  selectedRound,
  canSelectPrevious,
  canSelectNext,
  selectPreviousRound,
  selectNextRound,
  extractRoundLabel,
  loadRounds,
} = useFantasyRounds(() => leagueUuid.value)

// Matchups
const matchups = ref<FantasyLeagueMatchupResponse[]>([])
const isLoadingMatchups = ref(false)
const error = ref<string | null>(null)

async function loadMatchups() {
  if (!leagueUuid.value || !selectedRoundUuid.value) return
  isLoadingMatchups.value = true
  error.value = null
  try {
    const response = await fantasyLeagueService.getMatchupsByFantasyRound(
      leagueUuid.value,
      selectedRoundUuid.value,
    )
    matchups.value = response.data
    // Auto-load the first matchup's lineups
    if (matchups.value.length) openVersus(matchups.value[0])
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error loading matchups'
  } finally {
    isLoadingMatchups.value = false
  }
}

// Versus inline table
const selectedMatchup = ref<FantasyLeagueMatchupResponse | null>(null)
const versusData = ref<FantasyFootballPlayerVersusResponse | null>(null)
const isLoadingVersus = ref(false)
const versusError = ref<string | null>(null)

async function openVersus(matchup: FantasyLeagueMatchupResponse) {
  if (!leagueUuid.value || !selectedRoundUuid.value) return
  // Skip reload if same matchup is already selected
  if (selectedMatchup.value?.uuid === matchup.uuid) return
  selectedMatchup.value = matchup
  versusData.value = null
  versusError.value = null
  isLoadingVersus.value = true
  try {
    const response = await getUserService().getLineupsVersusByRoundAndMatchup(
      leagueUuid.value,
      selectedRoundUuid.value,
      matchup.uuid,
    )
    versusData.value = response.data
  } catch (err: unknown) {
    versusError.value = err instanceof Error ? err.message : 'Error loading lineups'
  } finally {
    isLoadingVersus.value = false
  }
}

function formatRoundDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getRoundLabel(round: FantasyRoundResponse): string {
  return extractRoundLabel(round.round.name)
}

// Watch for round change
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) loadMatchups()
})

onMounted(async () => {
  await loadRounds()
})
</script>

<template>
  <div class="w-full pb-4">

    <!-- Loading rounds skeleton -->
    <div v-if="isLoadingRounds" class="px-4 pt-4 space-y-4">
      <!-- Round selector skeleton -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
      <!-- Matchup card skeletons -->
      <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-col items-center gap-2 flex-1">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
          <div class="flex flex-col items-center gap-1">
            <div class="h-6 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-2.5 w-10 rounded bg-gray-50 dark:bg-gray-700/60 animate-pulse" />
          </div>
          <div class="flex flex-col items-center gap-2 flex-1">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- No league -->
    <div
      v-else-if="!leagueUuid"
      class="mx-4 mt-8 flex flex-col items-center gap-3 text-center"
    >
      <v-icon name="gi-crossed-swords" class="w-12 h-12 text-gray-200 dark:text-gray-700" />
      <p class="text-sm text-gray-400 dark:text-gray-500">Select a fantasy league to view matches.</p>
    </div>

    <!-- No rounds -->
    <div
      v-else-if="!isLoadingRounds && rounds.length === 0"
      class="mx-4 mt-8 flex flex-col items-center gap-3 text-center"
    >
      <v-icon name="hi-solid-calendar" class="w-12 h-12 text-gray-200 dark:text-gray-700" />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">No rounds available</p>
      <p class="text-footnote text-gray-400 dark:text-gray-500">Rounds will appear once the season starts.</p>
    </div>

    <!-- Main content -->
    <div v-else class="space-y-3">

      <!-- ── Round Selector ── -->
      <div class="px-4 pt-4">
        <div class="flex items-center gap-2">
          <!-- Prev -->
          <button
            @click="selectPreviousRound"
            :disabled="!canSelectPrevious || isLoadingMatchups"
            class="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
            :class="canSelectPrevious ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90' : 'bg-gray-50 dark:bg-gray-800'"
          >
            <v-icon name="hi-solid-chevron-left" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <!-- Round info pill -->
          <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 px-4 py-2.5 flex items-center justify-between min-h-[44px]">
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="text-callout font-bold text-gray-900 dark:text-white leading-none">
                  {{ selectedRound ? getRoundLabel(selectedRound) : '—' }}
                </span>
                <!-- Status badges -->
                <span
                  v-if="selectedRound && !selectedRound.round.finished && selectedRound.round.is_current"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-2xs font-bold uppercase tracking-wide leading-none"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live
                </span>
                <span
                  v-else-if="selectedRound?.round.finished"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-2xs font-bold uppercase tracking-wide leading-none"
                >
                  Final
                </span>
              </div>
              <span v-if="selectedRound" class="text-2xs text-gray-400 dark:text-gray-500 leading-none">
                {{ formatRoundDate(selectedRound.round.starting_at) }}
                <template v-if="selectedRound.round.ending_at"> – {{ formatRoundDate(selectedRound.round.ending_at) }}</template>
              </span>
            </div>
            <!-- Round count -->
            <span class="text-2xs font-medium text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
              {{ (rounds.findIndex(r => r.uuid === selectedRoundUuid) + 1) }} / {{ rounds.length }}
            </span>
          </div>

          <!-- Next -->
          <button
            @click="selectNextRound"
            :disabled="!canSelectNext || isLoadingMatchups"
            class="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
            :class="canSelectNext ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90' : 'bg-gray-50 dark:bg-gray-800'"
          >
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <!-- ── Loading matchups ── -->
      <div v-if="isLoadingMatchups" class="px-4 space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
            <div class="flex flex-col items-center gap-1">
              <div class="h-7 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div class="h-2.5 w-10 rounded bg-gray-50 dark:bg-gray-700/60 animate-pulse" />
            </div>
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Error ── -->
      <div v-else-if="error" class="mx-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
        <div class="flex items-center gap-2">
          <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-500 shrink-0" />
          <p class="text-footnote text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>

      <!-- ── No matchups ── -->
      <div
        v-else-if="!isLoadingMatchups && matchups.length === 0"
        class="mx-4 flex flex-col items-center gap-3 text-center py-8"
      >
        <v-icon name="gi-crossed-swords" class="w-12 h-12 text-gray-200 dark:text-gray-700" />
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">No matchups yet</p>
        <p class="text-footnote text-gray-400 dark:text-gray-500">Matchups for this round haven't been scheduled.</p>
      </div>

      <!-- ── Matchup cards (carousel) ── -->
      <div v-else>
        <MatchupCarousel :matchups="matchups" @select="openVersus" />
      </div>

      <!-- ── Versus lineup table ── -->
      <div v-if="selectedMatchup" class="px-4">
        <MatchupVersusTable
          :matchup="selectedMatchup"
          :versus-data="versusData"
          :is-loading="isLoadingVersus"
          :error="versusError"
          @close="selectedMatchup = null; versusData = null"
        />
      </div>

    </div>
  </div>
</template>
