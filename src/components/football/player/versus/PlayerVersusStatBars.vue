<script setup lang="ts">
import type { ComparisonGroup } from "@/utils/playerVersus";
import { formatStatValue } from "@/utils/playerVersus";

defineProps<{
  comparison: ComparisonGroup[];
  /** Hex colors for the two bars. */
  colorA: string;
  colorB: string;
}>();

// Bar fill relative to the larger of the two values (winner side hits 100%).
const pct = (value: number | null, other: number | null): number => {
  const a = value ?? 0;
  const max = Math.max(a, other ?? 0);
  return max > 0 ? (a / max) * 100 : 0;
};

const groupLabel = (group: string): string =>
  group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const winsA = (a: number | null, b: number | null): boolean =>
  a != null && b != null && a > b;
const winsB = (a: number | null, b: number | null): boolean =>
  a != null && b != null && b > a;
</script>

<template>
  <div class="space-y-5">
    <section v-for="grp in comparison" :key="grp.group">
      <!-- Group header -->
      <div class="flex items-center gap-2 mb-2.5">
        <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        <span class="text-2xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
          {{ groupLabel(grp.group) }}
        </span>
        <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      </div>

      <!-- Stat rows -->
      <div class="space-y-3">
        <div v-for="stat in grp.stats" :key="stat.key">
          <!-- Label -->
          <p class="text-center text-2xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {{ stat.label }}
          </p>
          <!-- Values + mirrored bars -->
          <div class="flex items-center gap-2">
            <span
              class="w-9 text-right text-xs font-bold tabular-nums"
              :class="winsA(stat.a, stat.b)
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'"
            >
              {{ formatStatValue(stat.a) }}
            </span>

            <div class="flex-1 flex items-center gap-1">
              <!-- A grows from center toward the left -->
              <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex justify-end">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ width: `${pct(stat.a, stat.b)}%`, backgroundColor: colorA }"
                />
              </div>
              <!-- B grows from center toward the right -->
              <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ width: `${pct(stat.b, stat.a)}%`, backgroundColor: colorB }"
                />
              </div>
            </div>

            <span
              class="w-9 text-left text-xs font-bold tabular-nums"
              :class="winsB(stat.a, stat.b)
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'"
            >
              {{ formatStatValue(stat.b) }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
