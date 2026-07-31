<script setup lang="ts">
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type { FootballPlayerStatisticByStageResponse } from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { formatPlayerStatValue } from "@/utils/playerStatistics";

const props = defineProps<{
  statistic: FootballPlayerStatisticByStageResponse | null;
  isOpen: boolean;
}>();
const emit = defineEmits<{ close: [] }>();

const FALLBACK = "/img/default-avatar.svg";

const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK;
  return path;
};
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};

const rankColor = (index: number): string => {
  if (index === 0) return "text-amber-500";
  if (index === 1) return "text-gray-400 dark:text-gray-400";
  if (index === 2) return "text-amber-700 dark:text-amber-600";
  return "text-gray-300 dark:text-gray-600";
};
</script>

<template>
  <BottomSheet
    :is-visible="isOpen && !!props.statistic"
    :title="props.statistic?.statistics[0]?.type.name"
    size="xl"
    role="dialog"
    @close="emit('close')"
  >
    <ul v-if="props.statistic" class="space-y-1.5">
      <li
        v-for="(detail, index) in props.statistic.statistics"
        :key="detail.player.uuid"
        class="flex items-center gap-3 rounded-xl px-3 py-2"
        :class="index === 0
          ? 'bg-amber-50 dark:bg-amber-900/10'
          : 'bg-gray-50 dark:bg-gray-800/40'"
      >
        <!-- Rank -->
        <span
          class="w-6 shrink-0 text-center text-xs font-extrabold tabular-nums"
          :class="rankColor(index)"
        >{{ index + 1 }}</span>

        <!-- Avatar -->
        <img
          :src="playerImg(detail.player.image_path)"
          :alt="detail.player.display_name"
          class="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700"
          @error="onImgError"
        />

        <!-- Name -->
        <div class="flex-1 min-w-0">
          <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug">
            {{ detail.player.display_name }}
          </p>
          <span
            v-if="detail.player.position?.name"
            class="text-2xs text-gray-400 dark:text-gray-500"
          >
            {{ detail.player.position.name }}
          </span>
        </div>

        <!-- Value -->
        <span
          class="shrink-0 text-callout font-extrabold tabular-nums"
          :class="index === 0
            ? 'text-amber-500'
            : 'text-emerald-600 dark:text-emerald-400'"
        >
          {{ formatPlayerStatValue(detail.value) }}
        </span>
      </li>
    </ul>
  </BottomSheet>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
