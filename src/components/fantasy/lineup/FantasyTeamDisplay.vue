<script setup lang="ts">
import { computed } from "vue";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";
import StartersTable from "@/components/fantasy/lineup/StartersTable.vue";
import BenchTable from "@/components/fantasy/lineup/BenchTable.vue";
import FantasyTeamDisplaySkeleton from "@/components/fantasy/lineup/FantasyTeamDisplaySkeleton.vue";

interface Props {
  players: FantasyFootballPlayer[];
  formation: FantasyLeagueFormationResponse | null;
  leagueUuid: string;
  highlightedPlayerUuid?: string | null;
  isLoading?: boolean;
  fantasyRoundUuid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
  isLoading: false,
  fantasyRoundUuid: '',
});

// The round's top score across the whole team — each row colors its points pill
// relative to this, so standouts (emerald) and quiet games (slate) read at a
// glance instead of every pill being the same amber. Adapts to any scoring
// system since it's relative, not fixed thresholds.
const referenceScore = computed(() => {
  let max = 0;
  for (const p of props.players) {
    const pts = Number(p.fantasy_points ?? 0);
    if (pts > max) max = pts;
  }
  return max;
});

const emit = defineEmits<{
  (e: "draftByPosition", position: string): void;
  (e: "playerRemoved"): void;
  (e: "lineupUpdated"): void;
}>();
</script>

<template>
  <!-- Skeleton Loading — shown on any load so stale rows (and their delete
       buttons) never flash while switching rounds. -->
  <FantasyTeamDisplaySkeleton v-if="isLoading" />

  <!-- Team Display -->
  <div v-else class="space-y-6">
    <StartersTable
      :players="players"
      :formation="formation"
      :league-uuid="leagueUuid"
      :highlighted-player-uuid="highlightedPlayerUuid"
      :fantasy-round-uuid="fantasyRoundUuid"
      :reference-score="referenceScore"
      @draft-by-position="emit('draftByPosition', $event)"
      @player-removed="emit('playerRemoved')"
      @lineup-updated="emit('lineupUpdated')"
    />

    <BenchTable
      :players="players"
      :formation="formation"
      :league-uuid="leagueUuid"
      :highlighted-player-uuid="highlightedPlayerUuid"
      :fantasy-round-uuid="fantasyRoundUuid"
      :reference-score="referenceScore"
      @draft-by-position="emit('draftByPosition', $event)"
      @player-removed="emit('playerRemoved')"
      @lineup-updated="emit('lineupUpdated')"
    />
  </div>
</template>
