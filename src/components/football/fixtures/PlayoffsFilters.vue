<script setup lang="ts">
import { computed } from "vue";
import KnockoutRoundCarousel from "@/components/ui/KnockoutRoundCarousel.vue";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";

// Playoffs sub-filter: knockout-stage carousel + a shortcut into the full
// bracket overlay. Split out of FixturesFilters so the Regular Season / Playoffs
// tab only ever mounts the controls it actually needs, keeping the filter area
// uncluttered. The gold/amber accent is the playoffs' semantic identity (trophy),
// kept consistent with KnockoutRoundCarousel and the bracket's champion styling.
const props = defineProps<{
  knockoutStages: FootballStageResponse[];
  isLoadingStages: boolean;
  stagesError: string | null;
}>();

const emit = defineEmits<{
  "retry-stages": [];
  "open-bracket": [];
}>();

const knockoutUuid = defineModel<string | null>("knockoutUuid", { default: null });

// Bridge the uuid-based selection with the index-based carousel v-model.
const selectedKnockoutIndex = computed<number>({
  get: () => {
    const idx = props.knockoutStages.findIndex((s) => s.uuid === knockoutUuid.value);
    return idx === -1 ? 0 : idx;
  },
  set: (index: number) => {
    const stage = props.knockoutStages[index];
    if (stage) knockoutUuid.value = stage.uuid;
  },
});
</script>

<template>
  <div v-if="isLoadingStages" class="flex items-center justify-center py-2">
    <v-icon name="pr-spinner" class="w-4 h-4 text-gray-300 dark:text-gray-600" animation="spin" />
  </div>

  <div v-else-if="stagesError" class="flex items-center justify-between gap-2 py-1">
    <p class="text-xs text-red-500 dark:text-red-400">{{ stagesError }}</p>
    <button
      @click="emit('retry-stages')"
      class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
    >
      {{ $t('common.actions.retry') }}
    </button>
  </div>

  <template v-else-if="knockoutStages.length > 0">
    <KnockoutRoundCarousel :stages="knockoutStages" v-model="selectedKnockoutIndex" />

    <!-- Open the full knockout tree (bracket overlay) -->
    <button
      type="button"
      @click="emit('open-bracket')"
      class="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200/70 dark:ring-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/15 active:scale-[0.99] transition-all"
    >
      <v-icon name="hi-solid-view-grid" class="w-4 h-4 shrink-0" />
      <span>{{ $t('football.fixtures.bracketOpen') }}</span>
    </button>
  </template>

  <div v-else class="text-center py-2 text-xs text-gray-400 dark:text-gray-500">
    {{ $t('football.fixtures.noPlayoffs') }}
  </div>
</template>
