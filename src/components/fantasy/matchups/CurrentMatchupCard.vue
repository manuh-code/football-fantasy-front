<template>
  <!-- Skeleton Loading -->
  <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5">
    <div class="flex items-center justify-center gap-3">
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      <div class="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div class="h-6 w-6 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
      <div class="h-4 w-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>

  <!-- Matchup Card -->
  <div
    v-else-if="matchup"
    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    
    <!-- Matchup Body -->
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Home Team -->
        <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden">
            <img
              v-if="matchup.home.team.image_path"
              :src="matchup.home.team.image_path"
              :alt="matchup.home.team.team_name"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = '/img/default-avatar.svg'"
            />
            <div v-else-if="matchup.home.team.svg" v-html="matchup.home.team.svg" class="w-10 h-10" />
            <v-icon v-else name="hi-solid-user-group" class="w-6 h-6 text-gray-300 dark:text-gray-500" />
          </div>
          <p class="text-[11px] font-semibold text-gray-700 dark:text-gray-300 text-center truncate w-full px-1">
            {{ matchup.home.team.team_name }}
          </p>
        </div>

        <!-- Score -->
        <div class="flex items-center gap-2 px-2 shrink-0">
          <span
            class="text-[22px] font-black tabular-nums"
            :class="matchup.winner === matchup.home.team.uuid
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'"
          >
            {{ matchup.home.score }}
          </span>
          <span class="text-[11px] font-medium text-gray-300 dark:text-gray-600 uppercase">vs</span>
          <span
            class="text-[22px] font-black tabular-nums"
            :class="matchup.winner === matchup.away.team.uuid
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 dark:text-gray-500'"
          >
            {{ matchup.away.score }}
          </span>
        </div>

        <!-- Away Team -->
        <div class="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <div class="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden">
            <img
              v-if="matchup.away.team.image_path"
              :src="matchup.away.team.image_path"
              :alt="matchup.away.team.team_name"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = '/img/default-avatar.svg'"
            />
            <div v-else-if="matchup.away.team.svg" v-html="matchup.away.team.svg" class="w-10 h-10" />
            <v-icon v-else name="hi-solid-user-group" class="w-6 h-6 text-gray-300 dark:text-gray-500" />
          </div>
          <p class="text-[11px] font-semibold text-gray-700 dark:text-gray-300 text-center truncate w-full px-1">
            {{ matchup.away.team.team_name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FantasyLeagueMatchupResponse } from "@/interfaces/fantasy/matchups/FantasyLeagueMatchupResponse";

interface Props {
  matchup: FantasyLeagueMatchupResponse | null;
  roundName?: string;
  isLoading?: boolean;
}

withDefaults(defineProps<Props>(), {
  roundName: "Matchup",
  isLoading: false,
});
</script>
