<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type { FootballPlayerStatisticByStageResponse } from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { formatPlayerStatValue, formatStatLabel } from "@/utils/playerStatistics";
import PlayerStatisticsAllDrawer from "./PlayerStatisticsAllDrawer.vue";

// Player stats are fetched by stage, so a stage switch reloads the panel.
const props = defineProps<{ stageUuid: string }>();

const TOP_N = 3;
const FALLBACK = "/img/default-avatar.svg";
const rankLabel = ["🥇", "🥈", "🥉"];

const data = ref<FootballPlayerStatisticByStageResponse[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const drawerStat = ref<FootballPlayerStatisticByStageResponse | null>(null);

// Each API entry is a single stat type carrying its own `stat_group`; collapse
// them into sections so all stats of the same group render together.
const groups = computed(() => {
  const map = new Map<string, FootballPlayerStatisticByStageResponse[]>();
  for (const entry of data.value) {
    const list = map.get(entry.stat_group) ?? [];
    list.push(entry);
    map.set(entry.stat_group, list);
  }
  return Array.from(map, ([stat_group, entries]) => ({ stat_group, entries }));
});

const load = async () => {
  if (!props.stageUuid) {
    data.value = [];
    return;
  }
  isLoading.value = true;
  error.value = null;
  data.value = [];
  try {
    const res = await footballPlayerService.getPlayerStatisticByStage(props.stageUuid);
    data.value = res.data;
  } catch (err) {
    console.error("Error loading player statistics:", err);
    error.value = "Couldn't load player statistics.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(load);

// Reload whenever the active stage changes.
watch(
  () => props.stageUuid,
  (next, prev) => {
    if (next && next !== prev) load();
  },
);

// ── Helpers ──
const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK;
  return path;
};
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};

// Display name for a stat entry — prefer the per-stat type name ("Goals"),
// fall back to a humanized developer_name ("GOALS" → "Goals").
const statLabel = (entry: FootballPlayerStatisticByStageResponse): string =>
  entry.statistics[0]?.type.name || formatStatLabel(entry.type);

const retry = () => load();
</script>

<template>
  <div class="px-4 py-4">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-5 animate-pulse">
      <section v-for="g in 2" :key="g">
        <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
        <div
          v-for="c in 2"
          :key="c"
          class="mb-3 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
            <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-800">
            <div v-for="r in 3" :key="r" class="flex items-center gap-3 px-4 py-3">
              <div class="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 shrink-0" />
              <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div class="h-3 flex-1 max-w-[45%] rounded-full bg-gray-200 dark:bg-gray-700" />
              <div class="flex-1" />
              <div class="w-8 h-4 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-12 flex flex-col items-center text-center">
      <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
      <button
        @click="retry"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="groups.length === 0"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-chart-bar" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">No player statistics available yet</p>
    </div>

    <!-- Stat groups -->
    <template v-else>
      <section v-for="group in groups" :key="group.stat_group" class="mb-5 last:mb-0">
        <!-- Group header -->
        <div class="flex items-center gap-2 mb-2.5">
          <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span class="text-2xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {{ formatStatLabel(group.stat_group) }}
          </span>
          <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <!-- One card per stat type -->
        <div
          v-for="entry in group.entries"
          :key="entry.type"
          class="mb-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
        >
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2 min-w-0">
              <v-icon name="hi-solid-chart-bar" class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 truncate">
                {{ statLabel(entry) }}
              </span>
            </div>
            <button
              v-if="entry.statistics.length > TOP_N"
              @click="drawerStat = entry"
              class="shrink-0 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all
            </button>
          </div>

          <!-- Top 3 players -->
          <ul class="divide-y divide-gray-50 dark:divide-gray-800">
            <li
              v-for="(detail, index) in entry.statistics.slice(0, TOP_N)"
              :key="detail.player.uuid"
              class="flex items-center gap-3 px-4 py-3"
              :class="index === 0 ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''"
            >
              <!-- Medal -->
              <span class="w-6 shrink-0 text-center text-base leading-none select-none">
                {{ rankLabel[index] }}
              </span>

              <!-- Avatar -->
              <img
                :src="playerImg(detail.player.image_path)"
                :alt="detail.player.display_name"
                class="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-2"
                :class="index === 0
                  ? 'ring-amber-300 dark:ring-amber-500/50'
                  : 'ring-gray-100 dark:ring-gray-700'"
                @error="onImgError"
              />

              <!-- Name + position -->
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
                class="shrink-0 text-base font-extrabold tabular-nums"
                :class="index === 0
                  ? 'text-amber-500'
                  : index === 1
                    ? 'text-gray-500 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-400'"
              >
                {{ formatPlayerStatValue(detail.value) }}
              </span>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <!-- All-players drawer -->
    <PlayerStatisticsAllDrawer
      :statistic="drawerStat"
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
