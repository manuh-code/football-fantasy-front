<script setup lang="ts">
import { ref, nextTick } from "vue";
import TeamStatistics from "./TeamStatistics.vue";
import PlayerStatistics from "./PlayerStatistics.vue";

// Stage/season context. The season is forwarded to the team stats so they
// reload whenever the active stage (and therefore its season) changes.
defineProps<{ stageUuid: string; seasonUuid: string }>();

type StatsView = "teams" | "players";
const view = ref<StatsView>("teams");

// Full ARIA tabs pattern: roving tabindex + arrow/Home/End keys move focus
// between tabs, so the segmented control is operable by keyboard, not just tap.
const teamsTab = ref<HTMLButtonElement | null>(null);
const playersTab = ref<HTMLButtonElement | null>(null);

const selectTab = (next: StatsView) => {
  view.value = next;
  nextTick(() => {
    (next === "teams" ? teamsTab.value : playersTab.value)?.focus();
  });
};

const onTablistKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
      e.preventDefault();
      selectTab(view.value === "teams" ? "players" : "teams");
      break;
    case "ArrowLeft":
    case "ArrowUp":
      e.preventDefault();
      selectTab(view.value === "teams" ? "players" : "teams");
      break;
    case "Home":
      e.preventDefault();
      selectTab("teams");
      break;
    case "End":
      e.preventDefault();
      selectTab("players");
      break;
  }
};
</script>

<template>
  <div class="w-full space-y-3">
    <!-- View toggle: Teams / Players (bare segmented control) -->
    <div
      class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
      role="tablist"
      :aria-label="$t('football.statistics.viewAria')"
      @keydown="onTablistKeydown"
    >
      <button
        ref="teamsTab"
        id="stats-tab-teams"
        type="button"
        role="tab"
        aria-controls="stats-panel-teams"
        :aria-selected="view === 'teams'"
        :tabindex="view === 'teams' ? 0 : -1"
        @click="view = 'teams'"
        class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        :class="view === 'teams'
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-600 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        <v-icon name="ri-team-line" class="w-3.5 h-3.5 shrink-0" />
        <span>{{ $t('football.statistics.teams') }}</span>
      </button>
      <button
        ref="playersTab"
        id="stats-tab-players"
        type="button"
        role="tab"
        aria-controls="stats-panel-players"
        :aria-selected="view === 'players'"
        :tabindex="view === 'players' ? 0 : -1"
        @click="view = 'players'"
        class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        :class="view === 'players'
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-600 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
      >
        <v-icon name="hi-solid-users" class="w-3.5 h-3.5 shrink-0" />
        <span>{{ $t('football.statistics.players') }}</span>
      </button>
    </div>

    <!-- Teams statistics -->
    <div
      v-if="view === 'teams'"
      id="stats-panel-teams"
      role="tabpanel"
      aria-labelledby="stats-tab-teams"
    >
      <TeamStatistics :season-uuid="seasonUuid" />
    </div>

    <!-- Players statistics -->
    <div
      v-else
      id="stats-panel-players"
      role="tabpanel"
      aria-labelledby="stats-tab-players"
    >
      <PlayerStatistics :stage-uuid="stageUuid" />
    </div>
  </div>
</template>
