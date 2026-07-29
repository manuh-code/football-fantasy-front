<template>
  <div class="w-full">
    <!-- Initial Loading Skeleton — mirrors the final layout (round selector +
         matchup + actions + team) so the load is seamless: no spinner first,
         then skeleton. The team skeleton matches FantasyTeamDisplay's exactly. -->
    <div
      v-if="isLoadingRounds && rounds.length === 0"
      class="mb-4 space-y-3"
    >
      <!-- Round selector skeleton -->
      <div class="flex items-center justify-between px-1">
        <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="flex flex-col items-center gap-1.5">
          <div class="h-3.5 w-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-2.5 w-16 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
        </div>
        <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>

      <!-- Matchup skeleton -->
      <div class="h-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 animate-pulse" />

      <!-- Quick actions skeleton -->
      <div class="flex gap-2">
        <div class="flex-1 h-11 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
        <div class="w-32 h-11 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
      </div>

      <!-- Team skeleton -->
      <FantasyTeamDisplaySkeleton />
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
          <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
            {{ $t('fantasy.myTeam.errorTitle') }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
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
          <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
            {{ $t('fantasy.myTeam.noLeagueTitle') }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.myTeam.noLeagueBody') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Round Selector -->
    <div v-else-if="rounds.length > 0" class="mb-4 space-y-3">
      <!-- Round Navigation — sticky so the jornada context stays visible while
           scrolling the long lineup. The offset matches the fixed global header
           (see .main-content-safe in App.vue). -->
      <div class="round-sticky bg-gray-50 dark:bg-gray-950 py-1.5">
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
      </div>

      <!-- Matchup by Round -->
      <MatchupByRoundAndUser
        :league-uuid="leagueUuid!"
        :round-uuid="selectedRoundUuid"
        :round-name="selectedRound?.round?.name ?? $t('fantasy.myTeam.matchupFallback')"
      />

      <!-- Quick Actions — "Add players" is the primary CTA (filled emerald),
           while Trades is a visible "coming soon" affordance instead of a dead
           disabled button: tapping it explains it's on the way. -->
      <div class="flex gap-2">
        <button
          @click="goToSearchPlayers()"
          class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 dark:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 active:scale-[0.97] transition-all"
        >
          <v-icon name="hi-solid-user-add" class="w-4 h-4" />
          <span class="text-footnote font-semibold">{{ $t('fantasy.myTeam.addPlayers') }}</span>
        </button>

        <button
          @click="onTradesComingSoon"
          class="shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:scale-[0.97] transition-all"
        >
          <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span class="text-footnote font-semibold text-gray-500 dark:text-gray-400">{{ $t('fantasy.myTeam.trades') }}</span>
          <span class="text-[0.625rem] leading-none font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            {{ $t('fantasy.myTeam.comingSoonBadge') }}
          </span>
        </button>
      </div>

      <!-- Fantasy Team Display -->
      <FantasyTeamDisplay
        :players="players"
        :formation="league?.formation ?? null"
        :league-uuid="leagueUuid ?? ''"
        :highlighted-player-uuid="highlightedPlayerUuid"
        :is-loading="isLoading"
        :fantasy-round-uuid="selectedRoundUuid ?? ''"
        @draft-by-position="handleDraftPlayerByPosition"
        @player-removed="loadPlayers"
        @lineup-updated="loadPlayers"
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
          <h3 class="text-footnote font-semibold text-gray-900 dark:text-white">
            {{ $t('fantasy.myTeam.noRoundsTitle') }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('fantasy.myTeam.noRoundsBody') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user/useUserStore";
import { useToast } from "@/composables/useToast";
import { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";
import { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useFantasyRounds } from "@/composables/useFantasyRounds";
import RoundSelector from "@/components/fantasy/rounds/RoundSelector.vue";
import FantasyTeamDisplay from "@/components/fantasy/lineup/FantasyTeamDisplay.vue";
import FantasyTeamDisplaySkeleton from "@/components/fantasy/lineup/FantasyTeamDisplaySkeleton.vue";
import MatchupByRoundAndUser from "@/components/fantasy/matchups/MatchupByRoundAndUser.vue";

interface Props {
  fantasyLeagueUuid?: string;
}

const props = defineProps<Props>();

// Router and stores
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const toast = useToast();

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
const players = ref<FantasyFootballPlayer[]>([]);
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
    const lineupResponse = await userStore.getFantasyFootballPlayersByLeagueUuid(
      leagueUuid.value,
      payload,
    );
    players.value = lineupResponse.players;

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

/**
 * Trades aren't shipped yet. Instead of a dead disabled button, tell the user
 * it's coming so the affordance reads as "not yet" rather than "broken".
 */
function onTradesComingSoon() {
  toast.info(
    t("fantasy.myTeam.tradesComingSoonTitle"),
    t("fantasy.myTeam.tradesComingSoonBody"),
    { duration: 2500 },
  );
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
/* Sticky round selector — the `top` mirrors .main-content-safe in App.vue so it
   parks right under the fixed global header instead of tucking behind it. */
.round-sticky {
  position: sticky;
  top: calc(3.5rem + env(safe-area-inset-top, 0px));
  z-index: 30;
}
@media (min-width: 640px) {
  .round-sticky {
    top: calc(4rem + env(safe-area-inset-top, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
