<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type {
  FootballPlayerStatisticByStageResponse,
  PlayerStatisticOption,
} from "@/interfaces/football/player/FootballPlayerStatisticByStageResponse";
import { formatPlayerStatValue } from "@/utils/playerStatistics";
import PlayerStatisticsAllDrawer from "./PlayerStatisticsAllDrawer.vue";
import PlayerStatisticsFilterSheet from "./PlayerStatisticsFilterSheet.vue";

/**
 * Player rankings for a stage, one card per statistic.
 *
 * Which statistics appear is the user's call: a stage reports dozens and this
 * asks the API which of them it actually has data for, so the rail never offers
 * a metric that would render an empty card. Cards carry a podium only — the
 * full ranking is hundreds of rows and is fetched by the drawer on demand.
 */
const props = defineProps<{ stageUuid: string }>();

const { t } = useI18n();

const PODIUM = 3;
const FALLBACK = "/img/default-avatar.svg";
const MAX_PER_PRESET = 12;

/** The opening set: the stats people come to a league panel to look up. */
const FEATURED = [
  "GOALS",
  "ASSISTS",
  "RATING",
  "SHOTS_ON_TARGET",
  "KEY_PASSES",
  "SAVES",
  "INTERCEPTIONS",
  "TACKLES_WON",
  "YELLOWCARDS",
];

type Preset = "featured" | "offensive" | "overall" | "defensive" | "custom";

const PRESETS: { id: Preset; group?: string }[] = [
  { id: "featured" },
  { id: "offensive", group: "offensive" },
  { id: "overall", group: "overall" },
  { id: "defensive", group: "defensive" },
];

const available = ref<PlayerStatisticOption[]>([]);
const data = ref<FootballPlayerStatisticByStageResponse[]>([]);
const selectedKeys = ref<string[]>([]);
const activePreset = ref<Preset>("featured");

const isLoading = ref(false);
const isRefreshing = ref(false);
const error = ref(false);
const isFilterOpen = ref(false);
const drawerStat = ref<FootballPlayerStatisticByStageResponse | null>(null);

// Bars mount at zero and release once, so a stat's spread reads as a race
// filling toward the leader rather than appearing already settled.
const revealed = ref(false);

/** Presets the stage can actually satisfy — an empty group is not offered. */
const presets = computed(() =>
  PRESETS.filter(
    (preset) => preset.group === undefined || keysForGroup(preset.group).length > 0,
  ),
);

const groups = computed(() => {
  const map = new Map<string, FootballPlayerStatisticByStageResponse[]>();
  for (const entry of data.value) {
    const list = map.get(entry.stat_group) ?? [];
    list.push(entry);
    map.set(entry.stat_group, list);
  }
  return Array.from(map, ([label, entries]) => ({ label, entries }));
});

function keysForGroup(group: string): string[] {
  return available.value
    .filter((option) => option.stat_group_key === group)
    .map((option) => option.key);
}

function keysForPreset(preset: Preset): string[] {
  if (preset === "featured") {
    const offered = new Set(available.value.map((option) => option.key));
    const featured = FEATURED.filter((key) => offered.has(key));
    // A stage missing most of the headline stats still deserves a full panel.
    return featured.length > 0
      ? featured
      : available.value.slice(0, MAX_PER_PRESET).map((option) => option.key);
  }

  const group = PRESETS.find((entry) => entry.id === preset)?.group;
  return group ? keysForGroup(group).slice(0, MAX_PER_PRESET) : [];
}

async function loadAvailable(): Promise<void> {
  const response = await footballPlayerService.getAvailablePlayerStatistics(props.stageUuid);
  available.value = response.data;
}

async function loadRankings(): Promise<void> {
  if (selectedKeys.value.length === 0) {
    data.value = [];
    return;
  }

  const response = await footballPlayerService.getPlayerStatisticByStage(
    props.stageUuid,
    selectedKeys.value.join(","),
    PODIUM,
  );

  // Empty rankings would render as cards with nothing under the header.
  data.value = response.data.filter((entry) => entry.statistics.length > 0);
}

async function load(): Promise<void> {
  if (!props.stageUuid) {
    data.value = [];
    available.value = [];
    return;
  }

  isLoading.value = true;
  error.value = false;
  revealed.value = false;

  try {
    await loadAvailable();
    activePreset.value = "featured";
    selectedKeys.value = keysForPreset("featured");
    await loadRankings();
    release();
  } catch {
    error.value = true;
    data.value = [];
  } finally {
    isLoading.value = false;
  }
}

/** Re-ranks without blanking the panel: the rail stays put, the cards restate. */
async function refresh(): Promise<void> {
  isRefreshing.value = true;
  error.value = false;
  revealed.value = false;

  try {
    await loadRankings();
    release();
  } catch {
    error.value = true;
    data.value = [];
  } finally {
    isRefreshing.value = false;
  }
}

function release(): void {
  requestAnimationFrame(() => {
    revealed.value = true;
  });
}

function selectPreset(preset: Preset): void {
  if (activePreset.value === preset) return;
  activePreset.value = preset;
  selectedKeys.value = keysForPreset(preset);
  refresh();
}

function applyCustom(keys: string[]): void {
  isFilterOpen.value = false;
  activePreset.value = "custom";
  selectedKeys.value = keys;
  refresh();
}

onMounted(load);

watch(
  () => props.stageUuid,
  (next, previous) => {
    if (next && next !== previous) load();
  },
);

// ── Presentation helpers ──
const playerImg = (path: string | null | undefined): string =>
  !path || path.includes("placeholder") ? FALLBACK : path;

const onImgError = (event: Event): void => {
  (event.target as HTMLImageElement).src = FALLBACK;
};

const statNum = (value: string | null | undefined): number => {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Share of the leader's mark; the leader defines the finish line at 100%. */
const share = (value: number, leader: number): number =>
  leader <= 0 ? 0 : Math.max(0, Math.min(100, (value / leader) * 100));

const barWidth = (
  entry: FootballPlayerStatisticByStageResponse,
  value: string,
): string =>
  revealed.value
    ? `${share(statNum(value), statNum(entry.statistics[0]?.value))}%`
    : "0%";

const presetLabel = (preset: Preset): string => t(`football.statistics.presets.${preset}`);
</script>

<template>
  <div class="py-4">
    <!-- Filter rail: presets to browse by, the sheet to pick exactly -->
    <div
      v-if="!isLoading && !error && available.length > 0"
      class="flex items-center gap-2 mb-4"
    >
      <!-- A filter group, not a tablist: these buttons swap what the one list
           below contains, they do not switch between panels. -->
      <div
        class="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto rail"
        role="group"
        :aria-label="$t('football.statistics.presets.aria')"
      >
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          :aria-pressed="activePreset === preset.id"
          class="shrink-0 h-9 px-3.5 rounded-full text-2xs font-bold uppercase tracking-[0.08em] border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          :class="activePreset === preset.id
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          @click="selectPreset(preset.id)"
        >
          {{ presetLabel(preset.id) }}
        </button>

        <!-- Only present once the user has made a selection of their own -->
        <span
          v-if="activePreset === 'custom'"
          class="shrink-0 h-9 px-3.5 inline-flex items-center rounded-full text-2xs font-bold uppercase tracking-[0.08em] bg-emerald-500 text-white"
        >
          {{ presetLabel('custom') }}
        </span>
      </div>

      <button
        type="button"
        class="shrink-0 relative w-11 h-11 grid place-items-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        :aria-label="$t('football.statistics.filter.open')"
        @click="isFilterOpen = true"
      >
        <v-icon name="hi-solid-adjustments" class="w-5 h-5" aria-hidden="true" />
        <span
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-emerald-500 text-white text-[10px] font-bold tabular-nums"
        >
          {{ selectedKeys.length }}
        </span>
      </button>
    </div>

    <!-- Loading skeleton, shaped like the cards it replaces -->
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

    <div v-else-if="error" class="py-12 flex flex-col items-center text-center">
      <v-icon
        name="hi-solid-exclamation-circle"
        class="w-9 h-9 text-red-400 dark:text-red-500 mb-3"
        aria-hidden="true"
      />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-3">
        {{ $t('football.statistics.loadError') }}
      </p>
      <button
        type="button"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
        @click="load"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <div v-else-if="groups.length === 0" class="py-12 flex flex-col items-center text-center">
      <v-icon
        name="hi-solid-chart-bar"
        class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2"
        aria-hidden="true"
      />
      <p class="text-footnote text-gray-400 dark:text-gray-500">
        {{ $t('football.statistics.noPlayerStats') }}
      </p>
    </div>

    <div v-else :aria-busy="isRefreshing" :class="isRefreshing ? 'opacity-50' : ''" class="transition-opacity duration-200">
      <section v-for="group in groups" :key="group.label" class="mb-6 last:mb-0">
        <!-- Group eyebrow: the section's identity leads, a hairline trails it -->
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xs font-bold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 shrink-0">
            {{ group.label }}
          </span>
          <span class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <div
          v-for="entry in group.entries"
          :key="entry.key"
          class="mb-3 last:mb-0 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
          <div class="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-gray-50 dark:border-gray-800/70">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-1 h-3.5 rounded-full bg-emerald-500/80 shrink-0" aria-hidden="true" />
              <span class="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 truncate">
                {{ entry.type }}
              </span>
            </div>
            <button
              v-if="entry.total > entry.statistics.length"
              type="button"
              class="shrink-0 inline-flex items-center gap-0.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded cursor-pointer"
              @click="drawerStat = entry"
            >
              {{ $t('football.statistics.viewAllCount', { count: entry.total }) }}
              <v-icon name="hi-solid-chevron-right" class="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

          <ul>
            <li
              v-for="(detail, index) in entry.statistics"
              :key="detail.player.uuid"
              class="flex items-center gap-3 px-4 py-3"
              :class="index === 0
                ? 'bg-amber-50/50 dark:bg-amber-900/10'
                : 'border-t border-gray-50 dark:border-gray-800/70'"
            >
              <!-- Rank slot: trophy for the leader, muted numeral for chasers -->
              <span class="w-7 flex justify-center shrink-0">
                <span
                  v-if="index === 0"
                  class="w-7 h-7 grid place-items-center rounded-full bg-amber-400 text-amber-950 shadow-sm shadow-amber-500/30"
                >
                  <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span
                  v-else
                  class="w-6 h-6 grid place-items-center rounded-full bg-gray-100 dark:bg-gray-700/70 text-2xs font-extrabold tabular-nums text-gray-500 dark:text-gray-300 select-none"
                >
                  {{ index + 1 }}
                </span>
              </span>

              <img
                :src="playerImg(detail.player.image_path)"
                :alt="detail.player.display_name"
                loading="lazy"
                class="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-2"
                :class="index === 0
                  ? 'ring-amber-300 dark:ring-amber-500/50'
                  : 'ring-gray-100 dark:ring-gray-700'"
                @error="onImgError"
              />

              <div class="flex-1 min-w-0">
                <p
                  class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug"
                  :title="detail.player.display_name"
                >
                  {{ detail.player.display_name }}
                </p>
                <span v-if="detail.player.position" class="text-2xs text-gray-400 dark:text-gray-500">
                  {{ detail.player.position }}
                </span>
                <!-- Race track: this player's share of the leader's total -->
                <div class="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
                  <div
                    class="stat-bar h-full rounded-full"
                    :class="index === 0 ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-500'"
                    :style="{ width: barWidth(entry, detail.value) }"
                  />
                </div>
              </div>

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
    </div>

    <PlayerStatisticsFilterSheet
      :is-open="isFilterOpen"
      :options="available"
      :selected="selectedKeys"
      @close="isFilterOpen = false"
      @apply="applyCustom"
    />

    <PlayerStatisticsAllDrawer
      :statistic="drawerStat"
      :stage-uuid="stageUuid"
      :is-open="drawerStat !== null"
      @close="drawerStat = null"
    />
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* The rail scrolls sideways; its scrollbar would be chrome, not information. */
.rail {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.rail::-webkit-scrollbar {
  display: none;
}

.stat-bar {
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .stat-bar {
    transition: none;
  }

  .animate-pulse {
    animation: none;
  }
}
</style>
