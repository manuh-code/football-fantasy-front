<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { footballTeamService } from "@/services/football/team/FootballTeamService";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import FixturesFilters from "@/components/football/fixtures/FixturesFilters.vue";
import FixturesList from "@/components/football/fixtures/FixturesList.vue";
import FixtureByTeam from "@/components/football/fixtures/FixtureByTeam.vue";
import FixtureMatchCenter from "@/components/football/fixtures/FixtureMatchCenter.vue";

interface Props {
  stageUuid: string;
  seasonUuid?: string;
}

const props = defineProps<Props>();

type Mode = "regular" | "playoffs";
const mode = ref<Mode>("regular");

// ── Regular season state ──
const rounds = ref<FootballRoundResponse[]>([]);
const isLoadingRounds = ref(false);
const roundsError = ref<string | null>(null);
const selectedRoundUuid = ref<string | null>(null);
const roundsCache = new Map<string, FootballRoundResponse[]>();

// ── Playoffs state ──
const knockoutStages = ref<FootballStageResponse[]>([]);
const isLoadingStages = ref(false);
const stagesError = ref<string | null>(null);
const selectedKnockoutUuid = ref<string | null>(null);

// ── Shared fixtures state ──
const fixtures = ref<FootballFixtureResponse[]>([]);
const isLoadingFixtures = ref(false);
const fixturesError = ref<string | null>(null);

// ── Team focus state ──
// Selecting a team switches the panel to that team's full schedule; while a
// team is focused the round/playoffs browsing is hidden (see FixturesFilters).
const teams = ref<FootballTeamResponse[]>([]);
const isLoadingTeams = ref(false);
const teamsError = ref<string | null>(null);
const selectedTeamUuid = ref<string | null>(null);
const teamsCache = new Map<string, FootballTeamResponse[]>();

const teamSchedule = ref<FootballRoundResponse[]>([]);
const isLoadingSchedule = ref(false);
const scheduleError = ref<string | null>(null);

// Empty string (from the "All teams" option) and null both mean "no team".
const teamMode = computed(() => !!selectedTeamUuid.value);

const loadTeams = async (seasonUuid: string) => {
  if (!seasonUuid) return;
  if (teamsCache.has(seasonUuid)) {
    teams.value = teamsCache.get(seasonUuid)!;
    return;
  }
  isLoadingTeams.value = true;
  teamsError.value = null;
  teams.value = [];
  try {
    const result = await catalogService.getTeamsBySeason(seasonUuid);
    teams.value = result;
    teamsCache.set(seasonUuid, result);
  } catch (err) {
    console.error("Error loading teams:", err);
    teamsError.value = "Couldn't load teams.";
  } finally {
    isLoadingTeams.value = false;
  }
};

const retryTeams = () => {
  if (props.seasonUuid) {
    teamsCache.delete(props.seasonUuid);
    loadTeams(props.seasonUuid);
  }
};

const loadTeamSchedule = async (teamUuid: string, stageUuid: string) => {
  isLoadingSchedule.value = true;
  scheduleError.value = null;
  teamSchedule.value = [];
  try {
    teamSchedule.value = await footballTeamService.getScheduleByTeamAndStage(
      teamUuid,
      stageUuid,
    );
  } catch (err) {
    console.error("Error loading team schedule:", err);
    scheduleError.value = "Couldn't load this team's schedule.";
  } finally {
    isLoadingSchedule.value = false;
  }
};

const retryTeamSchedule = () => {
  if (selectedTeamUuid.value && props.stageUuid) {
    loadTeamSchedule(selectedTeamUuid.value, props.stageUuid);
  }
};

// ── Regular season loading ──
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
    roundsError.value = "Couldn't load rounds.";
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
    : rounds.value[rounds.value.length - 1].uuid;
};

const loadRoundFixtures = async (stageUuid: string, roundUuid: string) => {
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
    fixturesError.value = "Couldn't load fixtures for this round.";
  } finally {
    isLoadingFixtures.value = false;
  }
};

const retryRounds = () => {
  if (props.stageUuid) {
    roundsCache.delete(props.stageUuid);
    loadRounds(props.stageUuid);
  }
};

// ── Playoffs loading ──
const loadKnockoutStages = async (parentStageUuid: string) => {
  if (!parentStageUuid) return;
  isLoadingStages.value = true;
  stagesError.value = null;
  knockoutStages.value = [];
  selectedKnockoutUuid.value = null;
  try {
    const result = await catalogService.getKnockoutStageByStage(parentStageUuid);
    knockoutStages.value = result;
    if (result.length > 0) {
      const current = result.find((s) => s.is_current === true);
      selectedKnockoutUuid.value = current ? current.uuid : result[0].uuid;
    }
  } catch (err) {
    console.error("Error loading knockout stages:", err);
    stagesError.value = "Couldn't load playoff stages.";
  } finally {
    isLoadingStages.value = false;
  }
};

const loadKnockoutFixtures = async (knockoutUuid: string) => {
  isLoadingFixtures.value = true;
  fixturesError.value = null;
  fixtures.value = [];
  try {
    fixtures.value = await footballFixtureService.getAllFixturesByStage(knockoutUuid);
  } catch (err) {
    console.error("Error loading knockout fixtures:", err);
    fixturesError.value = "Couldn't load fixtures for this stage.";
  } finally {
    isLoadingFixtures.value = false;
  }
};

const retryFixtures = () => {
  if (mode.value === "regular") {
    if (props.stageUuid && selectedRoundUuid.value) {
      loadRoundFixtures(props.stageUuid, selectedRoundUuid.value);
    }
  } else if (selectedKnockoutUuid.value) {
    loadKnockoutFixtures(selectedKnockoutUuid.value);
  }
};

// ── Reactions ──
// Mode change → load the right fixtures (lazy-load playoff stages on first open)
watch(mode, (m) => {
  fixtures.value = [];
  fixturesError.value = null;
  if (m === "regular") {
    if (props.stageUuid && selectedRoundUuid.value) {
      loadRoundFixtures(props.stageUuid, selectedRoundUuid.value);
    }
  } else if (knockoutStages.value.length === 0) {
    loadKnockoutStages(props.stageUuid);
  } else if (selectedKnockoutUuid.value) {
    loadKnockoutFixtures(selectedKnockoutUuid.value);
  }
});

// Selected round → fetch fixtures (regular mode only)
watch(selectedRoundUuid, (uuid) => {
  if (mode.value === "regular" && uuid && props.stageUuid) {
    loadRoundFixtures(props.stageUuid, uuid);
  }
});

// Selected knockout stage → fetch fixtures (playoffs mode only)
watch(selectedKnockoutUuid, (uuid) => {
  if (mode.value === "playoffs" && uuid) {
    loadKnockoutFixtures(uuid);
  }
});

// Selected team → load its schedule (or return to round browsing when cleared)
watch(selectedTeamUuid, (uuid) => {
  if (uuid && props.stageUuid) {
    loadTeamSchedule(uuid, props.stageUuid);
  } else {
    teamSchedule.value = [];
    scheduleError.value = null;
  }
});

// Parent stage changes → reset everything back to Regular Season
watch(
  () => props.stageUuid,
  (stageUuid) => {
    mode.value = "regular";
    selectedRoundUuid.value = null;
    knockoutStages.value = [];
    selectedKnockoutUuid.value = null;
    stagesError.value = null;
    fixtures.value = [];
    fixturesError.value = null;
    // Drop any team focus so we land back on the league's round view.
    selectedTeamUuid.value = null;
    teamSchedule.value = [];
    scheduleError.value = null;
    if (stageUuid) loadRounds(stageUuid);
  },
);

// Season changes → reload the team list for the new season
watch(
  () => props.seasonUuid,
  (seasonUuid) => {
    selectedTeamUuid.value = null;
    if (seasonUuid) loadTeams(seasonUuid);
  },
);

onMounted(() => {
  if (props.stageUuid) loadRounds(props.stageUuid);
  if (props.seasonUuid) loadTeams(props.seasonUuid);
});

// ── Derived list state ──
const listLoading = computed(
  () => isLoadingFixtures.value || (mode.value === "playoffs" && isLoadingStages.value),
);

const emptyIcon = computed(() =>
  mode.value === "playoffs" && knockoutStages.value.length === 0
    ? "bi-trophy"
    : "md-sportssoccer",
);

const emptyMessage = computed(() => {
  if (mode.value === "playoffs") {
    return knockoutStages.value.length === 0
      ? "No playoffs available yet"
      : "No matches in this stage";
  }
  return "No matches in this round";
});

// ── Match Center (self-contained) ──
const matchCenterOpen = ref(false);
const selectedFixtureUuid = ref<string | null>(null);

const onFixtureSelected = (fixture: FootballFixtureResponse) => {
  selectedFixtureUuid.value = fixture.uuid;
  matchCenterOpen.value = true;
};
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Filters: team focus + mode toggle + round/knockout selector -->
    <FixturesFilters
      v-model:mode="mode"
      v-model:round-uuid="selectedRoundUuid"
      v-model:knockout-uuid="selectedKnockoutUuid"
      v-model:team-uuid="selectedTeamUuid"
      :rounds="rounds"
      :is-loading-rounds="isLoadingRounds"
      :rounds-error="roundsError"
      :knockout-stages="knockoutStages"
      :is-loading-stages="isLoadingStages"
      :stages-error="stagesError"
      :teams="teams"
      :is-loading-teams="isLoadingTeams"
      :teams-error="teamsError"
      @retry-rounds="retryRounds"
      @retry-stages="loadKnockoutStages(props.stageUuid)"
      @retry-teams="retryTeams"
    />

    <!-- Team focused → that team's full schedule -->
    <FixtureByTeam
      v-if="teamMode"
      :schedule="teamSchedule"
      :is-loading="isLoadingSchedule"
      :error="scheduleError"
      @fixture-selected="onFixtureSelected"
      @retry="retryTeamSchedule"
    />

    <!-- Otherwise → league fixtures for the selected round/stage -->
    <FixturesList
      v-else
      :fixtures="fixtures"
      :is-loading="listLoading"
      :error="fixturesError"
      :empty-icon="emptyIcon"
      :empty-message="emptyMessage"
      @fixture-selected="onFixtureSelected"
      @retry="retryFixtures"
    />

    <!-- Match Center opens on fixture tap (teleports to body) -->
    <FixtureMatchCenter
      :is-open="matchCenterOpen"
      :fixture-uuid="selectedFixtureUuid"
      @close="matchCenterOpen = false"
    />
  </div>
</template>
