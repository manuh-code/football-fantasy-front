<template>
  <div class="space-y-4">
    <!-- Rounds loading -->
    <div v-if="loadingRounds" class="flex items-center justify-center py-10">
      <v-icon name="pr-spinner" class="w-6 h-6 text-gray-300 dark:text-gray-600" animation="spin" />
    </div>

    <!-- Rounds error -->
    <div
      v-else-if="roundsError"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ roundsError }}</p>
      <button
        @click="loadRounds"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- No rounds -->
    <div
      v-else-if="rounds.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
    >
      <v-icon name="hi-solid-calendar" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">No Rounds</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500">There are no rounds available for this stage yet.</p>
    </div>

    <template v-else>
      <!-- Round carousel (swipe / drag to change round) -->
      <PoolRoundsCarousel :rounds="rounds" v-model="selectedIndex" />

      <!-- Fixtures content — animated transition between states / rounds -->
      <transition name="fade-slide" mode="out-in">
      <!-- Fixtures loading -->
      <div v-if="loadingFixtures" key="loading" class="space-y-3">
        <div
          v-for="n in 4"
          :key="`fx-skeleton-${n}`"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 animate-pulse"
        >
          <div class="h-2.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div class="flex flex-col items-center gap-2">
              <div class="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div class="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div class="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div class="flex flex-col items-center gap-2">
              <div class="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div class="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <!-- Fixtures error -->
      <div
        v-else-if="fixturesError"
        key="error"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
      >
        <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ fixturesError }}</p>
        <button
          @click="loadFixtures"
          class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- No fixtures -->
      <div
        v-else-if="fixtures.length === 0"
        key="empty"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
      >
        <v-icon name="gi-soccer-ball" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">No Fixtures</h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500">There are no matches in this round.</p>
      </div>

      <!-- Fixtures + predictions -->
      <div v-else :key="selectedRound?.uuid || 'fixtures'" class="space-y-3">
          <div
            v-for="fixture in fixtures"
            :key="fixture.uuid"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4"
          >
            <!-- Kickoff + status -->
            <div class="flex items-center justify-center gap-2 mb-3">
              <span class="text-2xs text-gray-400 dark:text-gray-500">{{ formatKickoff(fixture.starting_at) }}</span>
              <span
                v-if="isPredictable(fixture)"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              >
                Open
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              >
                {{ fixture.state?.name || 'Played' }}
              </span>
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
              <!-- Home team -->
              <div class="flex flex-col items-center gap-1.5 text-center min-w-0">
                <img
                  :src="homeTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="homeTeam(fixture)?.name || 'Home'"
                  class="w-11 h-11 object-contain"
                  @error="onLogoError"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight line-clamp-2">
                  {{ homeTeam(fixture)?.name || 'Home' }}
                </span>
              </div>

              <!-- Center: result or prediction inputs -->
              <div class="flex flex-col items-center justify-center">
                <template v-if="isPredictable(fixture)">
                  <div class="flex items-start gap-2.5">
                    <!-- Home stepper -->
                    <div class="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        @click="adjustScore(fixture.uuid, 'home', 1)"
                        :aria-label="`Increase ${homeTeam(fixture)?.name || 'home'} score`"
                        class="stepper-btn"
                      >
                        <v-icon name="hi-solid-plus" class="w-4 h-4" />
                      </button>
                      <span class="w-9 text-center text-2xl font-bold text-gray-900 dark:text-white tabular-nums select-none">
                        {{ predictions[fixture.uuid].home }}
                      </span>
                      <button
                        type="button"
                        @click="adjustScore(fixture.uuid, 'home', -1)"
                        :disabled="predictions[fixture.uuid].home <= 0"
                        :aria-label="`Decrease ${homeTeam(fixture)?.name || 'home'} score`"
                        class="stepper-btn"
                      >
                        <v-icon name="hi-solid-minus" class="w-4 h-4" />
                      </button>
                    </div>

                    <span class="text-gray-300 dark:text-gray-600 font-bold text-xl mt-9">:</span>

                    <!-- Away stepper -->
                    <div class="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        @click="adjustScore(fixture.uuid, 'away', 1)"
                        :aria-label="`Increase ${awayTeam(fixture)?.name || 'away'} score`"
                        class="stepper-btn"
                      >
                        <v-icon name="hi-solid-plus" class="w-4 h-4" />
                      </button>
                      <span class="w-9 text-center text-2xl font-bold text-gray-900 dark:text-white tabular-nums select-none">
                        {{ predictions[fixture.uuid].away }}
                      </span>
                      <button
                        type="button"
                        @click="adjustScore(fixture.uuid, 'away', -1)"
                        :disabled="predictions[fixture.uuid].away <= 0"
                        :aria-label="`Decrease ${awayTeam(fixture)?.name || 'away'} score`"
                        class="stepper-btn"
                      >
                        <v-icon name="hi-solid-minus" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <span class="text-2xs text-gray-400 dark:text-gray-500 mt-2">Tap to set your prediction</span>
                </template>
                <template v-else>
                  <span class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {{ goalsFor(fixture, 'home') }} <span class="text-gray-300 dark:text-gray-600">-</span> {{ goalsFor(fixture, 'away') }}
                  </span>
                </template>
              </div>

              <!-- Away team -->
              <div class="flex flex-col items-center gap-1.5 text-center min-w-0">
                <img
                  :src="awayTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="awayTeam(fixture)?.name || 'Away'"
                  class="w-11 h-11 object-contain"
                  @error="onLogoError"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight line-clamp-2">
                  {{ awayTeam(fixture)?.name || 'Away' }}
                </span>
              </div>
            </div>
          </div>

        <!-- Save (endpoint pending) -->
        <button
          v-if="hasPredictableFixtures"
          type="button"
          @click="savePredictions"
          class="w-full py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 active:scale-[0.98] shadow-sm shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
        >
          <v-icon name="hi-solid-save" class="w-4 h-4" />
          Save predictions
        </button>
      </div>
      </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { useToast } from "@/composables/useToast";
import PoolRoundsCarousel from "@/components/pool/PoolRoundsCarousel.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

const props = defineProps<{ stageUuid: string }>();

const { info } = useToast();

// Rounds
const rounds = ref<FootballRoundResponse[]>([]);
const loadingRounds = ref(false);
const roundsError = ref("");
const selectedIndex = ref(0);

// Fixtures
const fixtures = ref<FootballFixtureResponse[]>([]);
const loadingFixtures = ref(false);
const fixturesError = ref("");

// Local prediction state, keyed by fixture uuid (no persistence endpoint yet).
type Prediction = { home: number; away: number };
const predictions = reactive<Record<string, Prediction>>({});

// Reasonable upper bound for a football scoreline.
const MAX_SCORE = 20;

// Increment / decrement a predicted score (clamped to [0, MAX_SCORE]).
const adjustScore = (fixtureUuid: string, side: "home" | "away", delta: number) => {
  const entry = predictions[fixtureUuid];
  if (!entry) return;
  entry[side] = Math.min(MAX_SCORE, Math.max(0, entry[side] + delta));
};

const selectedRound = computed(() => rounds.value[selectedIndex.value] || null);

// --- Team / score helpers ---
const homeTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home") || fixture.participants?.[0];

const awayTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away") || fixture.participants?.[1];

// A fixture with no scores yet is open for predictions.
const isPredictable = (fixture: FootballFixtureResponse): boolean =>
  !Array.isArray(fixture.scores) || fixture.scores.length === 0;

const goalsFor = (fixture: FootballFixtureResponse, location: "home" | "away"): number => {
  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  const current = team?.current_score?.score;
  if (typeof current === "number") return current;
  const score = fixture.scores?.find((s) => s.score?.participant === location);
  return typeof score?.score?.goals === "number" ? score.score.goals : 0;
};

const hasPredictableFixtures = computed(() => fixtures.value.some(isPredictable));

// --- Formatting ---
const formatKickoff = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const onLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

// --- Data loading ---
const loadRounds = async () => {
  if (!props.stageUuid) return;

  loadingRounds.value = true;
  roundsError.value = "";
  try {
    rounds.value = await catalogService.getRoundsByStage(props.stageUuid);
    const currentIdx = rounds.value.findIndex((r) => r.is_current);
    selectedIndex.value = currentIdx !== -1 ? currentIdx : 0;
  } catch (e) {
    console.error("Error loading rounds:", e);
    roundsError.value = "Failed to load rounds. Please try again later.";
  } finally {
    loadingRounds.value = false;
  }
};

const loadFixtures = async () => {
  const round = selectedRound.value;
  if (!round || !props.stageUuid) return;

  loadingFixtures.value = true;
  fixturesError.value = "";
  try {
    fixtures.value = await footballFixtureService.getFixuresByStageAndRound(props.stageUuid, round.uuid);
    // Seed local prediction state for predictable fixtures.
    fixtures.value.forEach((fixture) => {
      if (isPredictable(fixture) && !predictions[fixture.uuid]) {
        predictions[fixture.uuid] = { home: 0, away: 0 };
      }
    });
  } catch (e) {
    console.error("Error loading fixtures:", e);
    fixturesError.value = "Failed to load fixtures. Please try again later.";
  } finally {
    loadingFixtures.value = false;
  }
};

const savePredictions = () => {
  // Persistence endpoint is not available yet.
  info("Coming soon", "Saving predictions will be available soon.");
};

// Reload fixtures whenever the selected round changes (centering lives in the carousel).
watch(selectedIndex, loadFixtures);

// Reset everything if the stage changes.
watch(
  () => props.stageUuid,
  () => loadRounds()
);

onMounted(async () => {
  await loadRounds();
  await loadFixtures();
});
</script>

<style scoped>
/* Smooth fade + slide when switching rounds / fixture states. */
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

/* Minimalist score stepper buttons. */
.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  color: rgb(107 114 128); /* gray-500 */
  background: rgb(243 244 246); /* gray-100 */
  transition: all 0.15s ease;
}
.dark .stepper-btn {
  color: rgb(209 213 219); /* gray-300 */
  background: rgb(55 65 81 / 0.6); /* gray-700/60 */
}
.stepper-btn:active {
  background: rgb(16 185 129); /* emerald-500 */
  color: #fff;
  transform: scale(0.9);
}
.stepper-btn:disabled {
  opacity: 0.3;
  pointer-events: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
