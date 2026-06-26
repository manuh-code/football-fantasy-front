<script setup lang="ts">
import { ref } from "vue";
import type { FootballFixtureLineupStatsResponse } from "@/interfaces/football/fixture/FootballFixtureLineupStatsResponse";
import FixtureLineupStatsAllDrawer from "./FixtureLineupStatsAllDrawer.vue";

interface Props {
  lineupStats: FootballFixtureLineupStatsResponse[] | null;
}

const props = defineProps<Props>();

const TOP_N = 3;
const FALLBACK_PLAYER = "/img/default-avatar.svg";

const drawerStat = ref<FootballFixtureLineupStatsResponse | null>(null);

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK_PLAYER;
  return path;
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK_PLAYER;
};

// Rank badge: 1 = gold, 2 = silver, 3 = bronze
const rankLabel = ["🥇", "🥈", "🥉"];
</script>

<template>
  <div class="px-4 pt-3 pb-6">
    <!-- Empty state -->
    <div
      v-if="!lineupStats || lineupStats.length === 0"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-star" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.matchCenter.noPlayerStats') }}</p>
    </div>

    <template v-else>
      <!-- Each stat type is its own card -->
      <div
        v-for="stat in lineupStats"
        :key="stat.type.uuid"
        class="mb-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
      >
        <!-- Card header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2">
            <v-icon name="hi-solid-star" class="w-3.5 h-3.5 text-amber-400" />
            <span class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
              {{ stat.type.name }}
            </span>
          </div>
          <button
            v-if="stat.top.length > TOP_N"
            @click="drawerStat = stat"
            class="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View all
          </button>
        </div>

        <!-- Top 3 rows -->
        <ul class="divide-y divide-gray-50 dark:divide-gray-800">
          <li
            v-for="(entry, index) in stat.top.slice(0, TOP_N)"
            :key="entry.player.uuid"
            class="flex items-center gap-3 px-4 py-3"
            :class="index === 0 ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''"
          >
            <!-- Medal -->
            <span class="w-6 shrink-0 text-center text-callout leading-none select-none">
              {{ rankLabel[index] }}
            </span>

            <!-- Player avatar -->
            <img
              :src="playerImg(entry.player.image_path)"
              :alt="entry.player.display_name"
              class="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-2"
              :class="index === 0
                ? 'ring-amber-300 dark:ring-amber-500/50'
                : 'ring-gray-100 dark:ring-gray-700'"
              @error="onImgError"
            />

            <!-- Name + team -->
            <div class="flex-1 min-w-0">
              <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug">
                {{ entry.player.display_name }}
              </p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <img
                  :src="entry.team.image_path ?? ''"
                  :alt="entry.team.short_code ?? entry.team.name"
                  class="w-3.5 h-3.5 object-contain shrink-0"
                  @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                />
                <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
                  {{ entry.team.short_code ?? entry.team.name }}
                </span>
              </div>
            </div>

            <!-- Value -->
            <span
              class="shrink-0 text-callout font-extrabold tabular-nums"
              :class="index === 0
                ? 'text-amber-500'
                : index === 1
                  ? 'text-gray-500 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-400'"
            >
              {{ formatValue(entry.data.value) }}
            </span>
          </li>
        </ul>
      </div>
    </template>

    <FixtureLineupStatsAllDrawer
      :stat="drawerStat"
      :is-open="drawerStat !== null"
      @close="drawerStat = null"
    />
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
