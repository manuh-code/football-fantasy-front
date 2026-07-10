<script setup lang="ts">
import type { TeamValue } from "@/interfaces/football/team/FootballTeamTopStatisticResponse";
import {
  teamStatDetailLabel,
  formatStatDetailValue,
  formatStatPercentage,
  teamStatPlayerLabel,
  teamStatPlayerInfo,
} from "@/utils/teamStatistics";

// Generic breakdown for one team's standardized stat value: a flat table for
// `details` rows and chips for the players referenced by the stat.
defineProps<{ value: TeamValue }>();

const FALLBACK = "/img/default-avatar.svg";

const playerImg = (path: string | null): string => path || FALLBACK;
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};
</script>

<template>
  <div class="space-y-2.5">
    <!-- Details table -->
    <dl v-if="value.details.length" class="space-y-1">
      <div
        v-for="detail in value.details"
        :key="detail.key"
        class="flex items-baseline justify-between gap-3"
      >
        <dt class="text-2xs text-gray-400 dark:text-gray-500 truncate">
          {{ teamStatDetailLabel(detail.key) }}
        </dt>
        <dd class="shrink-0 text-2xs tabular-nums font-semibold text-gray-700 dark:text-gray-200">
          {{ formatStatDetailValue(detail) }}
          <span
            v-if="detail.percentage !== null"
            class="ml-1 font-normal text-gray-400 dark:text-gray-500"
          >
            ({{ formatStatPercentage(detail.percentage) }})
          </span>
        </dd>
      </div>
    </dl>

    <!-- Referenced players -->
    <ul v-if="value.players.length" class="flex flex-wrap gap-1.5">
      <li
        v-for="(row, index) in value.players"
        :key="`${row.key}-${row.player.sm_id}-${index}`"
        class="flex items-center gap-2 rounded-full border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/60 pl-1 pr-3 py-1"
      >
        <img
          :src="playerImg(row.player.image_path)"
          :alt="row.player.display_name || ''"
          class="w-6 h-6 rounded-full object-cover shrink-0 bg-gray-200 dark:bg-gray-700"
          @error="onImgError"
        />
        <div class="leading-tight min-w-0">
          <p class="text-2xs font-semibold text-gray-800 dark:text-gray-100 truncate">
            {{ row.player.display_name || "—" }}
          </p>
          <p class="text-2xs text-gray-400 dark:text-gray-500 truncate">
            {{ teamStatPlayerLabel(row.key) }}<template v-if="teamStatPlayerInfo(row)"> · {{ teamStatPlayerInfo(row) }}</template>
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
