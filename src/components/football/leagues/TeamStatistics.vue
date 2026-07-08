<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { footballTeamService } from "@/services/football/team/FootballTeamService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import type {
  FootballTeamTopStatisticResponse,
  Statistic,
} from "@/interfaces/football/team/FootballTeamTopStatisticResponse";
import { extractTeamStatValue, formatTeamStatValue } from "@/utils/teamStatistics";
import TeamStatisticsAllDrawer from "./TeamStatisticsAllDrawer.vue";

// Season is driven by the active stage (forwarded from LeagueStatistics). When
// it's missing we fall back to the league's current_season in the Pinia store.
const props = defineProps<{ seasonUuid?: string }>();

const store = useFootballLeagueStore();

const TOP_N = 3;
const FALLBACK = "/img/default-avatar.svg";

const data = ref<FootballTeamTopStatisticResponse[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const drawerStat = ref<Statistic | null>(null);

// Bars grow from 0 to their share the first frame after data lands, so each
// card reads like a race filling toward the leader's mark.
const revealed = ref(false);

// Resolved season: the stage-driven prop wins, the store's current_season is
// the fallback. Reloading is keyed off this value.
const seasonUuid = computed<string | null>(
  () => props.seasonUuid || store.getCurrentFootballSeason()?.uuid || null,
);

const load = async () => {
  const uuid = seasonUuid.value;
  if (!uuid) {
    data.value = [];
    return;
  }
  isLoading.value = true;
  error.value = null;
  data.value = [];
  revealed.value = false;
  try {
    data.value = await footballTeamService.getTopStatisticTeamsBySeason(uuid);
    // Let the bars mount at 0, then release them on the next frame.
    await nextTick();
    requestAnimationFrame(() => (revealed.value = true));
  } catch (err) {
    console.error("Error loading team statistics:", err);
    error.value = "Couldn't load team statistics.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(load);

// Reload whenever the season changes (e.g. the user switches stage).
watch(seasonUuid, (next, prev) => {
  if (next && next !== prev) load();
});

// ── Helpers ──
const teamImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK;
  return path;
};
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK;
};

const groupLabel = (group: string): string =>
  group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// Numeric value behind the nested team `value`, for the proportion bars.
const statNum = (value: unknown): number => extractTeamStatValue(value) ?? 0;

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
      v-else-if="data.length === 0"
      class="py-12 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-chart-bar" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.statistics.noTeamStats') }}</p>
    </div>

    <!-- Stat groups -->
    <template v-else>
      <section v-for="group in data" :key="group.stat_group" class="mb-6 last:mb-0">
        <!-- Group eyebrow: the section's identity leads, a hairline trails it -->
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xs font-bold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 shrink-0">
            {{ groupLabel(group.stat_group) }}
          </span>
          <span class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <!-- One card per stat type -->
        <div
          v-for="stat in group.statistics"
          :key="stat.type.uuid"
          class="mb-3 last:mb-0 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
        >
          <!-- Card header -->
          <div class="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-gray-50 dark:border-gray-800/70">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-1 h-3.5 rounded-full bg-emerald-500/80 shrink-0" aria-hidden="true" />
              <span class="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 truncate">
                {{ stat.type.name }}
              </span>
            </div>
            <button
              v-if="stat.teams.length > TOP_N"
              @click="drawerStat = stat"
              class="shrink-0 inline-flex items-center gap-0.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-1.5 transition-all"
            >
              {{ $t('football.statistics.viewAll') }}
              <v-icon name="hi-solid-chevron-right" class="w-3 h-3" />
            </button>
          </div>

          <!-- Top 3 teams — leader then chasers -->
          <ul>
            <li
              v-for="(team, index) in stat.teams.slice(0, TOP_N)"
              :key="team.uuid"
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

              <!-- Logo -->
              <img
                :src="teamImg(team.image_path)"
                :alt="team.short_code || team.name"
                class="w-10 h-10 rounded-full object-contain shrink-0 bg-gray-100 dark:bg-gray-700 ring-2"
                :class="index === 0
                  ? 'ring-amber-300 dark:ring-amber-500/50'
                  : 'ring-gray-100 dark:ring-gray-700'"
                @error="onImgError"
              />

              <!-- Name + short code + proportion bar -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug"
                  :title="team.name"
                >
                  {{ team.name }}
                </p>
                <span class="text-2xs text-gray-400 dark:text-gray-500">
                  {{ team.short_code }}
                </span>
                <!-- Race track: this team's share of the leader's total -->
                <div class="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
                  <div
                    class="stat-bar h-full rounded-full"
                    :class="index === 0 ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-500'"
                    :style="{ width: (revealed ? share(statNum(team.value), statNum(stat.teams[0]?.value)) : 0) + '%' }"
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
                {{ formatTeamStatValue(team.value) }}
              </span>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <!-- All-teams drawer -->
    <TeamStatisticsAllDrawer
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

/* Bars ease from 0 to their share when a season's data lands. */
.stat-bar {
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .stat-bar {
    transition: none;
  }
}
</style>
