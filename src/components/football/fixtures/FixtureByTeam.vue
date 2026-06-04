<script setup lang="ts">
import { computed } from "vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import FixturesList from "@/components/football/fixtures/FixturesList.vue";

const props = defineProps<{
  schedule: FootballRoundResponse[];
  isLoading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "fixture-selected": [fixture: FootballFixtureResponse];
  retry: [];
}>();

// Only rounds that actually contain matches for this team.
const roundsWithFixtures = computed(() =>
  props.schedule.filter((r) => (r.fixtures?.length ?? 0) > 0)
);
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex items-center justify-center py-12">
    <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
  </div>

  <!-- Error -->
  <div v-else-if="error" class="px-4 py-12 flex flex-col items-center text-center">
    <v-icon
      name="hi-solid-exclamation-circle"
      class="w-9 h-9 text-red-400 dark:text-red-500 mb-3"
    />
    <p class="text-[13px] text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
    <button
      @click="emit('retry')"
      class="px-4 py-2 text-[12px] font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
    >
      Retry
    </button>
  </div>

  <!-- Empty -->
  <div
    v-else-if="roundsWithFixtures.length === 0"
    class="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
  >
    <v-icon name="md-sportssoccer" class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
    <p class="text-[13px]">No matches for this team yet</p>
  </div>

  <!-- Schedule grouped by round -->
  <div v-else>
    <section v-for="round in roundsWithFixtures" :key="round.uuid">
      <!-- Round header -->
      <div
        class="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-700/50"
      >
        <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Round {{ round.name }}
        </span>
        <span
          v-if="round.is_current"
          class="text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase"
        >
          Current
        </span>
        <span
          v-else-if="round.finished"
          class="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider"
        >
          Done
        </span>
      </div>

      <!-- Reuse the standard fixture rows -->
      <FixturesList
        :fixtures="round.fixtures ?? []"
        :is-loading="false"
        :error="null"
        empty-icon="md-sportssoccer"
        empty-message=""
        @fixture-selected="emit('fixture-selected', $event)"
      />
    </section>
  </div>
</template>
