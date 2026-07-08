<script setup lang="ts">
import { computed } from "vue";
import { FootballNextFixtureResponse } from "@/interfaces/football/fixture/FootballNextFixtureResponse";

interface Props {
  fixture: FootballNextFixtureResponse | null | undefined;
}

const props = defineProps<Props>();

const homeParticipant = computed(() =>
  props.fixture?.participants?.find(p => p.meta?.location === "home") ?? null,
);

const awayParticipant = computed(() =>
  props.fixture?.participants?.find(p => p.meta?.location === "away") ?? null,
);

const homeScore = computed(() =>
  props.fixture?.scores?.find(s => s.score.participant === "home") ?? null,
);

const awayScore = computed(() =>
  props.fixture?.scores?.find(s => s.score.participant === "away") ?? null,
);

const hasScore = computed(() => homeScore.value != null && awayScore.value != null);
</script>

<template>
  <div
    v-if="fixture"
    class="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/40 rounded-md"
  >
    <template v-if="homeParticipant && awayParticipant">
      <img
        :src="homeParticipant.image_path"
        :alt="homeParticipant.short_code"
        class="w-3.5 h-3.5 rounded-full object-contain"
      />
      <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 leading-none">
        {{ homeParticipant.short_code }}
      </span>
      <template v-if="hasScore">
        <span class="text-2xs font-bold text-gray-800 dark:text-gray-100 leading-none">
          {{ homeScore!.score.goals }}
        </span>
        <span class="text-2xs text-gray-400 dark:text-gray-500 leading-none">-</span>
        <span class="text-2xs font-bold text-gray-800 dark:text-gray-100 leading-none">
          {{ awayScore!.score.goals }}
        </span>
      </template>
      <span v-else class="text-2xs text-gray-400 dark:text-gray-500 leading-none">vs</span>
      <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 leading-none">
        {{ awayParticipant.short_code }}
      </span>
      <img
        :src="awayParticipant.image_path"
        :alt="awayParticipant.short_code"
        class="w-3.5 h-3.5 rounded-full object-contain"
      />
      <span class="text-2xs text-gray-400 dark:text-gray-500 leading-none mx-0.5">·</span>
    </template>
    
  </div>
</template>
