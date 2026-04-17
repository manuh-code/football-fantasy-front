<script setup lang="ts">
import type { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";
import StartersTable from "@/components/fantasy/lineup/StartersTable.vue";
import BenchTable from "@/components/fantasy/lineup/BenchTable.vue";

interface Props {
  players: FantasyFootballPlayersResponse[];
  formation: FantasyLeagueFormationResponse | null;
  leagueUuid: string;
  highlightedPlayerUuid?: string | null;
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
  isLoading: false,
});

const emit = defineEmits<{
  (e: "draftByPosition", position: string): void;
  (e: "playerRemoved"): void;
}>();
</script>

<template>
  <!-- Skeleton Loading -->
  <div v-if="isLoading && players.length === 0" class="space-y-3">
    <!-- Starters skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-3.5 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3">
          <div class="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-2.5 w-16 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
          </div>
          <div class="h-4 w-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Bench skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-3.5 w-14 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 py-3">
          <div class="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-2.5 w-16 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
          </div>
          <div class="h-4 w-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>

  <!-- Team Display -->
  <div v-else>
    <StartersTable
      :players="players"
      :formation="formation"
      :league-uuid="leagueUuid"
      :highlighted-player-uuid="highlightedPlayerUuid"
      class="mb-3"
      @draft-by-position="emit('draftByPosition', $event)"
      @player-removed="emit('playerRemoved')"
    />

    <BenchTable
      :players="players"
      :formation="formation"
      :league-uuid="leagueUuid"
      :highlighted-player-uuid="highlightedPlayerUuid"
      @draft-by-position="emit('draftByPosition', $event)"
      @player-removed="emit('playerRemoved')"
    />
  </div>
</template>
