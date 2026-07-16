<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import CurrentMatchupCard from "@/components/fantasy/matchups/CurrentMatchupCard.vue";
import EditFantasyTeamDrawer from "@/components/fantasy/team/EditFantasyTeamDrawer.vue";
import type { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";
import type { FantasyTeamData } from "@/interfaces/fantasy/team/FantasyUserTeamResponse";

interface Props {
  leagueUuid: string;
  roundUuid: string | null;
  roundName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  roundName: "Matchup",
});

// Matchup state
const matchup = ref<FantasyLeagueMatchupResponse | null>(null);
const isLoadingMatchup = ref(false);

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
  />

  <EditFantasyTeamDrawer
    :is-visible="drawerVisible"
    :league-uuid="leagueUuid"
    :team="selectedTeam"
    :can-edit="canEditSelected"
    @close="closeDrawer"
    @updated="onTeamUpdated"
  />
</template>
