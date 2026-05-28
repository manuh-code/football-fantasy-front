<script setup lang="ts">
import { computed } from "vue";

interface Props {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPercentage: false,
});

const homePercent = computed(() => {
  if (props.isPercentage) return Math.max(0, Math.min(100, props.homeValue));
  const total = props.homeValue + props.awayValue;
  if (total === 0) return 50;
  return (props.homeValue / total) * 100;
});

const awayPercent = computed(() => {
  if (props.isPercentage) return Math.max(0, Math.min(100, props.awayValue));
  const total = props.homeValue + props.awayValue;
  if (total === 0) return 50;
  return (props.awayValue / total) * 100;
});

const homeLeads = computed(() => props.homeValue > props.awayValue);
const awayLeads = computed(() => props.awayValue > props.homeValue);

const displayHome = computed(() =>
  props.isPercentage ? `${Math.round(props.homeValue)}%` : props.homeValue
);
const displayAway = computed(() =>
  props.isPercentage ? `${Math.round(props.awayValue)}%` : props.awayValue
);
</script>

<template>
  <div class="py-2">
    <!-- Label + values row -->
    <div class="flex items-center justify-between mb-1.5">
      <span
        class="text-[13px] font-bold tabular-nums w-10 text-left"
        :class="homeLeads ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'"
      >
        {{ displayHome }}
      </span>
      <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {{ label }}
      </span>
      <span
        class="text-[13px] font-bold tabular-nums w-10 text-right"
        :class="awayLeads ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'"
      >
        {{ displayAway }}
      </span>
    </div>

    <!-- Two-sided bar (meets at center) -->
    <div class="flex items-center h-1.5 gap-0.5">
      <!-- Home (right-anchored) -->
      <div class="flex-1 flex justify-end overflow-hidden">
        <div
          class="h-full rounded-l-full transition-all duration-700 ease-out"
          :class="homeLeads
            ? 'bg-emerald-500 dark:bg-emerald-400'
            : 'bg-gray-300 dark:bg-gray-600'"
          :style="{ width: `${homePercent}%` }"
        />
      </div>
      <!-- Away (left-anchored) -->
      <div class="flex-1 flex justify-start overflow-hidden">
        <div
          class="h-full rounded-r-full transition-all duration-700 ease-out"
          :class="awayLeads
            ? 'bg-emerald-500 dark:bg-emerald-400'
            : 'bg-gray-300 dark:bg-gray-600'"
          :style="{ width: `${awayPercent}%` }"
        />
      </div>
    </div>
  </div>
</template>
