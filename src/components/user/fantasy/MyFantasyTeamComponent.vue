<template>
  <div class="w-full">
    <!-- Loading State -->
    <div
      v-if="isLoading && players.length === 0"
      class="flex items-center justify-center min-h-[300px]"
    >
      <div class="flex flex-col items-center gap-2">
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
        <p class="text-[13px] text-gray-400 dark:text-gray-500">
          Loading your team...
        </p>
      </div>
    </div>

    <!-- Loading Rounds State -->
    <div
      v-else-if="isLoadingRounds && rounds.length === 0"
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
          <p class="text-[12px] text-gray-500 dark:text-gray-400">{{ error }}</p>
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
    <div v-else-if="rounds.length > 0" class="mb-4">
      <!-- Team Info Card -->
      <ShowFantasyTeam v-if="leagueUuid" :league-uuid="leagueUuid" class="mb-3" />

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
      <div class="mt-4">
        <!-- Starters Section -->
        <StartersTable
          :players="players"
          :formation="league?.formation ?? null"
          :highlighted-player-uuid="highlightedPlayerUuid"
          class="mb-4"
          @draft-by-position="handleDraftPlayerByPosition"
        >
          <template #header-action>
            <button
              @click="goToSearchPlayers"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 active:bg-white/30 text-white text-[11px] font-medium rounded-lg backdrop-blur-sm transition-all border border-white/30"
              title="Search and add players to your team"
            >
              <v-icon name="hi-solid-user-add" class="w-3 h-3" />
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

/**
 * Navigate to the dedicated search players page.
 */
function goToSearchPlayers() {
  if (!leagueUuid.value) return;
  router.push({
    name: 'searchPlayerFantasy',
    params: { uuid: leagueUuid.value },
  });
}

function handleDraftPlayerByPosition(position: string) {
  goToSearchPlayers();
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
