<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import SearchableSelectComponent from "@/components/ui/SearchableSelectComponent.vue";

interface Props {
  isOpen: boolean;
  stageUuid: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  "fixture-selected": [fixtureUuid: string];
}>();

const { t } = useI18n();

// ── State ──
const rounds = ref<FootballRoundResponse[]>([]);
const isLoadingRounds = ref(false);
const roundsError = ref<string | null>(null);

const selectedRoundUuid = ref<string | null>(null);

const fixtures = ref<FootballFixtureResponse[]>([]);
const isLoadingFixtures = ref(false);
const fixturesError = ref<string | null>(null);

// Cache rounds by stage to avoid refetching
const roundsCache = new Map<string, FootballRoundResponse[]>();

// ── Data loading ──
const loadRounds = async (stageUuid: string) => {
  if (roundsCache.has(stageUuid)) {
    rounds.value = roundsCache.get(stageUuid)!;
    pickDefaultRound();
    return;
  }
  isLoadingRounds.value = true;
  roundsError.value = null;
  rounds.value = [];
  try {
    const result = await catalogService.getRoundsByStage(stageUuid);
    rounds.value = result;
    roundsCache.set(stageUuid, result);
    pickDefaultRound();
  } catch (err) {
    console.error("Error loading rounds:", err);
    roundsError.value = t("football.fixtures.errors.roundsLoad");
  } finally {
    isLoadingRounds.value = false;
  }
};

const pickDefaultRound = () => {
  if (rounds.value.length === 0) {
    selectedRoundUuid.value = null;
    return;
  }
  const current = rounds.value.find((r) => r.is_current);
  selectedRoundUuid.value = current
    ? current.uuid
    : rounds.value[0].uuid;
};

const loadFixtures = async (stageUuid: string, roundUuid: string) => {
  isLoadingFixtures.value = true;
  fixturesError.value = null;
  fixtures.value = [];
  try {
    fixtures.value = await footballFixtureService.getFixuresByStageAndRound(
      stageUuid,
      roundUuid,
    );
  } catch (err) {
    console.error("Error loading fixtures for round:", err);
    fixturesError.value = t("football.fixtures.errors.roundFixturesLoad");
  } finally {
    isLoadingFixtures.value = false;
  }
};

const retryFixtures = () => {
  if (props.stageUuid && selectedRoundUuid.value) {
    loadFixtures(props.stageUuid, selectedRoundUuid.value);
  }
};

const retryRounds = () => {
  if (props.stageUuid) {
    roundsCache.delete(props.stageUuid);
    loadRounds(props.stageUuid);
  }
};

// Open drawer → load rounds
watch(
  () => [props.isOpen, props.stageUuid] as const,
  ([open, stageUuid]) => {
    if (open && stageUuid) loadRounds(stageUuid);
    if (!open) {
      // Reset the selected round so pickDefaultRound() on the next open
      // produces a real change and triggers the fixtures watcher again.
      selectedRoundUuid.value = null;
      fixtures.value = [];
      fixturesError.value = null;
    }
  },
);

// Selected round changes → fetch fixtures
watch(selectedRoundUuid, (uuid) => {
  if (uuid && props.stageUuid && props.isOpen) {
    loadFixtures(props.stageUuid, uuid);
  }
});

// ── Fixture helpers (mirror parent component) ──
const getHomeParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home");

const getAwayParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away");

const getTeamName = (team: FootballTeamResponse | undefined): string => team?.name || t('football.team.tbd');

const hasScores = (fixture: FootballFixtureResponse): boolean => {
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  return (
    home?.current_score !== undefined &&
    home?.current_score !== null &&
    away?.current_score !== undefined &&
    away?.current_score !== null
  );
};

const getHomeScore = (fixture: FootballFixtureResponse): number =>
  getHomeParticipant(fixture)?.current_score?.score ?? 0;

const getAwayScore = (fixture: FootballFixtureResponse): number =>
  getAwayParticipant(fixture)?.current_score?.score ?? 0;

const isMatchLive = (fixture: FootballFixtureResponse): boolean => {
  // The API's `is_inplay` flag is the authoritative live signal — prefer it over
  // guessing from `state.name`, which drifts as the backend's state labels change.
  if (fixture.is_inplay != null) return fixture.is_inplay;
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    return (
      stateName.includes("live") ||
      stateName.includes("in play") ||
      stateName.includes("ht") ||
      stateName.includes("half time")
    );
  }
  if (!hasScores(fixture)) return false;
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  const matchStarted = new Date(fixture.starting_at).getTime() <= Date.now();
  const noWinnerDecided = home?.meta?.winner === null && away?.meta?.winner === null;
  return matchStarted && noWinnerDecided && hasScores(fixture);
};

const isMatchFinished = (fixture: FootballFixtureResponse): boolean => {
  if (fixture.state) return fixture.state.state.includes("FT");
  const home = getHomeParticipant(fixture);
  return home?.meta?.winner !== null && home?.meta?.winner !== undefined;
};

const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatMatchTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFixtureStateText = (fixture: FootballFixtureResponse): string => {
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    if (stateName.includes("finished") || stateName.includes("ft")) return "FT";
    if (stateName.includes("live") || stateName.includes("in play")) return "LIVE";
    if (stateName.includes("ht") || stateName.includes("half time")) return "HT";
    if (stateName.includes("postponed")) return "POSTPONED";
    if (stateName.includes("cancelled")) return "CANCELLED";
    return fixture.state.name;
  }
  if (isMatchFinished(fixture)) return "FT";
  if (isMatchLive(fixture)) return "LIVE";
  return formatMatchTime(fixture.starting_at);
};

const getFixtureStateClass = (fixture: FootballFixtureResponse): string => {
  if (isMatchFinished(fixture)) {
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  }
  if (isMatchLive(fixture)) {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  }
  return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
};

const getTeamResultClass = (
  fixture: FootballFixtureResponse,
  location: "home" | "away",
): string => {
  if (!hasScores(fixture) || !isMatchFinished(fixture)) {
    return "text-gray-600 dark:text-gray-300";
  }
  const homeScore = getHomeScore(fixture);
  const awayScore = getAwayScore(fixture);
  if (homeScore === awayScore) return "text-yellow-600 dark:text-yellow-400 font-medium";
  const teamWon =
    (location === "home" && homeScore > awayScore) ||
    (location === "away" && awayScore > homeScore);
  return teamWon
    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
    : "text-red-500 dark:text-red-400";
};

const onFixtureTap = (fixture: FootballFixtureResponse) => {
  emit("fixture-selected", fixture.uuid);
};

// Computed: subtitle showing current selection name
const selectedRoundName = computed(() => {
  const r = rounds.value.find((x) => x.uuid === selectedRoundUuid.value);
  return r?.name ?? "";
});

const subtitle = computed(() =>
  selectedRoundName.value
    ? `${t("football.rounds.rounds")} ${selectedRoundName.value}`
    : "",
);
</script>

<template>
  <BottomSheet
    :is-visible="isOpen"
    :title="$t('football.fixtures.rounds')"
    :subtitle="subtitle"
    icon="md-sportssoccer"
    size="xl"
    role="dialog"
    @close="emit('close')"
  >
    <!-- Round selector pinned under the header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
            <v-icon name="md-sportssoccer" class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ $t('football.fixtures.rounds') }}</h2>
            <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ subtitle }}</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all shrink-0"
          :aria-label="$t('common.actions.close')"
        >
          <v-icon name="hi-solid-x" class="w-4 h-4" />
        </button>
      </div>

      <!-- Round select -->
      <div class="mt-3">
        <div v-if="isLoadingRounds" class="flex items-center justify-center py-3">
          <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
        </div>

        <div v-else-if="roundsError" class="flex items-center justify-between gap-2 py-2">
          <p class="text-xs text-red-500 dark:text-red-400">{{ roundsError }}</p>
          <button
            @click="retryRounds"
            class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {{ $t('common.actions.retry') }}
          </button>
        </div>

        <SearchableSelectComponent
          v-else-if="rounds.length > 0"
          v-model="selectedRoundUuid"
          :options="rounds"
          value-key="uuid"
          label-key="name"
          :placeholder="$t('football.fixtures.selectRound')"
          :search-placeholder="$t('football.fixtures.searchRound')"
          :clearable="false"
          accent-color="emerald"
          :no-options-text="$t('football.rounds.noRounds')"
        >
          <template #selected="{ option }">
            <span class="text-footnote font-medium text-gray-900 dark:text-white truncate flex-1">
              {{ $t('football.rounds.rounds') }} {{ option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
            >
              {{ $t('football.rounds.current') }}
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-footnote font-medium truncate">{{ $t('football.rounds.rounds') }} {{ option.name }}</span>
              <span
                v-if="option.is_current"
                class="text-2xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase shrink-0"
              >
                {{ $t('football.rounds.current') }}
              </span>
              <span
                v-else-if="option.finished"
                class="text-2xs text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                {{ $t('football.rounds.done') }}
              </span>
            </div>
          </template>
        </SearchableSelectComponent>

        <div v-else class="text-center py-3 text-xs text-gray-400 dark:text-gray-500">
          {{ $t('football.rounds.noRounds') }}
        </div>
      </div>
    </template>

    <!-- Fixtures list (full-bleed inside the sheet's padded content) -->
    <div class="-mx-5 -my-3">
      <!-- Loading fixtures -->
      <div v-if="isLoadingFixtures" class="flex items-center justify-center py-12">
        <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
      </div>

      <!-- Fixtures error -->
      <div v-else-if="fixturesError" class="px-4 py-12 flex flex-col items-center text-center">
        <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
        <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ fixturesError }}</p>
        <button
          @click="retryFixtures"
          class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <!-- Empty fixtures -->
      <div
        v-else-if="fixtures.length === 0 && selectedRoundUuid"
        class="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
      >
        <v-icon name="md-sportssoccer" class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
        <p class="text-footnote">{{ $t('football.fixtures.noRoundMatches') }}</p>
      </div>

      <!-- Fixtures list -->
      <div v-else class="divide-y divide-gray-100 dark:divide-gray-700/50">
        <button
          v-for="(fixture, fIdx) in fixtures"
          :key="fixture.uuid || fixture.name + '-' + fIdx"
          type="button"
          @click="onFixtureTap(fixture)"
          :aria-label="$t('football.fixtures.openMatchAria', {
            home: getTeamName(getHomeParticipant(fixture)),
            away: getTeamName(getAwayParticipant(fixture)),
          })"
          class="fixture-cell relative block w-full text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
          :class="[
            isMatchLive(fixture)
              ? 'bg-red-50/40 dark:bg-red-900/5 border-l-[3px] border-l-red-500 dark:border-l-red-400'
              : 'border-l-[3px] border-l-transparent',
            'px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700/30',
          ]"
        >
          <!-- LIVE badge top -->
          <div v-if="isMatchLive(fixture)" class="flex items-center gap-1.5 mb-2">
            <span class="live-dot relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span class="text-2xs font-bold text-red-600 dark:text-red-400 tracking-widest uppercase">{{ $t('football.fixtures.live') }}</span>
          </div>

          <!-- Date/time (not live) -->
          <div v-else class="text-center mb-2">
            <span class="text-2xs font-medium text-gray-400 dark:text-gray-500 tracking-wide uppercase">
              {{ formatMatchDate(fixture.starting_at) }} · {{ formatMatchTime(fixture.starting_at) }}
            </span>
          </div>

          <!-- Match row -->
          <div class="flex items-center gap-2">
            <!-- Home -->
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo :team="getHomeParticipant(fixture)" size="md" />
              <span
                :class="getTeamResultClass(fixture, 'home')"
                class="text-footnote font-medium truncate"
                :title="getTeamName(getHomeParticipant(fixture))"
              >
                {{ getTeamName(getHomeParticipant(fixture)) }}
              </span>
            </div>

            <!-- Score center -->
            <div class="flex flex-col items-center shrink-0 min-w-[56px]">
              <div
                class="tabular-nums"
                :class="[
                  hasScores(fixture) ? 'font-bold text-gray-900 dark:text-white' : '',
                  isMatchLive(fixture) ? 'text-2xl' : 'text-xl',
                ]"
              >
                <template v-if="hasScores(fixture)">
                  {{ getHomeScore(fixture) }}<span :class="isMatchLive(fixture) ? 'text-red-300 dark:text-red-700 mx-0.5' : 'text-gray-300 dark:text-gray-600 mx-0.5'">-</span>{{ getAwayScore(fixture) }}
                </template>
                <span v-else class="text-2xs font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider">vs</span>
              </div>
              <span
                v-if="!isMatchLive(fixture)"
                :class="getFixtureStateClass(fixture)"
                class="text-2xs px-1.5 py-px rounded-full font-semibold mt-0.5 tracking-wide"
              >
                {{ getFixtureStateText(fixture) }}
              </span>
            </div>

            <!-- Away -->
            <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span
                :class="getTeamResultClass(fixture, 'away')"
                class="text-footnote font-medium truncate text-right"
                :title="getTeamName(getAwayParticipant(fixture))"
              >
                {{ getTeamName(getAwayParticipant(fixture)) }}
              </span>
              <TeamLogo :team="getAwayParticipant(fixture)" size="md" />
            </div>
          </div>
        </button>
      </div>
    </div>
  </BottomSheet>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.fixture-cell {
  -webkit-tap-highlight-color: transparent;
}

.live-dot {
  line-height: 0;
}
</style>
