<script setup lang="ts">
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type { FootballFixtureLineupStatsResponse } from "@/interfaces/football/fixture/FootballFixtureLineupStatsResponse";

interface Props {
  stat: FootballFixtureLineupStatsResponse | null;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const FALLBACK_PLAYER = "/img/default-avatar.svg";

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK_PLAYER;
  return path;
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK_PLAYER;
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
    :is-visible="isOpen && !!props.stat"
    :title="props.stat?.type.name"
    size="xl"
    role="dialog"
    :z-index="135"
    @close="emit('close')"
  >
    <ul v-if="props.stat" class="space-y-1.5">
      <li
        v-for="(entry, index) in props.stat.top"
        :key="entry.player.uuid"
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
          :src="playerImg(entry.player.image_path)"
          :alt="entry.player.display_name"
          class="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700"
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
              class="w-3.5 h-3.5 object-contain"
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
            : 'text-emerald-600 dark:text-emerald-400'"
        >
          {{ formatValue(entry.data.value) }}
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
