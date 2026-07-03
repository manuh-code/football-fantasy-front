<template>
  <div class="space-y-4">
    <!-- Survivor header -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
      <div class="flex items-start gap-3">
        <div class="w-11 h-11 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shrink-0">
          <v-icon name="hi-solid-shield-check" class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <!-- Name (skeleton while the survivor resolves) -->
          <div v-if="loadingSurvivor && !survivor" class="h-4 w-40 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div v-else class="flex items-start justify-between gap-2">
            <h1 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {{ survivor?.name || 'Survivor' }}
            </h1>
            <span
              v-if="survivor && statusBadge(survivor.status)"
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold shrink-0',
                statusBadge(survivor.status)!.classes,
              ]"
            >
              {{ statusBadge(survivor.status)!.label }}
            </span>
          </div>
          <p v-if="survivor?.description" class="text-footnote text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
            {{ survivor.description }}
          </p>
          <div v-if="survivor" class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-2">
            <v-icon name="hi-solid-heart" class="w-3.5 h-3.5 text-rose-400" />
            <span>{{ $t('survivor.list.livesCount', { count: survivor.max_lives }) }}</span>
          </div>
        </div>
      </div>
    </div>

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
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- No rounds -->
    <div
      v-else-if="rounds.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
    >
      <v-icon name="hi-solid-calendar" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('survivor.detail.noRounds') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('survivor.detail.noRoundsBody') }}</p>
    </div>

    <template v-else>
      <!-- Round carousel (swipe / drag to change round) -->
      <RoundCarousel :rounds="rounds" v-model="selectedIndex" />

      <!-- Hint: how to pick (only when there is at least one pickable fixture) -->
      <p
        v-if="!loadingFixtures && !fixturesError && hasPickableFixtures"
        class="flex items-center justify-center gap-1.5 text-2xs text-gray-400 dark:text-gray-500"
      >
        <v-icon name="hi-solid-cursor-click" class="w-3.5 h-3.5" />
        {{ $t('survivor.detail.tapToPick') }}
      </p>

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
            {{ $t('common.actions.retry') }}
          </button>
        </div>

        <!-- No fixtures -->
        <div
          v-else-if="fixtures.length === 0"
          key="empty"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
        >
          <v-icon name="gi-soccer-ball" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('survivor.detail.noFixtures') }}</h3>
          <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('survivor.detail.noFixturesBody') }}</p>
        </div>

        <!-- Fixtures + picks -->
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
                v-if="fixture.state?.name"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              >
                {{ fixture.state.name }}
              </span>
              <v-icon
                v-if="!isPickable(fixture)"
                name="hi-solid-lock-closed"
                class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
                :title="$t('survivor.detail.locked')"
              />
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
              <!-- Home team (pickable → button) -->
              <button
                type="button"
                :disabled="!isPickable(fixture) || savingFixtureUuid === fixture.uuid"
                @click="selectTeam(fixture, 'home')"
                :class="teamButtonClasses(fixture, 'home')"
              >
                <img
                  :src="homeTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="homeTeam(fixture)?.name || $t('survivor.detail.home')"
                  class="w-11 h-11 object-contain transition-transform"
                  :class="isPickable(fixture) ? 'group-hover:scale-110 group-active:scale-95' : ''"
                  @error="onLogoError"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight line-clamp-2">
                  {{ homeTeam(fixture)?.name || $t('survivor.detail.home') }}
                </span>
                <span
                  v-if="isPicked(fixture, 'home')"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold"
                  :class="pickBadge(fixture).classes"
                >
                  <v-icon v-if="savingFixtureUuid === fixture.uuid" name="pr-spinner" class="w-3 h-3" animation="spin" />
                  <v-icon v-else :name="pickBadge(fixture).icon" class="w-3 h-3" />
                  {{ pickBadge(fixture).label }}
                </span>
              </button>

              <!-- Center: score or vs -->
              <div class="flex flex-col items-center justify-center">
                <span v-if="hasScore(fixture)" class="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {{ goalsFor(fixture, 'home') }} <span class="text-gray-300 dark:text-gray-600">-</span> {{ goalsFor(fixture, 'away') }}
                </span>
                <span v-else class="text-sm font-semibold text-gray-300 dark:text-gray-600">{{ $t('football.matchcenter.vs') }}</span>
              </div>

              <!-- Away team (pickable → button) -->
              <button
                type="button"
                :disabled="!isPickable(fixture) || savingFixtureUuid === fixture.uuid"
                @click="selectTeam(fixture, 'away')"
                :class="teamButtonClasses(fixture, 'away')"
              >
                <img
                  :src="awayTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="awayTeam(fixture)?.name || $t('survivor.detail.away')"
                  class="w-11 h-11 object-contain transition-transform"
                  :class="isPickable(fixture) ? 'group-hover:scale-110 group-active:scale-95' : ''"
                  @error="onLogoError"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight line-clamp-2">
                  {{ awayTeam(fixture)?.name || $t('survivor.detail.away') }}
                </span>
                <span
                  v-if="isPicked(fixture, 'away')"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold"
                  :class="pickBadge(fixture).classes"
                >
                  <v-icon v-if="savingFixtureUuid === fixture.uuid" name="pr-spinner" class="w-3 h-3" animation="spin" />
                  <v-icon v-else :name="pickBadge(fixture).icon" class="w-3 h-3" />
                  {{ pickBadge(fixture).label }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { catalogService } from "@/services/catalog/CatalogService";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { useToast } from "@/composables/useToast";
import RoundCarousel from "@/components/ui/RoundCarousel.vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { SurvivorResponse } from "@/interfaces/survivor/SurvivorResponse";
import type { SurvivorPickResponse } from "@/interfaces/survivor/SurvivorPickResponse";

const props = defineProps<{ survivorUuid: string }>();

const { t, locale } = useI18n();
const leagueStore = useFootballLeagueStore();
const { success } = useToast();

// --- Survivor header (resolved from the user's survivors so the header survives refresh) ---
const survivor = ref<SurvivorResponse | null>(null);
const loadingSurvivor = ref(false);

// --- Rounds ---
const rounds = ref<FootballRoundResponse[]>([]);
const loadingRounds = ref(false);
const roundsError = ref("");
const selectedIndex = ref(0);
const selectedRound = computed(() => rounds.value[selectedIndex.value] || null);

// --- Fixtures of the selected round (with embedded picks) ---
const fixtures = ref<FootballFixtureResponse[]>([]);
const loadingFixtures = ref(false);
const fixturesError = ref("");

// UUID of the fixture whose pick is currently being saved (drives the spinner).
const savingFixtureUuid = ref<string | null>(null);

// A fixture is only pickable while it hasn't started (not in play) and isn't over.
const isPickable = (fixture: FootballFixtureResponse): boolean =>
  !fixture.is_finished && !fixture.is_inplay;

const hasPickableFixtures = computed(() => fixtures.value.some(isPickable));

// Resolve the badge shown for the survivor status (mirrors SurvivorComponent).
const statusBadge = (status: string): { label: string; classes: string } | null => {
  switch ((status || "").toLowerCase()) {
    case "active":
    case "in_progress":
      return {
        label: t("survivor.status.active"),
        classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      };
    case "eliminated":
      return {
        label: t("survivor.status.eliminated"),
        classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      };
    case "finished":
      return {
        label: t("survivor.status.finished"),
        classes: "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500",
      };
    case "pending":
      return {
        label: t("survivor.status.pending"),
        classes: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      };
    default:
      return null;
  }
};

// --- Team / score helpers ---
const homeTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home") || fixture.participants?.[0];

const awayTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away") || fixture.participants?.[1];

const hasScore = (fixture: FootballFixtureResponse): boolean =>
  Array.isArray(fixture.scores) && fixture.scores.length > 0;

const goalsFor = (fixture: FootballFixtureResponse, location: "home" | "away"): number => {
  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  const current = team?.current_score?.score;
  if (typeof current === "number") return current;
  const score = fixture.scores?.find((s) => s.score?.participant === location);
  return typeof score?.score?.goals === "number" ? score.score.goals : 0;
};

// --- Pick helpers ---
// The user's pick for a fixture is the team stored in `fixture.pick.team`.
const isPicked = (fixture: FootballFixtureResponse, location: "home" | "away"): boolean => {
  const pickedUuid = fixture.pick?.team?.uuid;
  if (!pickedUuid) return false;
  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  return team?.uuid === pickedUuid;
};

// Ring/background highlight of the picked team, colored by the pick's outcome.
const pickHighlight = (fixture: FootballFixtureResponse): string => {
  const pick = fixture.pick;
  if (pick?.is_win) return "ring-2 ring-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20";
  if (pick?.is_loss) return "ring-2 ring-red-400 bg-red-50/60 dark:bg-red-900/20";
  if (pick?.is_draw) return "ring-2 ring-amber-400 bg-amber-50/60 dark:bg-amber-900/20";
  return "ring-2 ring-emerald-400/70 bg-emerald-50/40 dark:bg-emerald-900/10";
};

// Label + styles for the "your pick" outcome badge under the selected team.
const pickBadge = (fixture: FootballFixtureResponse): { label: string; classes: string; icon: string } => {
  const pick = fixture.pick;
  if (pick?.is_win)
    return {
      label: t("survivor.detail.result.win"),
      classes: "bg-emerald-500 text-white",
      icon: "hi-solid-check",
    };
  if (pick?.is_loss)
    return {
      label: t("survivor.detail.result.loss"),
      classes: "bg-red-500 text-white",
      icon: "hi-solid-x",
    };
  if (pick?.is_draw)
    return {
      label: t("survivor.detail.result.draw"),
      classes: "bg-amber-500 text-white",
      icon: "hi-solid-minus",
    };
  return {
    label: t("survivor.detail.yourPick"),
    classes: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    icon: "hi-solid-check",
  };
};

// Classes for a team column: base layout + hover affordance when pickable +
// the outcome highlight when this is the picked team.
const teamButtonClasses = (fixture: FootballFixtureResponse, location: "home" | "away"): string => {
  const parts = [
    "group w-full flex flex-col items-center gap-1.5 text-center min-w-0 rounded-xl p-2 transition-all focus:outline-none",
  ];
  const picked = isPicked(fixture, location);
  if (picked) parts.push(pickHighlight(fixture));
  if (isPickable(fixture)) {
    parts.push("cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400/50");
    if (!picked) parts.push("hover:bg-gray-50 dark:hover:bg-gray-700/40");
  } else {
    parts.push("cursor-not-allowed");
  }
  return parts.join(" ");
};

// Persist the user's pick for a fixture: POST { survivor, fixture, team }.
// Optimistic: the highlight moves to the chosen team instantly and we only
// touch this single fixture (no full-list reload), rolling back if the save fails.
const selectTeam = async (fixture: FootballFixtureResponse, location: "home" | "away") => {
  // Can't pick once the match is in play or finished, and never while a save runs.
  if (!isPickable(fixture) || savingFixtureUuid.value !== null) return;

  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  if (!team) return;

  // No-op if this team is already the current pick.
  if (fixture.pick?.team?.uuid === team.uuid) return;

  // Optimistic update: move the pick to the chosen team right away.
  const previousPick = fixture.pick ?? null;
  fixture.pick = {
    result: "",
    is_pending: true,
    is_win: false,
    is_loss: false,
    is_draw: false,
    team,
  } as SurvivorPickResponse;

  savingFixtureUuid.value = fixture.uuid;
  try {
    const updated = await survivorService.picksBySurvivor({
      survivor_uuid: props.survivorUuid,
      fixture_uuid: fixture.uuid,
      team_uuid: team.uuid,
    });
    // Reconcile only this fixture's pick from the response (leaves the rest as-is).
    const fresh = Array.isArray(updated)
      ? updated.find((f) => f.uuid === fixture.uuid)
      : undefined;
    if (fresh?.pick) fixture.pick = fresh.pick;
    success(t("survivor.detail.pickSavedTitle"), t("survivor.detail.pickSavedBody", { team: team.name }));
  } catch (e) {
    // Roll back the optimistic pick; the API interceptor surfaces the error toast.
    fixture.pick = previousPick;
    console.error("Error saving survivor pick:", e);
  } finally {
    savingFixtureUuid.value = null;
  }
};

// --- Formatting ---
const formatKickoff = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString(locale.value, {
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
const loadSurvivor = async () => {
  loadingSurvivor.value = true;
  try {
    const list = await survivorService.getMySurvivors();
    survivor.value = list.find((s) => s.uuid === props.survivorUuid) || null;
  } catch (e) {
    console.error("Error loading survivor:", e);
  } finally {
    loadingSurvivor.value = false;
  }
};

// Resolve the current stage for the selected league so we can list its rounds.
const resolveStageUuid = async (): Promise<string | null> => {
  const cached = leagueStore.getCurrentStageUuid();
  if (cached) return cached;

  const seasonUuid = leagueStore.getCurrentFootballSeason()?.uuid;
  if (!seasonUuid) return null;

  const stages = await catalogService.getStagesBySeasonUuid(seasonUuid);
  if (Array.isArray(stages) && stages.length > 0) {
    const current = stages.find((s) => s.is_current) ?? stages[0];
    leagueStore.setCurrentStageUuid(current.uuid);
    return current.uuid;
  }
  return null;
};

const loadRounds = async () => {
  loadingRounds.value = true;
  roundsError.value = "";
  try {
    const stageUuid = await resolveStageUuid();
    if (!stageUuid) {
      rounds.value = [];
      return;
    }
    rounds.value = await catalogService.getRoundsByStage(stageUuid);
    const currentIdx = rounds.value.findIndex((r) => r.is_current);
    selectedIndex.value = currentIdx !== -1 ? currentIdx : 0;
  } catch (e) {
    console.error("Error loading rounds:", e);
    roundsError.value = t("survivor.detail.roundsError");
  } finally {
    loadingRounds.value = false;
  }
};

const loadFixtures = async () => {
  const round = selectedRound.value;
  if (!round || !props.survivorUuid) return;

  loadingFixtures.value = true;
  fixturesError.value = "";
  try {
    fixtures.value = await survivorService.getFixturesBySurvivorUuidAndRoundUuid(
      props.survivorUuid,
      round.uuid
    );
  } catch (e) {
    console.error("Error loading survivor fixtures:", e);
    fixturesError.value = t("survivor.detail.fixturesError");
  } finally {
    loadingFixtures.value = false;
  }
};

// Load the selected round's fixtures whenever the round changes.
watch(selectedRound, loadFixtures);

onMounted(() => {
  loadSurvivor();
  loadRounds();
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
