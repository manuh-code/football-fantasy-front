<script setup lang="ts">
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";

const props = defineProps<{
  standings: FootballLeagueStandingsResponse[];
}>();

const emit = defineEmits<{
  "team-selected": [teamUuid: string];
}>();

const onTeamSelect = (row: FootballLeagueStandingsResponse) => {
  if (row.team?.uuid) emit("team-selected", row.team.uuid);
};

// ── Helpers ──
type StatLike =
  | { type?: { code?: string }; value?: number }
  | Array<{ type?: { code?: string }; value?: number }>;
const getStat = (stats: StatLike | undefined, code: string) => {
  if (!stats) return "-";
  if (Array.isArray(stats)) {
    const found = stats.find((s) => s?.type?.code === code);
    return found?.value ?? "-";
  }
  const single = stats as { type?: { code?: string }; value?: number };
  if (single?.type?.code === code) return single.value ?? "-";
  return "-";
};

type FormLike =
  | { form?: string; sort_order?: number }
  | Array<{ form?: string; sort_order?: number }>;
const lastFive = (formArr: FormLike | undefined) => {
  if (!formArr) return [];
  if (Array.isArray(formArr)) {
    return formArr.slice(-5);
  }
  return [formArr];
};

const formColor = (f: string | undefined) => {
  if (!f) return "bg-gray-300 dark:bg-gray-700";
  const s = (f || "").toUpperCase();
  if (s === "W" || s === "G") return "bg-emerald-500";
  if (s === "L" || s === "P") return "bg-red-500";
  if (s === "D" || s === "E") return "bg-yellow-400";
  return "bg-gray-300 dark:bg-gray-700";
};

/**
 * Position zone color — colored left bar accent like FotMob/Apple Sports.
 * UCL spots = blue, Europa = orange, relegation = red, rest = transparent
 */
const positionZoneColor = (pos: number | undefined) => {
  if (!pos) return "bg-transparent";
  if (pos <= 4) return "bg-emerald-500"; // Direct qualification (pitch green = advancing)
  if (pos >= 5 && pos <= 6) return "bg-amber-400"; // Play-in / repechaje
  // Relegation zone — show for bottom 3 if league has 18+ teams
  if (props.standings.length >= 18 && pos > props.standings.length - 3) return "bg-red-500";
  return "bg-transparent";
};

/** Color class for goal difference value */
const gdColor = (val: string | number | undefined) => {
  const n = Number(val);
  if (Number.isNaN(n) || n === 0) return "text-gray-500 dark:text-gray-400";
  return n > 0
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-500 dark:text-red-400";
};

/** Format goal difference with +/- prefix */
const formatGD = (val: string | number | undefined) => {
  const n = Number(val);
  if (Number.isNaN(n)) return "-";
  if (n > 0) return `+${n}`;
  return String(n);
};
</script>

<template>
  <div class="standings-table-wrapper overflow-x-auto">
    <table class="w-full min-w-[600px]">
      <!-- Header row -->
      <thead>
        <tr class="border-b border-gray-100 dark:border-gray-700/60">
          <th class="standings-th standings-sticky-left left-0 z-10 w-8 text-center bg-white dark:bg-gray-800">#</th>
          <th class="standings-th standings-sticky-left left-8 z-10 text-left pl-2 bg-white dark:bg-gray-800">{{ $t('football.standings.team') }}</th>
          <th class="standings-th w-8 text-center">{{ $t('football.standings.mp') }}</th>
          <th class="standings-th w-8 text-center">{{ $t('football.standings.w') }}</th>
          <th class="standings-th w-8 text-center">{{ $t('football.standings.d') }}</th>
          <th class="standings-th w-8 text-center">{{ $t('football.standings.l') }}</th>
          <th class="standings-th w-9 text-center">{{ $t('football.standings.gf') }}</th>
          <th class="standings-th w-9 text-center">{{ $t('football.standings.ga') }}</th>
          <th class="standings-th w-9 text-center">{{ $t('football.standings.gd') }}</th>
          <th class="standings-th w-24 text-center">{{ $t('football.standings.form') }}</th>
          <th class="standings-th standings-sticky-right right-0 z-10 w-12 text-center bg-white dark:bg-gray-800">{{ $t('football.standings.pts') }}</th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="(row, idx) in standings"
          :key="row.team?.uuid || idx"
          @click="onTeamSelect(row)"
          class="standings-row group cursor-pointer"
          :class="{
            'border-b border-gray-50 dark:border-gray-700/30': idx < standings.length - 1,
          }"
        >
          <!-- Position with zone indicator -->
          <td class="py-2.5 px-1 text-center relative standings-sticky-left left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 transition-colors">
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              :class="positionZoneColor(row.position)"
            />
            <span
              class="text-xs tabular-nums"
              :class="row.position === 1
                ? 'font-extrabold text-emerald-600 dark:text-emerald-400'
                : 'font-semibold text-gray-500 dark:text-gray-400'"
            >
              {{ row.position }}
            </span>
          </td>

          <!-- Team -->
          <td class="py-2 pl-2 pr-1 standings-sticky-left left-8 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 transition-colors">
            <div class="flex items-center gap-2 min-w-0">
              <TeamLogo :team="row.team" size="sm" variant="square" />
              <span class="text-xs font-medium text-gray-900 dark:text-white truncate">
                {{ row.team?.name }}
              </span>
            </div>
          </td>

          <!-- MP -->
          <td class="standings-cell">
            {{ getStat(row.statistics, "overall-matches-played") }}
          </td>

          <!-- W -->
          <td class="standings-cell font-semibold text-emerald-600 dark:text-emerald-400">
            {{ getStat(row.statistics, "overall-won") }}
          </td>

          <!-- D -->
          <td class="standings-cell">
            {{ getStat(row.statistics, "overall-draw") }}
          </td>

          <!-- L -->
          <td class="standings-cell font-semibold text-red-500 dark:text-red-400">
            {{ getStat(row.statistics, "overall-lost") }}
          </td>

          <!-- GF -->
          <td class="standings-cell">
            {{ getStat(row.statistics, "overall-goals-for") }}
          </td>

          <!-- GA -->
          <td class="standings-cell">
            {{ getStat(row.statistics, "overall-goals-against") }}
          </td>

          <!-- GD -->
          <td class="py-2.5 px-1 text-center">
            <span
              class="text-2xs tabular-nums font-semibold"
              :class="gdColor(getStat(row.statistics, 'goal-difference'))"
            >
              {{ formatGD(getStat(row.statistics, 'goal-difference')) }}
            </span>
          </td>

          <!-- Form -->
          <td class="py-2.5 px-1 text-center">
            <div class="flex items-center justify-center gap-[3px]">
              <template v-for="(f, i) in lastFive(row.form)" :key="i">
                <div
                  :class="[
                    formColor(f.form),
                    'w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-white text-2xs font-bold leading-none',
                  ]"
                >
                  {{ f.form }}
                </div>
              </template>
            </div>
          </td>

          <!-- Points -->
          <td class="py-2.5 px-1 text-center standings-sticky-right right-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 transition-colors">
            <span
              class="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded-md text-footnote font-bold tabular-nums ring-1"
              :class="row.position === 1
                ? 'bg-emerald-500 text-white ring-transparent'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-transparent'"
            >
              {{ getStat(row.statistics, "overall-points") }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Compact header cells */
.standings-th {
  padding: 8px 4px;
  font-size: 0.6875rem; /* 11px — mínimo legible */
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af; /* gray-400 */
  white-space: nowrap;
}
.dark .standings-th {
  color: #6b7280; /* gray-500 */
}

/* Compact body cells */
.standings-cell {
  padding: 10px 4px;
  text-align: center;
  font-size: 0.6875rem; /* 11px — mínimo legible */
  font-variant-numeric: tabular-nums;
  color: #4b5563; /* gray-600 */
  white-space: nowrap;
}
.dark .standings-cell {
  color: #d1d5db; /* gray-300 */
}

/* Row hover */
.standings-row:hover {
  background-color: #f9fafb; /* gray-50 */
}
.dark .standings-row:hover {
  background-color: rgba(55, 65, 81, 0.3); /* gray-700/30 */
}

/* Smooth horizontal scroll on mobile */
.standings-table-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
.standings-table-wrapper::-webkit-scrollbar {
  height: 3px;
}
.standings-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.standings-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}
.dark .standings-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #374151;
}

/* Sticky columns */
.standings-sticky-left,
.standings-sticky-right {
  position: sticky;
}

/* Subtle shadow on sticky-right (Pts) to separate from scrollable content */
.standings-sticky-right {
  box-shadow: -4px 0 8px -4px rgba(0, 0, 0, 0.06);
}
.dark .standings-sticky-right {
  box-shadow: -4px 0 8px -4px rgba(0, 0, 0, 0.3);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
