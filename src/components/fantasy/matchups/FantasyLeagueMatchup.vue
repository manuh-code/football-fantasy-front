<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useFantasyRounds } from '@/composables/useFantasyRounds'
import RoundSelector from '@/components/fantasy/rounds/RoundSelector.vue'
import type { FantasyLeagueMatchupResponse } from '@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse'

interface Props {
  fantasyLeagueUuid?: string
}

const props = defineProps<Props>()

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

// State
const matchups = ref<FantasyLeagueMatchupResponse[]>([])
const isLoadingMatchups = ref(false)
const error = ref<string | null>(null)

// Methods
async function loadMatchups() {
  if (!leagueUuid.value || !selectedRoundUuid.value) return

  isLoadingMatchups.value = true
  error.value = null

  try {
    const response = await fantasyLeagueService.getMatchupsByFantasyRound(
      leagueUuid.value,
      selectedRoundUuid.value
    )
    matchups.value = response.data
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error loading matchups'
    error.value = errorMsg
    console.error('Error loading matchups:', errorMsg)
  } finally {
    isLoadingMatchups.value = false
  }
}

/**
 * Returns the appropriate status badge config
 */
function getStatusBadge(status: string) {
  const badges: Record<string, { label: string; class: string; icon: string }> = {
    pending: {
      label: 'Pending',
      class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      icon: 'hi-solid-clock',
    },
    completed: {
      label: 'Completed',
      class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      icon: 'hi-solid-check-circle',
    },
    cancelled: {
      label: 'Cancelled',
      class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      icon: 'hi-solid-x-circle',
    },
  }
  return badges[status] || badges.pending
}

// Watch round changes to reload matchups
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) {
    loadMatchups()
  }
})

// Lifecycle
onMounted(async () => {
  await loadRounds()
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Loading Rounds State -->
    <div
      v-if="isLoadingRounds && rounds.length === 0"
      class="flex items-center justify-center min-h-[300px]"
    >
      <div class="flex flex-col items-center gap-4">
        <v-icon
          name="pr-spinner"
          class="w-12 h-12 text-blue-600 dark:text-blue-400"
          animation="spin"
        />
        <p class="text-gray-600 dark:text-gray-400 font-medium">
          Loading rounds...
        </p>
      </div>
    </div>

    <!-- No League Selected -->
    <div
      v-else-if="!leagueUuid"
      class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-information-circle"
          class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
        />
        <div>
          <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            No fantasy league selected
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            Please select a fantasy league to view matchups.
          </p>
        </div>
      </div>
    </div>

    <!-- Content with Round Selector -->
    <div v-else-if="rounds.length > 0">
      <!-- Round Selector -->
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

      <!-- Loading Matchups -->
      <div
        v-if="isLoadingMatchups"
        class="flex items-center justify-center py-16"
      >
        <div class="flex flex-col items-center gap-4">
          <v-icon
            name="pr-spinner"
            class="w-10 h-10 text-blue-600 dark:text-blue-400"
            animation="spin"
          />
          <p class="text-gray-600 dark:text-gray-400 font-medium text-sm">
            Loading matchups...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6"
      >
        <div class="flex items-center gap-3">
          <v-icon
            name="hi-solid-exclamation-circle"
            class="w-8 h-8 text-red-600 dark:text-red-400"
          />
          <div>
            <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">
              Error loading matchups
            </h3>
            <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
            <button
              @click="loadMatchups"
              class="mt-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Matchups List -->
      <div v-else-if="matchups.length > 0" class="space-y-3">
        <div
          v-for="matchup in matchups"
          :key="matchup.uuid"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <!-- Status Badge -->
          <div class="flex items-center justify-center px-4 pt-3 pb-1">
            <span
              :class="[
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                getStatusBadge(matchup.status).class,
              ]"
            >
              <v-icon :name="getStatusBadge(matchup.status).icon" class="w-3 h-3" />
              {{ getStatusBadge(matchup.status).label }}
            </span>
          </div>

          <!-- Matchup Card Body -->
          <div class="px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <!-- Home Team -->
              <div class="flex-1 flex flex-col items-center text-center min-w-0">
                <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-2 ring-2 ring-gray-200 dark:ring-gray-600">
                  <img
                    v-if="matchup.home.team.image_path"
                    :src="matchup.home.team.image_path"
                    :alt="matchup.home.team.team_name"
                    class="w-full h-full object-cover"
                  />
                  <v-icon
                    v-else
                    name="hi-solid-user-group"
                    class="w-7 h-7 text-gray-400 dark:text-gray-500"
                  />
                </div>
                <span class="text-xs font-semibold text-gray-900 dark:text-white truncate w-full">
                  {{ matchup.home.team.team_name }}
                </span>
              </div>

              <!-- Score / VS -->
              <div class="flex flex-col items-center px-3">
                <div
                  v-if="matchup.home.score !== null && matchup.away.score !== null"
                  class="flex items-center gap-2"
                >
                  <span
                    class="text-2xl font-black tabular-nums"
                    :class="[
                      matchup.status === 'completed' && matchup.winner === matchup.home.team.uuid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : matchup.status === 'completed' && matchup.is_draw
                          ? 'text-gray-700 dark:text-gray-300'
                          : matchup.status === 'pending'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500'
                    ]"
                  >
                    {{ matchup.home.score }}
                  </span>
                  <span class="text-sm font-bold text-gray-400 dark:text-gray-500">-</span>
                  <span
                    class="text-2xl font-black tabular-nums"
                    :class="[
                      matchup.status === 'completed' && matchup.winner === matchup.away.team.uuid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : matchup.status === 'completed' && matchup.is_draw
                          ? 'text-gray-700 dark:text-gray-300'
                          : matchup.status === 'pending'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500'
                    ]"
                  >
                    {{ matchup.away.score }}
                  </span>
                </div>
                <div v-else class="flex flex-col items-center">
                  <span class="text-lg font-black text-gray-300 dark:text-gray-600">VS</span>
                </div>

                <!-- Draw badge -->
                <span
                  v-if="matchup.status === 'completed' && matchup.is_draw"
                  class="mt-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase"
                >
                  Draw
                </span>
              </div>

              <!-- Away Team -->
              <div class="flex-1 flex flex-col items-center text-center min-w-0">
                <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-2 ring-2 ring-gray-200 dark:ring-gray-600">
                  <img
                    v-if="matchup.away.team.image_path"
                    :src="matchup.away.team.image_path"
                    :alt="matchup.away.team.team_name"
                    class="w-full h-full object-cover"
                  />
                  <v-icon
                    v-else
                    name="hi-solid-user-group"
                    class="w-7 h-7 text-gray-400 dark:text-gray-500"
                  />
                </div>
                <span class="text-xs font-semibold text-gray-900 dark:text-white truncate w-full">
                  {{ matchup.away.team.team_name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Winner highlight bar -->
          <div
            v-if="matchup.status === 'completed' && matchup.winner && !matchup.is_draw"
            class="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"
          ></div>
          <div
            v-else-if="matchup.status === 'completed' && matchup.is_draw"
            class="h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600"
          ></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="py-16 text-center"
      >
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <v-icon name="gi-crossed-swords" class="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
          No matchups yet
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          There are no matchups scheduled for this round yet.
        </p>
      </div>
    </div>

    <!-- No Rounds Available -->
    <div
      v-else-if="!isLoadingRounds && rounds.length === 0"
      class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-6"
    >
      <div class="flex items-center gap-3">
        <v-icon
          name="hi-solid-information-circle"
          class="w-8 h-8 text-yellow-600 dark:text-yellow-400"
        />
        <div>
          <h3 class="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            No rounds available
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            There are no rounds configured for this fantasy league yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
