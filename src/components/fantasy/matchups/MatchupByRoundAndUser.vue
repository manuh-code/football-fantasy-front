<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { getUserService } from "@/services/user/UserService";
import CurrentMatchupCard from "@/components/fantasy/matchups/CurrentMatchupCard.vue";
import EditFantasyTeamDrawer from "@/components/fantasy/team/EditFantasyTeamDrawer.vue";
import MatchupVersusTable from "@/components/fantasy/matchups/MatchupVersusTable.vue";
import { BottomSheet } from "@/components/ui";
import type { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";
import type { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";
import type { FantasyFootballPlayerVersusResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayerVersusResponse";

interface Props {
  leagueUuid: string;
  roundUuid: string | null;
  roundName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  roundName: "Matchup",
});

const { t } = useI18n();

// Matchup state
const matchup = ref<FantasyLeagueMatchupResponse | null>(null);
const isLoadingMatchup = ref(false);

// Lineups drawer state
const lineupsDrawerVisible = ref(false);
const versusData = ref<FantasyFootballPlayerVersusResponse | null>(null);
const isLoadingVersus = ref(false);
const versusError = ref<string | null>(null);

// Current user's own team — used to enable editing on their side of the matchup.
const myTeamUuid = ref<string | null>(null);

// Edit-team drawer state
const drawerVisible = ref(false);
const selectedTeam = ref<FantasyTeamData | null>(null);
const canEditSelected = computed(
  () => !!selectedTeam.value && selectedTeam.value.uuid === myTeamUuid.value,
);

async function loadMyTeam() {
  if (!props.leagueUuid) return;
  try {
    const team = await fantasyLeagueService.getTeamSilent(props.leagueUuid);
    myTeamUuid.value = team?.uuid ?? null;
  } catch {
    // 404 (no team) or fetch error — no editable side; the drawer stays read-only.
    myTeamUuid.value = null;
  }
}

async function loadMatchupByRound() {
  if (!props.leagueUuid || !props.roundUuid) return;

  isLoadingMatchup.value = true;
  try {
    matchup.value = await fantasyLeagueService.getMatchupByRoundAndUser(
      props.leagueUuid,
      props.roundUuid,
    );
  } catch {
    matchup.value = null;
  } finally {
    isLoadingMatchup.value = false;
  }
}

async function openLineups() {
  if (!props.leagueUuid || !props.roundUuid || !matchup.value) return;

  lineupsDrawerVisible.value = true;
  versusData.value = null;
  versusError.value = null;
  isLoadingVersus.value = true;
  try {
    const response = await getUserService().getLineupsVersusByRoundAndMatchup(
      props.leagueUuid,
      props.roundUuid,
      matchup.value.uuid,
    );
    versusData.value = response.data;
  } catch (err: unknown) {
    versusError.value =
      err instanceof Error ? err.message : t("fantasy.matchups.lineupsError");
  } finally {
    isLoadingVersus.value = false;
  }
}

function closeLineupsDrawer() {
  lineupsDrawerVisible.value = false;
}

function onTeamSelect(team: FantasyTeamData) {
  selectedTeam.value = team;
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
}

function onTeamUpdated(updated: FantasyTeamData) {
  // Keep the edit affordance on the right side and refresh the card crest/name.
  myTeamUuid.value = updated.uuid;
  loadMatchupByRound();
}

// Resolve the user's own team whenever the league changes.
watch(() => props.leagueUuid, loadMyTeam, { immediate: true });

// Reload matchup when round changes (immediate for initial load)
watch(
  () => props.roundUuid,
  (newUuid) => {
    if (newUuid) {
      loadMatchupByRound();
    }
  },
  { immediate: true },
);
</script>

<template>
  <CurrentMatchupCard
    :matchup="matchup"
    :round-name="roundName"
    :is-loading="isLoadingMatchup"
    :editable-team-uuid="myTeamUuid"
    @team-select="onTeamSelect"
    @view-lineups="openLineups"
  />

  <EditFantasyTeamDrawer
    :is-visible="drawerVisible"
    :league-uuid="leagueUuid"
    :team="selectedTeam"
    :can-edit="canEditSelected"
    @close="closeDrawer"
    @updated="onTeamUpdated"
  />

  <!-- Lineups drawer — position-by-position duel for this matchup -->
  <BottomSheet :is-visible="lineupsDrawerVisible" size="xl" @close="closeLineupsDrawer">
    <MatchupVersusTable
      v-if="matchup"
      :matchup="matchup"
      :versus-data="versusData"
      :is-loading="isLoadingVersus"
      :error="versusError"
      @close="closeLineupsDrawer"
    />
  </BottomSheet>
</template>
