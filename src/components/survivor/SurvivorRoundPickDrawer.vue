<template>
  <BottomSheet
    :is-visible="isOpen"
    :title="roundName || $t('survivor.mypicks.title')"
    :subtitle="$t('survivor.detail.pickRoundSubtitle')"
    icon="hi-solid-shield-check"
    icon-variant="red"
    size="xl"
    @close="emit('close')"
  >
    <div class="space-y-3">
      <!-- Hint: how to pick (only when there is at least one pickable fixture) -->
      <p
        v-if="!loadingFixtures && !fixturesError && hasPickableFixtures"
        class="flex items-center justify-center gap-1.5 text-2xs text-gray-400 dark:text-gray-500"
      >
        <v-icon name="hi-solid-cursor-click" class="w-3.5 h-3.5" />
        {{ $t('survivor.detail.tapToPick') }}
      </p>

      <!-- Fixtures content — animated transition between states -->
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
        <div v-else key="fixtures" class="space-y-3">
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
                :disabled="!canPickTeam(fixture, 'home') || savingFixtureUuid === fixture.uuid"
                @click="selectTeam(fixture, 'home')"
                class="pick-team-btn"
                :class="teamButtonClasses(fixture, 'home')"
              >
                <img
                  :src="homeTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="homeTeam(fixture)?.name || $t('survivor.detail.home')"
                  class="w-11 h-11 object-contain transition-transform"
                  :class="canPickTeam(fixture, 'home') ? 'group-hover:scale-110 group-active:scale-95' : ''"
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
                :disabled="!canPickTeam(fixture, 'away') || savingFixtureUuid === fixture.uuid"
                @click="selectTeam(fixture, 'away')"
                class="pick-team-btn"
                :class="teamButtonClasses(fixture, 'away')"
              >
                <img
                  :src="awayTeam(fixture)?.image_path || '/img/default-avatar.svg'"
                  :alt="awayTeam(fixture)?.name || $t('survivor.detail.away')"
                  class="w-11 h-11 object-contain transition-transform"
                  :class="canPickTeam(fixture, 'away') ? 'group-hover:scale-110 group-active:scale-95' : ''"
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
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { survivorService } from "@/services/survivor/SurvivorServive";
import { useToast } from "@/composables/useToast";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import type { SurvivorPickResponse } from "@/interfaces/survivor/SurvivorPickResponse";

const props = defineProps<{
  isOpen: boolean;
  survivorUuid: string;
  roundUuid: string;
  roundName?: string;
}>();

const emit = defineEmits<{
  close: [];
  // Fired after a pick is successfully saved so the parent can refresh its list.
  picked: [];
}>();

const { t, locale } = useI18n();
const { success } = useToast();

// --- Fixtures of the round (with embedded picks) ---
const fixtures = ref<FootballFixtureResponse[]>([]);
const loadingFixtures = ref(false);
const fixturesError = ref("");

// UUID of the fixture whose pick is currently being saved (drives the spinner).
const savingFixtureUuid = ref<string | null>(null);

// A fixture is only pickable while it hasn't started (not in play) and isn't over.
const isPickable = (fixture: FootballFixtureResponse): boolean =>
  !fixture.is_finished && !fixture.is_inplay;

// --- Team / score helpers ---
const homeTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home") || fixture.participants?.[0];

const awayTeam = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away") || fixture.participants?.[1];

// A team's shield is blocked when the backend flags it as already picked (is_team_picked).
const isTeamBlocked = (fixture: FootballFixtureResponse, location: "home" | "away"): boolean => {
  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  return team?.is_team_picked === true;
};

// A team can be picked only while its fixture is pickable AND the team itself isn't blocked.
const canPickTeam = (fixture: FootballFixtureResponse, location: "home" | "away"): boolean =>
  isPickable(fixture) && !isTeamBlocked(fixture, location);

const hasPickableFixtures = computed(() =>
  fixtures.value.some((f) => canPickTeam(f, "home") || canPickTeam(f, "away"))
);

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
  if (canPickTeam(fixture, location)) {
    parts.push("cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400/50");
    if (!picked) parts.push("hover:bg-gray-50 dark:hover:bg-gray-700/40");
  } else {
    parts.push("cursor-not-allowed");
    if (isTeamBlocked(fixture, location) && !picked) parts.push("opacity-40 grayscale");
  }
  return parts.join(" ");
};

// Persist the user's pick for a fixture: POST { survivor, fixture, team }.
// Optimistic: the highlight moves to the chosen team instantly and we only
// touch this single fixture (no full-list reload), rolling back if the save fails.
const selectTeam = async (fixture: FootballFixtureResponse, location: "home" | "away") => {
  // Can't pick a team once its fixture is locked, the team is already blocked, or while a save runs.
  if (!canPickTeam(fixture, location) || savingFixtureUuid.value !== null) return;

  const team = location === "home" ? homeTeam(fixture) : awayTeam(fixture);
  if (!team) return;

  // No-op if this team is already the current pick.
  if (fixture.pick?.team?.uuid === team.uuid) return;

  // A survivor round allows a SINGLE pick, so choosing a team clears the
  // selection on every other fixture. Snapshot the whole round's picks first so
  // a failed save can roll all of them back.
  const previousPicks = new Map(fixtures.value.map((f) => [f.uuid, f.pick ?? null]));

  // Optimistic update: drop the pick everywhere else, then move it to the chosen team.
  fixtures.value.forEach((f) => {
    if (f.uuid !== fixture.uuid && f.pick) f.pick = null;
  });
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
    // Reconcile the whole round from the response: the backend keeps a single
    // pick per round, so this also clears the picks the user moved away from.
    if (Array.isArray(updated)) {
      const byUuid = new Map(updated.map((f) => [f.uuid, f]));
      fixtures.value.forEach((f) => {
        const fresh = byUuid.get(f.uuid);
        if (fresh) f.pick = fresh.pick ?? null;
      });
    }
    success(t("survivor.detail.pickSavedTitle"), t("survivor.detail.pickSavedBody", { team: team.name }));
    emit("picked");
  } catch (e) {
    // Roll back every fixture's pick; the API interceptor surfaces the error toast.
    fixtures.value.forEach((f) => {
      if (previousPicks.has(f.uuid)) f.pick = previousPicks.get(f.uuid) ?? null;
    });
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
const loadFixtures = async () => {
  if (!props.survivorUuid || !props.roundUuid) return;

  loadingFixtures.value = true;
  fixturesError.value = "";
  try {
    fixtures.value = await survivorService.getFixturesBySurvivorUuidAndRoundUuid(
      props.survivorUuid,
      props.roundUuid
    );
  } catch (e) {
    console.error("Error loading survivor fixtures:", e);
    fixturesError.value = t("survivor.detail.fixturesError");
  } finally {
    loadingFixtures.value = false;
  }
};

// Load the round's fixtures whenever the drawer opens (or targets a new round).
watch(
  () => [props.isOpen, props.roundUuid] as const,
  ([open]) => {
    if (open) {
      loadFixtures();
    } else {
      // Reset so a reopen always shows a fresh loading state.
      fixtures.value = [];
      fixturesError.value = "";
    }
  }
);
</script>

<style scoped>
/* A team column is a pick target (tap to choose), not copyable text. Without
   this, long-pressing a team on iOS/Android starts a native text selection +
   callout ("Copy / Translate") over its name. user-select and
   -webkit-touch-callout inherit, so setting them on the button disables it for
   the crest and name inside. Declared as real CSS (not a Tailwind arbitrary
   class) so the vendor-prefixed properties iOS needs are guaranteed to ship —
   same approach as .picks-board in SurvivorMyPicksComponent. */
.pick-team-btn {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Smooth fade + slide when switching fixture states. */
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
