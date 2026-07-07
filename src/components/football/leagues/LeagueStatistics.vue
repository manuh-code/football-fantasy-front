<script setup lang="ts">
import { ref } from "vue";
import MatchdayBoard from "@/components/football/ui/MatchdayBoard.vue";
import TeamStatistics from "./TeamStatistics.vue";
import PlayerStatistics from "./PlayerStatistics.vue";

// Stage/season context. The season is forwarded to the team stats so they
// reload whenever the active stage (and therefore its season) changes.
defineProps<{ stageUuid: string; seasonUuid: string }>();

type StatsView = "teams" | "players";
const view = ref<StatsView>("teams");
</script>

<template>
  <MatchdayBoard
    :eyebrow="$t('home.league.tabs.statistics')"
    icon="hi-solid-chart-bar"
  >
    <!-- View toggle: Teams / Players -->
    <div class="px-4 pt-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
      <div
        class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
        role="tablist"
        :aria-label="$t('football.statistics.viewAria')"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'teams'"
          @click="view = 'teams'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200"
          :class="view === 'teams'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-600 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="ri-team-line" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ $t('football.statistics.teams') }}</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'players'"
          @click="view = 'players'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200"
          :class="view === 'players'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-600 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="hi-solid-users" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ $t('football.statistics.players') }}</span>
        </button>
      </div>
    </div>

    <!-- Teams statistics -->
    <TeamStatistics v-if="view === 'teams'" :season-uuid="seasonUuid" />

    <!-- Players statistics -->
    <PlayerStatistics v-else :stage-uuid="stageUuid" />
  </MatchdayBoard>
</template>
