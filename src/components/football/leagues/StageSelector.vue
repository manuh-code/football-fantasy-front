<template>
  <div class="flex flex-col">
    <!-- League identity -->
    <div class="flex items-center gap-3 px-4 pb-3">
      <img
        :src="leagueImage || '/img/default-avatar.svg'"
        :alt="leagueName"
        class="w-9 h-9 rounded-lg object-cover shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 shrink-0"
      />
      <div class="min-w-0">
        <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
          {{ leagueName }}
        </p>
        <p class="text-2xs text-gray-400 dark:text-gray-500">{{ $t('football.stage.choose') }}</p>
      </div>
    </div>

    <!-- Search (only when there are many stages) -->
    <div v-if="stages.length > 6" class="px-4 pb-2">
      <div class="relative">
        <v-icon
          name="hi-solid-search"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
        />
        <input
          v-model="query"
          type="text"
          :placeholder="$t('football.stage.searchPlaceholder')"
          class="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-footnote text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-4 py-10 flex justify-center">
      <span class="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-emerald-500 animate-spin" />
    </div>

    <!-- Stage list -->
    <div v-else class="px-2 pb-1 max-h-[50dvh] overflow-y-auto overscroll-contain">
      <button
        v-for="stage in filteredStages"
        :key="stage.uuid"
        type="button"
        @click="select(stage)"
        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors"
        :class="stage.uuid === selectedStageUuid
          ? 'bg-emerald-50 dark:bg-emerald-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800'"
      >
        <div class="min-w-0 flex-1">
          <p
            class="text-footnote font-medium truncate"
            :class="stage.uuid === selectedStageUuid
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-900 dark:text-white'"
          >
            {{ (stage.name_complete as string | null) || stage.name }}
          </p>
        </div>
        <span
          v-if="stage.is_current"
          class="text-2xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full shrink-0"
        >
          Current
        </span>
        <v-icon
          v-if="stage.uuid === selectedStageUuid"
          name="hi-solid-check"
          class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0"
        />
      </button>

      <p
        v-if="filteredStages.length === 0"
        class="px-3 py-6 text-center text-xs text-gray-400 dark:text-gray-500"
      >
        No stages found.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";

interface Props {
  stages: FootballStageResponse[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{ select: [stage: FootballStageResponse] }>();

// Selected stage uuid is shared with the parent (HomeHeaderMenu).
const selectedStageUuid = defineModel<string>("stageUuid", { default: "" });

const store = useFootballLeagueStore();
const leagueName = computed(() => store.getLeague?.name ?? "League");
const leagueImage = computed(() => store.getLeague?.image_path ?? "");

const query = ref("");

const filteredStages = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.stages;
  return props.stages.filter((s) => {
    const label = ((s.name_complete as string | null) || s.name || "").toLowerCase();
    return label.includes(q);
  });
});

const select = (stage: FootballStageResponse) => {
  selectedStageUuid.value = stage.uuid;
  emit("select", stage);
};
</script>
