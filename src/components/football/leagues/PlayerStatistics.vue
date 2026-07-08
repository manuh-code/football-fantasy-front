<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type { FootballPlayerStatisticByStageResponse } from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { formatPlayerStatValue, formatStatLabel } from "@/utils/playerStatistics";
import PlayerStatisticsAllDrawer from "./PlayerStatisticsAllDrawer.vue";

// Player stats are fetched by stage, so a stage switch reloads the panel.
const props = defineProps<{ stageUuid: string }>();

const TOP_N = 3;
const FALLBACK = "/img/default-avatar.svg";

const data = ref<FootballPlayerStatisticByStageResponse[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const drawerStat = ref<FootballPlayerStatisticByStageResponse | null>(null);

// Bars grow from 0 to their share the first frame after data lands, so each
// card reads like a race filling toward the leader's mark.
const revealed = ref(false);

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
  revealed.value = false;
  try {
    const res = await footballPlayerService.getPlayerStatisticByStage(props.stageUuid);
    data.value = res.data;
    // Let the bars mount at 0, then release them on the next frame.
    await nextTick();
    requestAnimationFrame(() => (revealed.value = true));
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

// Numeric value behind the display string, for the proportion bars.
const statNum = (value: string | null | undefined): number => {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
};

// Share of the leader's value (0–100). The leader defines the finish line.
const share = (value: number, leader: number): number => {
  if (leader <= 0) return 0;
  return Math.max(0, Math.min(100, (value / leader) * 100));
};

const retry = () => load();
</script>

<template>
  <div class="py-4">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <section v-for="g in 2" :key="g">
        <div class="h-2.5 w-28 rounded-full bg-gray-200 dark:bg-gray-700 mb-3.5" />
        <div
          v-for="c in 2"
          :key="c"
          class="mb-3 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div class="px-4 pt-3.5 pb-2.5">
            <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-800/70">
            <div v-for="r in 3" :key="r" class="flex items-center gap-3 px-4 py-3">
              <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
              <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
              <div class="w-8 h-5 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
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
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="groups.length === 0"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-chart-bar" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.statistics.noPlayerStats') }}</p>
    </div>

    <!-- Stat groups -->
    <template v-else>
      <section v-for="group in groups" :key="group.stat_group" class="mb-6 last:mb-0">
        <!-- Group eyebrow: the section's identity leads, a hairline trails it -->
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xs font-bold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 shrink-0">
            {{ formatStatLabel(group.stat_group) }}
          </span>
          <span class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <!-- One card per stat type -->
        <div
          v-for="entry in group.entries"
          :key="entry.type"
          class="mb-3 last:mb-0 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-50 dark:border-gray-800/70">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-1 h-3.5 rounded-full bg-emerald-500/80 shrink-0" aria-hidden="true" />
              <span class="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 truncate">
                {{ statLabel(entry) }}
              </span>
            </div>
            <button
              v-if="entry.statistics.length > TOP_N"
              @click="drawerStat = entry"
              class="shrink-0 inline-flex items-center gap-0.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-1.5 transition-all"
            >
              {{ $t('football.statistics.viewAll') }}
              <v-icon name="hi-solid-chevron-right" class="w-3 h-3" />
            </button>
          </div>

          <!-- Top 3 players — leader then chasers -->
          <ul>
            <li
              v-for="(detail, index) in entry.statistics.slice(0, TOP_N)"
              :key="detail.player.uuid"
              class="flex items-center gap-3 px-4 py-3"
              :class="index === 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'border-t border-gray-50 dark:border-gray-800/70'"
            >
              <!-- Rank slot: trophy for the leader, muted numeral for chasers -->
              <span class="w-7 flex justify-center shrink-0">
                <span
                  v-if="index === 0"
                  class="w-7 h-7 grid place-items-center rounded-full bg-amber-400 text-amber-950 shadow-sm shadow-amber-500/30"
                >
                  <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5" />
                </span>
                <span
                  v-else
                  class="w-6 h-6 grid place-items-center rounded-full bg-gray-100 dark:bg-gray-700/70 text-2xs font-extrabold tabular-nums text-gray-500 dark:text-gray-300 select-none"
                >
                  {{ index + 1 }}
                </span>
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

              <!-- Name + position + proportion bar -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug"
                  :title="detail.player.display_name"
                >
                  {{ detail.player.display_name }}
                </p>
                <span
                  v-if="detail.player.position?.name"
                  class="text-2xs text-gray-400 dark:text-gray-500"
                >
                  {{ detail.player.position.name }}
                </span>
                <!-- Race track: this player's share of the leader's total -->
                <div class="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
                  <div
                    class="stat-bar h-full rounded-full"
                    :class="index === 0 ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-500'"
                    :style="{ width: (revealed ? share(statNum(detail.value), statNum(entry.statistics[0]?.value)) : 0) + '%' }"
                  />
                </div>
              </div>

              <!-- Value -->
              <span
                class="shrink-0 min-w-[2.5rem] text-right tabular-nums font-extrabold"
                :class="index === 0
                  ? 'text-xl text-amber-500'
                  : 'text-base text-gray-500 dark:text-gray-300'"
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

/* Bars ease from 0 to their share when a stage's data lands. */
.stat-bar {
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .stat-bar {
    transition: none;
  }
}
</style>
