<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { getUserService } from '@/services/user/UserService'
import { useFantasyRounds } from '@/composables/useFantasyRounds'
import RoundSelector from '@/components/fantasy/rounds/RoundSelector.vue'
import MatchupVersusTable from '@/components/fantasy/matchups/MatchupVersusTable.vue'
import { BottomSheet } from '@/components/ui'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'
import type { FantasyFootballPlayerVersusResponse } from '@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse'

interface Props {
  fantasyLeagueUuid?: string
}

const props = defineProps<Props>()

const { t } = useI18n()

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid)

// Rounds composable
const {
  rounds,
  selectedRoundUuid,
  isLoadingRounds,
  canSelectPrevious,
  canSelectNext,
  selectPreviousRound,
  selectNextRound,
  loadRounds,
} = useFantasyRounds(() => leagueUuid.value)

// ── Matchups ──
const matchups = ref<FantasyLeagueMatchupResponse[]>([])
const isLoadingMatchups = ref(false)
const error = ref<string | null>(null)

// ── Lineups drawer (one matchup at a time; loaded lazily and cached) ──
interface VersusState {
  data: FantasyFootballPlayerVersusResponse | null
  loading: boolean
  error: string | null
}
const EMPTY_STATE: VersusState = { data: null, loading: false, error: null }
// activeMatchupUuid is kept (not cleared) while the drawer closes, so its
// content doesn't flash empty mid slide-out — isDrawerOpen alone drives visibility.
const activeMatchupUuid = ref<string | null>(null)
const isDrawerOpen = ref(false)
const versusCache = ref<Record<string, VersusState>>({})

const activeMatchup = computed(
  () => matchups.value.find((m) => m.uuid === activeMatchupUuid.value) ?? null,
)

function versusState(uuid: string): VersusState {
  return versusCache.value[uuid] ?? EMPTY_STATE
}

function isActive(matchup: FantasyLeagueMatchupResponse): boolean {
  return isDrawerOpen.value && activeMatchupUuid.value === matchup.uuid
}

async function loadMatchups() {
  if (!leagueUuid.value || !selectedRoundUuid.value) return

  isLoadingMatchups.value = true
  error.value = null
  isDrawerOpen.value = false
  versusCache.value = {}

  try {
    const response = await fantasyLeagueService.getMatchupsByFantasyRound(
      leagueUuid.value,
      selectedRoundUuid.value,
    )
    matchups.value = response.data
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : t('fantasy.matchups.loadError')
    console.error('Error loading matchups:', error.value)
  } finally {
    isLoadingMatchups.value = false
  }
}

function openDrawer(matchup: FantasyLeagueMatchupResponse) {
  activeMatchupUuid.value = matchup.uuid
  isDrawerOpen.value = true
  if (!versusCache.value[matchup.uuid]) loadVersus(matchup)
}

function closeDrawer() {
  isDrawerOpen.value = false
}

async function loadVersus(matchup: FantasyLeagueMatchupResponse) {
  if (!leagueUuid.value || !selectedRoundUuid.value) return

  versusCache.value[matchup.uuid] = { data: null, loading: true, error: null }
  try {
    const response = await getUserService().getLineupsVersusByRoundAndMatchup(
      leagueUuid.value,
      selectedRoundUuid.value,
      matchup.uuid,
    )
    versusCache.value[matchup.uuid] = { data: response.data, loading: false, error: null }
  } catch (err: unknown) {
    versusCache.value[matchup.uuid] = {
      data: null,
      loading: false,
      error: err instanceof Error ? err.message : t('fantasy.matchups.lineupsError'),
    }
  }
}

// ── Presentation helpers ──
function statusBadge(status: string) {
  const badges: Record<string, { label: string; class: string; icon: string }> = {
    pending: {
      label: t('fantasy.matchups.statusPending'),
      class: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      icon: 'hi-solid-clock',
    },
    completed: {
      label: t('fantasy.matchups.statusCompleted'),
      class: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      icon: 'hi-solid-check-circle',
    },
    cancelled: {
      label: t('fantasy.matchups.statusCancelled'),
      class: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      icon: 'hi-solid-x-circle',
    },
  }
  return badges[status] ?? badges.pending
}

function hasScores(matchup: FantasyLeagueMatchupResponse): boolean {
  return matchup.home.score != null && matchup.away.score != null
}

function isWinner(matchup: FantasyLeagueMatchupResponse, side: 'home' | 'away'): boolean {
  return (
    matchup.status === 'completed' &&
    !matchup.is_draw &&
    matchup.winner === matchup[side].team.uuid
  )
}

function isLoser(matchup: FantasyLeagueMatchupResponse, side: 'home' | 'away'): boolean {
  return (
    matchup.status === 'completed' &&
    !matchup.is_draw &&
    matchup.winner !== null &&
    matchup.winner !== matchup[side].team.uuid
  )
}

function teamNameClass(matchup: FantasyLeagueMatchupResponse, side: 'home' | 'away'): string {
  if (isWinner(matchup, side)) return 'text-emerald-700 dark:text-emerald-400'
  if (isLoser(matchup, side)) return 'text-gray-400 dark:text-gray-500'
  return 'text-gray-900 dark:text-white'
}

function scoreClass(matchup: FantasyLeagueMatchupResponse, side: 'home' | 'away'): string {
  if (isWinner(matchup, side)) return 'text-emerald-600 dark:text-emerald-400'
  if (isLoser(matchup, side)) return 'text-gray-300 dark:text-gray-600'
  return 'text-gray-900 dark:text-white'
}

// Watch round changes to reload matchups
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) loadMatchups()
})

// Lifecycle
onMounted(async () => {
  await loadRounds()
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- ── Loading rounds skeleton ── -->
    <div v-if="isLoadingRounds && rounds.length === 0" class="space-y-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-col items-center gap-2 flex-1">
            <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
          <div class="h-8 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="flex flex-col items-center gap-2 flex-1">
            <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── No league selected ── -->
    <div
      v-else-if="!leagueUuid"
      class="flex flex-col items-center gap-3 text-center py-12"
    >
      <v-icon name="gi-crossed-swords" class="w-12 h-12 text-gray-200 dark:text-gray-700" />
      <p class="text-sm text-gray-400 dark:text-gray-500">{{ $t('fantasy.matchups.selectLeague') }}</p>
    </div>

    <!-- ── Content ── -->
    <div v-else-if="rounds.length > 0" class="space-y-4">
      <!-- Round selector (shared component) -->
      <RoundSelector
        :rounds="rounds"
        :selected-round-uuid="selectedRoundUuid"
        :is-loading-rounds="isLoadingRounds"
        :is-loading-content="isLoadingMatchups"
        :can-select-previous="canSelectPrevious"
        :can-select-next="canSelectNext"
        @update:selected-round-uuid="selectedRoundUuid = $event"
        @select-previous="selectPreviousRound"
        @select-next="selectNextRound"
      />

      <!-- Loading matchups skeleton -->
      <div v-if="isLoadingMatchups" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
            <div class="h-8 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div class="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-4"
      >
        <div class="flex items-center gap-2.5">
          <v-icon name="hi-solid-exclamation-circle" class="w-5 h-5 text-red-500 shrink-0" />
          <div class="min-w-0">
            <p class="text-footnote text-red-700 dark:text-red-300">{{ error }}</p>
            <button
              class="mt-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              @click="loadMatchups"
            >
              {{ $t('common.actions.retry') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Matchup list — each card is a "match ticket" that opens the lineups drawer -->
      <div v-else-if="matchups.length > 0" class="space-y-3">
        <div
          v-for="matchup in matchups"
          :key="matchup.uuid"
          class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-shadow duration-200"
          :class="isActive(matchup) ? 'shadow-md ring-1 ring-emerald-500/10' : 'shadow-sm'"
        >
          <!-- ── Header (opens the lineups drawer) ── -->
          <button
            type="button"
            class="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-inset"
            aria-haspopup="dialog"
            :aria-expanded="isActive(matchup)"
            @click="openDrawer(matchup)"
          >
            <!-- Status pill -->
            <div class="flex items-center justify-center pt-3 pb-0.5">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide',
                  statusBadge(matchup.status).class,
                ]"
              >
                <v-icon :name="statusBadge(matchup.status).icon" class="w-3 h-3" />
                {{ statusBadge(matchup.status).label }}
              </span>
            </div>

            <!-- Teams + score -->
            <div class="px-4 pt-1 pb-3 flex items-center gap-2">
              <!-- Home -->
              <div class="flex-1 flex flex-col items-center text-center min-w-0 gap-2">
                <div
                  class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 flex items-center justify-center overflow-hidden transition-colors"
                  :class="isWinner(matchup, 'home') ? 'border-emerald-400 dark:border-emerald-500' : 'border-gray-100 dark:border-gray-600'"
                >
                  <img
                    v-if="matchup.home.team.image_path"
                    :src="matchup.home.team.image_path"
                    :alt="matchup.home.team.team_name"
                    class="w-full h-full object-cover"
                  />
                  <v-icon v-else name="hi-solid-user-group" class="w-7 h-7 text-gray-300 dark:text-gray-500" />
                </div>
                <span class="text-xs font-semibold truncate w-full" :class="teamNameClass(matchup, 'home')">
                  {{ matchup.home.team.team_name }}
                </span>
              </div>

              <!-- Score / VS -->
              <div class="flex flex-col items-center px-2 shrink-0">
                <div v-if="hasScores(matchup)" class="flex items-center gap-1.5">
                  <span class="text-2xl font-black tabular-nums" :class="scoreClass(matchup, 'home')">
                    {{ matchup.home.score }}
                  </span>
                  <span class="text-xs font-bold text-gray-300 dark:text-gray-600">-</span>
                  <span class="text-2xl font-black tabular-nums" :class="scoreClass(matchup, 'away')">
                    {{ matchup.away.score }}
                  </span>
                </div>
                <span v-else class="text-lg font-black text-gray-300 dark:text-gray-600">
                  {{ $t('fantasy.matchups.vs') }}
                </span>
                <span
                  v-if="matchup.status === 'completed' && matchup.is_draw"
                  class="mt-0.5 text-2xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {{ $t('fantasy.matchups.draw') }}
                </span>
              </div>

              <!-- Away -->
              <div class="flex-1 flex flex-col items-center text-center min-w-0 gap-2">
                <div
                  class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 flex items-center justify-center overflow-hidden transition-colors"
                  :class="isWinner(matchup, 'away') ? 'border-emerald-400 dark:border-emerald-500' : 'border-gray-100 dark:border-gray-600'"
                >
                  <img
                    v-if="matchup.away.team.image_path"
                    :src="matchup.away.team.image_path"
                    :alt="matchup.away.team.team_name"
                    class="w-full h-full object-cover"
                  />
                  <v-icon v-else name="hi-solid-user-group" class="w-7 h-7 text-gray-300 dark:text-gray-500" />
                </div>
                <span class="text-xs font-semibold truncate w-full" :class="teamNameClass(matchup, 'away')">
                  {{ matchup.away.team.team_name }}
                </span>
              </div>
            </div>

            <!-- Disclosure bar -->
            <div
              class="flex items-center justify-center gap-1.5 px-4 py-2 border-t border-gray-100 dark:border-gray-700/60"
            >
              <span class="text-2xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {{ $t('fantasy.matchups.viewLineups') }}
              </span>
              <v-icon
                name="hi-solid-chevron-right"
                class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center gap-3 text-center py-12">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <v-icon name="gi-crossed-swords" class="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.matchups.noMatchups') }}</h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs">{{ $t('fantasy.matchups.noMatchupsSub') }}</p>
      </div>
    </div>

    <!-- ── No rounds available ── -->
    <div
      v-else-if="!isLoadingRounds && rounds.length === 0"
      class="flex flex-col items-center gap-3 text-center py-12"
    >
      <v-icon name="hi-solid-calendar" class="w-12 h-12 text-gray-200 dark:text-gray-700" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white">{{ $t('fantasy.matchups.noRounds') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs">{{ $t('fantasy.matchups.noRoundsSub') }}</p>
    </div>

    <!-- ── Lineups drawer — opened from any matchup card above ── -->
    <BottomSheet :is-visible="isDrawerOpen" size="lg" @close="closeDrawer">
      <template #header>
        <div v-if="activeMatchup" class="flex items-center gap-3 w-full">
          <!-- Home team -->
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 flex items-center justify-center">
              <img v-if="activeMatchup.home.team.image_path" :src="activeMatchup.home.team.image_path" :alt="activeMatchup.home.team.team_name" class="w-full h-full object-cover" />
              <span v-else class="text-2xs font-bold text-gray-500">{{ activeMatchup.home.team.team_name.substring(0, 2).toUpperCase() }}</span>
            </div>
            <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">{{ activeMatchup.home.team.team_name }}</p>
          </div>
          <!-- Score + close -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-700/60">
              <span class="text-footnote font-extrabold tabular-nums leading-none" :class="isWinner(activeMatchup, 'home') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">{{ activeMatchup.home.score }}</span>
              <span class="text-2xs text-gray-300 dark:text-gray-600">–</span>
              <span class="text-footnote font-extrabold tabular-nums leading-none" :class="isWinner(activeMatchup, 'away') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">{{ activeMatchup.away.score }}</span>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
              :aria-label="$t('common.actions.close')"
              @click="closeDrawer"
            >
              <v-icon name="hi-solid-x" class="w-4 h-4" />
            </button>
          </div>
          <!-- Away team -->
          <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate text-right">{{ activeMatchup.away.team.team_name }}</p>
            <div class="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shrink-0 flex items-center justify-center">
              <img v-if="activeMatchup.away.team.image_path" :src="activeMatchup.away.team.image_path" :alt="activeMatchup.away.team.team_name" class="w-full h-full object-cover" />
              <span v-else class="text-2xs font-bold text-gray-500">{{ activeMatchup.away.team.team_name.substring(0, 2).toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </template>

      <MatchupVersusTable
        v-if="activeMatchup"
        embedded
        :matchup="activeMatchup"
        :versus-data="versusState(activeMatchup.uuid).data"
        :is-loading="versusState(activeMatchup.uuid).loading"
        :error="versusState(activeMatchup.uuid).error"
        :league-uuid="leagueUuid"
        :round-uuid="selectedRoundUuid"
        class="-mx-5"
      />
    </BottomSheet>
  </div>
</template>
