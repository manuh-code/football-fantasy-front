<script setup lang="ts">
import { ref } from "vue";
import TeamStatistics from "./TeamStatistics.vue";

// Stage/season context. The season is forwarded to the team stats so they
// reload whenever the active stage (and therefore its season) changes.
defineProps<{ stageUuid: string; seasonUuid: string }>();

type StatsView = "teams" | "players";
const view = ref<StatsView>("teams");
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- View toggle: Teams / Players -->
    <div class="px-4 pt-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
      <div
        class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
        role="tablist"
        aria-label="Statistics view"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'teams'"
          @click="view = 'teams'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
          :class="view === 'teams'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="ri-team-line" class="w-3.5 h-3.5 shrink-0" />
          <span>Teams</span>
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="view === 'players'"
          @click="view = 'players'"
          class="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
          :class="view === 'players'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          <v-icon name="hi-solid-users" class="w-3.5 h-3.5 shrink-0" />
          <span>Players</span>
        </button>
      </div>
    </div>

    <!-- Teams statistics -->
    <TeamStatistics v-if="view === 'teams'" :season-uuid="seasonUuid" />

    <!-- Players statistics (coming soon) -->
    <div v-else class="flex flex-col items-center text-center px-6 py-14">
      <div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center mb-4">
        <v-icon name="hi-solid-users" class="w-7 h-7 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 class="text-[15px] font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Coming soon
      </h3>
      <p class="text-[13px] text-gray-400 dark:text-gray-500 max-w-xs">
        Player statistics will be available here shortly.
      </p>
    </div>
  </div>
</template>
