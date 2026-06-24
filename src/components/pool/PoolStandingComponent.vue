<template>
  <div class="space-y-4">
    <!-- Round filter: Overall toggle + rounds carousel -->
    <template v-if="stageUuid">
      <!-- Rounds loading -->
      <div v-if="loadingRounds" class="flex items-center justify-center py-3">
        <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
      </div>

      <!-- Overall + rounds (only when there are rounds to filter by) -->
      <div v-else-if="rounds.length > 0" class="flex items-center gap-2">
        <button
          type="button"
          @click="selectOverall"
          :class="[
            'shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95',
            mode === 'overall'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
          ]"
        >
          Overall
        </button>
        <div class="flex-1 min-w-0">
          <PoolRoundsCarousel :rounds="rounds" v-model="carouselIndex" />
        </div>
      </div>
    </template>

    <!-- Standings content — animated transition between scopes / states -->
    <transition name="fade-slide" mode="out-in">
      <!-- Loading -->
      <div v-if="loadingStandings" key="loading" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
        <div v-for="n in 6" :key="`st-skeleton-${n}`" class="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-2.5 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="h-4 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="standingsError"
        key="error"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
      >
        <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ standingsError }}</p>
        <button
          @click="loadStandings"
          class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="rankedStandings.length === 0"
        key="empty"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
      >
        <v-icon name="bi-trophy-fill" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">No Standings</h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500">
          {{ mode === 'round' ? 'No points have been scored in this round yet.' : 'Standings will appear once predictions are scored.' }}
        </p>
      </div>

      <!-- Standings list -->
      <div :key="scopeKey" v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <!-- Scope header -->
        <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-50 dark:border-gray-700/40">
          <span class="flex items-center gap-2 text-callout font-semibold text-gray-900 dark:text-white">
            <v-icon name="bi-trophy-fill" class="w-4 h-4 text-amber-500 shrink-0" />
            {{ mode === 'round' ? `Round ${selectedRound?.name}` : 'Overall' }}
          </span>
          <span class="text-2xs text-gray-400 dark:text-gray-500">
            {{ rankedStandings.length }} {{ rankedStandings.length === 1 ? 'player' : 'players' }}
          </span>
        </div>

        <!-- Rows -->
        <div class="divide-y divide-gray-50 dark:divide-gray-700/40">
          <div
            v-for="row in rankedStandings"
            :key="row.user.uuid || row.rank"
            class="flex items-center gap-3 px-4 py-3"
            :class="row.rank === 1 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''"
          >
            <!-- Rank -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold tabular-nums shrink-0"
              :class="rankClasses(row.rank)"
            >
              {{ row.rank }}
            </div>

            <!-- Avatar -->
            <img
              v-if="row.user.avatar"
              :src="row.user.avatar"
              :alt="memberName(row.user)"
              class="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-gray-100 dark:ring-gray-700"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0"
            >
              <span class="text-xs font-semibold text-white">{{ memberInitials(row.user) }}</span>
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">
                {{ memberName(row.user) }}
              </p>
              <p v-if="row.user.email" class="text-xs text-gray-400 dark:text-gray-500 truncate">
                {{ row.user.email }}
              </p>
            </div>

            <!-- Points -->
            <div class="text-right shrink-0">
              <span class="text-callout font-bold text-gray-900 dark:text-white tabular-nums">{{ row.points }}</span>
              <span class="block text-2xs text-gray-400 dark:text-gray-500 leading-none">pts</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { poolService } from "@/services/pool/poolService";
import PoolRoundsCarousel from "@/components/pool/PoolRoundsCarousel.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { PoolStandingResponse } from "@/interfaces/pool/PoolStandingResponse";
import type { UserDataInterface } from "@/interfaces/user/userInterface";

const props = defineProps<{ poolGroupUuid: string; stageUuid?: string }>();

// Rounds (only loaded when a stage is available, to power the round filter).
const rounds = ref<FootballRoundResponse[]>([]);
const loadingRounds = ref(false);

// Selection: default to "overall"; the carousel drives "round" mode.
const mode = ref<"overall" | "round">("overall");
const selectedIndex = ref(0);
const selectedRound = computed(() => rounds.value[selectedIndex.value] || null);

// Bridge the index-based carousel with our overall/round mode. While on overall
// we feed it -1 so no round pill is highlighted; picking a round flips to round mode.
const carouselIndex = computed<number>({
  get: () => (mode.value === "round" ? selectedIndex.value : -1),
  set: (index: number) => {
    selectedIndex.value = index;
    mode.value = "round";
  },
});

const selectOverall = () => {
  mode.value = "overall";
};

// Standings
const standings = ref<PoolStandingResponse[]>([]);
const loadingStandings = ref(false);
const standingsError = ref("");

// Rank the standings (sorted by points desc), with shared rank for ties.
const rankedStandings = computed(() => {
  const sorted = [...standings.value].sort((a, b) => b.points - a.points);
  let lastPoints: number | null = null;
  let lastRank = 0;
  return sorted.map((entry, i) => {
    const rank = lastPoints !== null && entry.points === lastPoints ? lastRank : i + 1;
    lastPoints = entry.points;
    lastRank = rank;
    return { ...entry, rank };
  });
});

// Identifies the current scope so watchers/transitions react to overall⇄round changes.
const scopeKey = computed(() =>
  mode.value === "round" ? `round:${selectedRound.value?.uuid ?? ""}` : "overall"
);

// --- Display helpers ---
const rankClasses = (rank: number): string => {
  if (rank === 1) return "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400";
  if (rank === 2) return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300";
  if (rank === 3) return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
  return "text-gray-400 dark:text-gray-500";
};

const memberName = (member: UserDataInterface): string => {
  const full = [member.firstname, member.lastname].filter(Boolean).join(" ").trim();
  return full || member.email || "Unknown player";
};

const memberInitials = (member: UserDataInterface): string => {
  const first = member.firstname?.[0] || "";
  const last = member.lastname?.[0] || "";
  const initials = (first + last).toUpperCase();
  return initials || member.email?.[0]?.toUpperCase() || "?";
};

// --- Data loading ---
const loadRounds = async () => {
  if (!props.stageUuid) {
    rounds.value = [];
    return;
  }

  loadingRounds.value = true;
  try {
    rounds.value = await catalogService.getRoundsByStage(props.stageUuid);
    const currentIdx = rounds.value.findIndex((r) => r.is_current);
    selectedIndex.value = currentIdx !== -1 ? currentIdx : 0;
  } catch (e) {
    console.error("Error loading rounds:", e);
    rounds.value = [];
  } finally {
    loadingRounds.value = false;
  }
};

const loadStandings = async () => {
  if (!props.poolGroupUuid) return;

  loadingStandings.value = true;
  standingsError.value = "";
  try {
    if (mode.value === "round") {
      const round = selectedRound.value;
      if (!round) {
        standings.value = [];
        return;
      }
      standings.value = await poolService.getPoolStandingsByRound(props.poolGroupUuid, round.uuid);
    } else {
      standings.value = await poolService.getPoolStandingOverall(props.poolGroupUuid);
    }
  } catch (e) {
    console.error("Error loading pool standings:", e);
    standingsError.value = "Failed to load standings. Please try again later.";
  } finally {
    loadingStandings.value = false;
  }
};

// Reload whenever the scope (overall⇄round, or which round) changes.
watch(scopeKey, loadStandings);
watch(() => props.stageUuid, loadRounds);
watch(() => props.poolGroupUuid, () => {
  loadRounds();
  loadStandings();
});

onMounted(() => {
  loadRounds();
  loadStandings();
});
</script>

<style scoped>
/* Smooth fade + slide when switching scope / states. */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
