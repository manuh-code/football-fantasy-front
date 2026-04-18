<script setup lang="ts">
import { computed } from "vue";
import { FootballNextFixtureResponse } from "@/interfaces/football/fixture/FootballNextFixtureResponse";

interface Props {
  fixture: FootballNextFixtureResponse | null | undefined;
}

const props = defineProps<Props>();

const homeScore = computed(() => {
  return props.fixture?.scores?.find(s => s.score.participant === "home") ?? null;
});

const awayScore = computed(() => {
  return props.fixture?.scores?.find(s => s.score.participant === "away") ?? null;
});

const hasScore = computed(() => homeScore.value != null && awayScore.value != null);

function formatFixtureDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  if (diffMs > 0 && diffDays <= 0) return `Today ${time}`;
  if (diffDays === 1) return `Tomorrow ${time}`;
  if (diffDays > 1 && diffDays <= 6) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[date.getDay()]} ${time}`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()} ${time}`;
}
</script>

<template>
  <div
    v-if="fixture"
    class="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-700/40 rounded-md"
  >
    <template v-if="fixture.participants?.length >= 2">
      <img
        :src="fixture.participants[0].image_path"
        :alt="fixture.participants[0].short_code"
        class="w-3.5 h-3.5 rounded-full object-contain"
      />
      <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-none">
        {{ fixture.participants[0].short_code }}
      </span>
      <template v-if="hasScore">
        <span class="text-[10px] font-bold text-gray-800 dark:text-gray-100 leading-none">
          {{ homeScore!.score.goals }}
        </span>
        <span class="text-[9px] text-gray-400 dark:text-gray-500 leading-none">-</span>
        <span class="text-[10px] font-bold text-gray-800 dark:text-gray-100 leading-none">
          {{ awayScore!.score.goals }}
        </span>
      </template>
      <span v-else class="text-[9px] text-gray-400 dark:text-gray-500 leading-none">vs</span>
      <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200 leading-none">
        {{ fixture.participants[1].short_code }}
      </span>
      <img
        :src="fixture.participants[1].image_path"
        :alt="fixture.participants[1].short_code"
        class="w-3.5 h-3.5 rounded-full object-contain"
      />
      <span class="text-[9px] text-gray-400 dark:text-gray-500 leading-none mx-0.5">·</span>
    </template>
    <span class="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums leading-none">
      {{ fixture.starting_at}}
    </span>
  </div>
</template>
