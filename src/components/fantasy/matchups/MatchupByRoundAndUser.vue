<script setup lang="ts">
import { ref, watch } from "vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import CurrentMatchupCard from "@/components/fantasy/matchups/CurrentMatchupCard.vue";
import type { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";

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

// Reload matchup when round changes (immediate for initial load)
watch(() => props.roundUuid, (newUuid) => {
  if (newUuid) {
    loadMatchupByRound();
  }
}, { immediate: true });
</script>

<template>
  <CurrentMatchupCard
    :matchup="matchup"
    :round-name="roundName"
    :is-loading="isLoadingMatchup"
  />
</template>
