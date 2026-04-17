<template>
  <div class="w-full">
    <!-- Loading Rounds State -->
    <div
      v-if="isLoadingRounds && rounds.length === 0"
      class="flex items-center justify-center min-h-[300px]"
    >
      <div class="flex flex-col items-center gap-2">
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
        <p class="text-[13px] text-gray-400 dark:text-gray-500">
          Loading rounds...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
    >
      <div class="flex items-center gap-2.5">
        <v-icon
          name="hi-solid-exclamation-circle"
          class="w-5 h-5 text-red-500 shrink-0"
        />
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
            Error loading team
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- No League Selected -->
    <div
      v-else-if="!leagueUuid"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
    >
      <div class="flex items-center gap-2.5">
        <v-icon
          name="hi-solid-information-circle"
          class="w-5 h-5 text-amber-500 shrink-0"
        />
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
            No fantasy league selected
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400">
            Please select a fantasy league to view your team.
          </p>
        </div>
      </div>
    </div>

    <!-- Round Selector -->
    <div v-else-if="rounds.length > 0" class="mb-4 space-y-3">
      <!-- Round Navigation -->
      <RoundSelector
        :rounds="rounds"
        :selected-round-uuid="selectedRoundUuid"
        :is-loading-rounds="isLoadingRounds"
        :is-loading-content="isLoading"
        :can-select-previous="canSelectPrevious"
        :can-select-next="canSelectNext"
        @update:selected-round-uuid="selectedRoundUuid = $event"
        @select-previous="selectPreviousRound"
        @select-next="selectNextRound"
      />

      <!-- Matchup by Round -->
      <MatchupByRoundAndUser
        :league-uuid="leagueUuid!"
        :round-uuid="selectedRoundUuid"
        :round-name="selectedRound?.round?.name ?? 'Matchup'"
      />

      <!-- Quick Actions -->
      <div class="flex gap-2">
        <button
          @click="goToSearchPlayers()"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 active:scale-[0.97] transition-all"
        >
          <v-icon name="hi-solid-user-add" class="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span class="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Add Players</span>
        </button>

        <button
          disabled
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed"
        >
          <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span class="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Trades</span>
        </button>
      </div>

      <!-- Fantasy Team Display -->
      <FantasyTeamDisplay
        :players="players"
        :formation="league?.formation ?? null"
        :league-uuid="leagueUuid ?? ''"
        :highlighted-player-uuid="highlightedPlayerUuid"
        :is-loading="isLoading"
        @draft-by-position="handleDraftPlayerByPosition"
        @player-removed="loadPlayers"
      />
    </div>

    <!-- No Rounds Available -->
    <div
      v-else-if="!isLoadingRounds && rounds.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
    >
      <div class="flex items-center gap-2.5">
        <v-icon
          name="hi-solid-information-circle"
          class="w-5 h-5 text-amber-500 shrink-0"
        />
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">
            No rounds available
          </h3>
          <p class="text-[12px] text-gray-500 dark:text-gray-400">
            There are no rounds configured for this fantasy league yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user/useUserStore";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useFantasyRounds } from "@/composables/useFantasyRounds";
import RoundSelector from "@/components/fantasy/rounds/RoundSelector.vue";
import FantasyTeamDisplay from "@/components/fantasy/lineup/FantasyTeamDisplay.vue";
import MatchupByRoundAndUser from "@/components/fantasy/matchups/MatchupByRoundAndUser.vue";

interface Props {
  fantasyLeagueUuid?: string;
}

const props = defineProps<Props>();

// Router and stores
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// Computed
const leagueUuid = computed(() => props.fantasyLeagueUuid);

// Rounds composable
const {
  rounds,
  selectedRoundUuid,
  isLoadingRounds,
  selectedRound,
  canSelectPrevious,
  canSelectNext,
  selectPreviousRound,
  selectNextRound,
  loadRounds,
} = useFantasyRounds(() => leagueUuid.value);

// State
const players = ref<FantasyFootballPlayersResponse[]>([]);
const league = ref<FantasyLeaguesResponse | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const highlightedPlayerUuid = ref<string | null>(null);

// Methods
async function loadLeague() {
  if (!leagueUuid.value) {
    return;
  }

  try {
    league.value = await fantasyLeagueService.showFantasyLeague(
      leagueUuid.value,
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading league";
    console.error("Error loading league:", errorMessage);
  }
}

async function loadPlayers() {
  if (!leagueUuid.value || !selectedRoundUuid.value) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const payload: FantasyFootballLineupPayload = {
      fantasy_round_uuid: selectedRoundUuid.value,
    };
    players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(
      leagueUuid.value,
      payload,
    );

    // Check for highlighted player from route query
    await nextTick();
    checkHighlightPlayer();
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error loading players";
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
}

function handleGoToLeagues() {
  router.push({ name: "userFantasyLeague" });
}

/**
 * Navigate to the dedicated search players page with optional query params.
 */
function navigateToSearch(query?: Record<string, string>) {
  if (!leagueUuid.value) return;
  router.push({
    name: "searchPlayerFantasy",
    params: { uuid: leagueUuid.value },
    query,
  });
}

function goToSearchPlayers() {
  navigateToSearch();
}

function handleDraftPlayerByPosition(position: string) {
  const formation = league.value?.formation;
  if (!formation) {
    navigateToSearch();
    return;
  }

  const positionMap: Record<
    string,
    { positionUuid?: string; slotType: string; filter: string }
  > = {
    GOALKEEPER: {
      positionUuid: formation.goalkeeper?.uuid,
      slotType: "STARTER",
      filter: "GOALKEEPER",
    },
    DEFENDER: {
      positionUuid: formation.defender?.uuid,
      slotType: "STARTER",
      filter: "DEFENDER",
    },
    MIDFIELDER: {
      positionUuid: formation.midfielder?.uuid,
      slotType: "STARTER",
      filter: "MIDFIELDER",
    },
    ATTACKER: {
      positionUuid: formation.attacker?.uuid,
      slotType: "STARTER",
      filter: "ATTACKER",
    },
    FLEX: { slotType: "FLEX", filter: "ALL" },
    BENCH: { slotType: "BENCH", filter: "ALL" },
  };

  const info = positionMap[position];
  if (!info) {
    navigateToSearch();
    return;
  }

  const query: Record<string, string> = {
    position: info.filter,
    slotType: info.slotType,
  };
  if (info.positionUuid) {
    query.positionUuid = info.positionUuid;
  }

  navigateToSearch(query);
}

/**
 * Check if there's a highlightPlayer query param and apply highlight animation.
 * Scrolls to the player row and removes the query param after a delay.
 */
function checkHighlightPlayer() {
  const playerUuid = route.query.highlightPlayer as string | undefined;
  if (!playerUuid) return;

  highlightedPlayerUuid.value = playerUuid;

  // Scroll to the highlighted player row
  nextTick(() => {
    const el = document.querySelector(`[data-player-uuid="${playerUuid}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // Remove highlight after animation completes and clean query param
  setTimeout(() => {
    highlightedPlayerUuid.value = null;
    // Remove highlightPlayer from query without full navigation
    const query = { ...route.query };
    delete query.highlightPlayer;
    router.replace({ query });
  }, 3000);
}

// Watch for round changes
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) {
    loadPlayers();
  }
});

// Lifecycle
onMounted(async () => {
  await loadLeague();
  await loadRounds();
});
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
