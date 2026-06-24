<script setup lang="ts">
import type { FootballFixtureManOfTheMatchResponse } from "@/interfaces/football/fixture/FootballFixtureManOfTheMatchResponse";

interface Props {
  manOfTheMatch: FootballFixtureManOfTheMatchResponse;
}

defineProps<Props>();

const FALLBACK = "/img/default-avatar.svg";

const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK;
  return path;
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};
</script>

<template>
  <div class="mx-4 mt-3 mb-3 flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
    <!-- Avatar -->
    <img
      :src="playerImg(manOfTheMatch.player?.image_path)"
      :alt="manOfTheMatch.player?.display_name"
      class="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-100 dark:ring-gray-700"
      @error="onImgError"
    />

    <!-- Player info -->
    <div class="flex-1 min-w-0">
      <p class="flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
        <v-icon name="hi-solid-star" class="w-3 h-3 text-amber-400" />
        Man of the Match
      </p>
      <p class="text-footnote font-bold text-gray-900 dark:text-white truncate leading-tight">
        {{ manOfTheMatch.player?.display_name }}
      </p>
      <div class="flex items-center gap-1.5 mt-0.5 min-w-0">
        <img
          :src="manOfTheMatch.team?.image_path ?? ''"
          :alt="manOfTheMatch.team?.short_code ?? manOfTheMatch.team?.name"
          class="w-3.5 h-3.5 object-contain shrink-0"
          @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
        />
        <span class="text-2xs text-gray-500 dark:text-gray-400 truncate">
          {{ manOfTheMatch.team?.name }}
          <template v-if="manOfTheMatch.player?.position?.name">
            · {{ manOfTheMatch.player.position.name }}
          </template>
        </span>
      </div>
    </div>

    <!-- Rating -->
    <div class="shrink-0 text-right">
      <p class="text-xl font-extrabold tabular-nums leading-none text-gray-900 dark:text-white">
        {{ manOfTheMatch.rating?.toFixed(1) ?? "–" }}
      </p>
      <p class="text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">
        Rating
      </p>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
