<template>
  <div class="w-full">
    <!-- Loading State -->
    <div
      v-if="isLoading && players.length === 0"
      class="flex items-center justify-center min-h-[400px]"
    >
      <div class="flex flex-col items-center gap-4">
        <v-icon
          name="pr-spinner"
          class="w-12 h-12 text-blue-600 dark:text-blue-400"
          animation="spin"
        />
        <p class="text-gray-600 dark:text-gray-400 font-medium">
          Loading your team...
        </p>
      </div>
    </div>

    <!-- Loading Rounds State -->
    <div
      v-else-if="isLoadingRounds && rounds.length === 0"
      class="flex items-center justify-center min-h-[400px]"
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
            Error loading team
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
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
          <h3
            class="text-lg font-semibold text-yellow-900 dark:text-yellow-100"
          >
            No fantasy league selected
          </h3>
          <p class="text-sm text-yellow-700 dark:text-yellow-300">
            Please select a fantasy league to view your team.
          </p>
        </div>
      </div>
    </div>

    <!-- Round Selector -->
    <div v-else-if="rounds.length > 0" class="mb-6">
      <!-- Team Info Card -->
      <ShowFantasyTeam v-if="leagueUuid" :league-uuid="leagueUuid" class="mb-4" />

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

      <!-- Fantasy Team Display -->
      <div class="mt-6">
        <!-- Starters Section -->
        <StartersTable
          :players="players"
          :formation="league?.formation ?? null"
          :highlighted-player-uuid="highlightedPlayerUuid"
          class="mb-6"
          @draft-by-position="handleDraftPlayerByPosition"
        >
          <template #header-action>
            <button
              @click="goToDraftPlayers"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/30 hover:border-white/50"
              title="View available players to draft"
            >
              <v-icon name="hi-solid-user-add" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Add Players</span>
              <span class="sm:hidden">Add</span>
            </button>
          </template>
        </StartersTable>

        <!-- Bench Section -->
        <BenchTable
          :players="players"
          :formation="league?.formation ?? null"
          :highlighted-player-uuid="highlightedPlayerUuid"
          @draft-by-position="handleDraftPlayerByPosition"
        />
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
          <h3
            class="text-lg font-semibold text-yellow-900 dark:text-yellow-100"
          >
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

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user/useUserStore";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useFantasyRounds } from "@/composables/useFantasyRounds";
import ShowFantasyTeam from "@/components/user/fantasy/ShowFantasyTeam.vue";
import RoundSelector from "@/components/fantasy/rounds/RoundSelector.vue";
import StartersTable from "@/components/fantasy/lineup/StartersTable.vue";
import BenchTable from "@/components/fantasy/lineup/BenchTable.vue";

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

function goToDraftPlayers() {
  if (leagueUuid.value) {
    router.push({
      name: "playersToDraft",
      params: { uuid: leagueUuid.value },
    });
  }
}

function handleDraftPlayerByPosition(position: string) {
  if (!leagueUuid.value) return;
  router.push({
    name: "playersToDraft",
    params: { uuid: leagueUuid.value },
    query: {
      position: position === "BENCH" || position === "FLEX" ? "ALL" : position,
      slotType: position,
    },
  });
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
/* Smooth transitions */
@media (prefers-reduced-motion: no-preference) {
  * {
    transition-duration: 0.2s;
  }
}

/* Responsive table */
@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }
}
</style>
