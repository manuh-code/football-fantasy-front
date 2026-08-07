<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { useUserStore } from "@/store/user/useUserStore";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";

const props = defineProps<{
  standings: FootballLeagueStandingsResponse[];
}>();

const emit = defineEmits<{
  "team-selected": [teamUuid: string];
}>();

const { t } = useI18n();
const userStore = useUserStore();

// ── Followed teams ──
// Los equipos que sigue el usuario ya viven en el store (y en localStorage), así
// que resaltarlos no cuesta una petición extra ni afecta a los anónimos.
const followedUuids = computed(
  () => new Set((userStore.getUserData?.favoriteFootballTeam ?? []).map((team) => team.uuid)),
);

const isFollowed = (row: FootballLeagueStandingsResponse): boolean =>
  !!row.team?.uuid && followedUuids.value.has(row.team.uuid);

const hasFollowedInTable = computed(() => props.standings.some(isFollowed));

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

// ── Zone legend ──
// Only surface the zones that actually exist for this league size, mirroring
// the thresholds in positionZoneColor() so the colors stop being a mystery.
const legendZones = computed(() => {
  const zones: { color: string; label: string }[] = [];
  const n = props.standings.length;
  if (n === 0) return zones;
  zones.push({ color: "bg-emerald-500", label: t("football.standings.zoneQualification") });
  if (n >= 5) zones.push({ color: "bg-amber-400", label: t("football.standings.zonePlayoff") });
  if (n >= 18) zones.push({ color: "bg-red-500", label: t("football.standings.zoneRelegation") });
  return zones;
});

// ── Horizontal scroll hint ──
// On mobile the GF/GA/GD/Form columns sit off-screen between L and the pinned
// Pts column, with no signal they exist. A right-edge fade (just left of the
// sticky Pts) tells the user there's more to swipe to.
const scrollWrapper = ref<HTMLElement | null>(null);
const canScrollRight = ref(false);

function updateScrollHints() {
  const el = scrollWrapper.value;
  if (!el) return;
  canScrollRight.value = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 1;
}

onMounted(() => {
  nextTick(updateScrollHints);
  window.addEventListener("resize", updateScrollHints);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScrollHints);
});

watch(
  () => props.standings,
  () => nextTick(updateScrollHints),
);
</script>

<template>
  <div class="standings">
    <!-- ── Teléfono: una fila por equipo, sin scroll lateral ──
         La tabla completa mide 600px de ancho mínimo: en un móvil eso dejaba
         DG, GF, GC y la forma fuera de pantalla, entre la columna de equipo y
         los puntos anclados, sin más pista que un degradado. Aquí cada equipo
         ocupa dos líneas y se lee entero de una vez (`table-handling`). -->
    <div class="sm:hidden">
      <!-- Cabecera mínima: sin ella los dos números de la derecha no dicen qué
           son. -->
      <div
        class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700/60"
        aria-hidden="true"
      >
        <span class="w-5 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</span>
        <span class="flex-1 text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('football.standings.team') }}
        </span>
        <span class="w-10 text-center text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('football.standings.gd') }}
        </span>
        <span class="w-9 text-center text-2xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {{ $t('football.standings.pts') }}
        </span>
      </div>

      <ul class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <li v-for="(row, idx) in standings" :key="`m-${row.team?.uuid || idx}`">
          <button
            type="button"
            @click="onTeamSelect(row)"
            class="relative w-full flex items-center gap-2 pl-3 pr-3 py-2.5 min-h-[60px] text-left transition-colors duration-150 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
            :class="isFollowed(row) ? 'bg-amber-50 dark:bg-amber-900/20' : ''"
            :aria-label="$t('football.standings.openTeamAria', { team: row.team?.name })"
          >
            <!-- Franja de zona, pegada al borde igual que en la tabla -->
            <span
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
              :class="positionZoneColor(row.position)"
              aria-hidden="true"
            />

            <span
              class="w-5 text-center text-xs tabular-nums shrink-0"
              :class="row.position === 1
                ? 'font-extrabold text-emerald-600 dark:text-emerald-400'
                : 'font-semibold text-gray-500 dark:text-gray-400'"
            >
              {{ row.position }}
            </span>

            <TeamLogo :team="row.team" size="sm" variant="square" />

            <span class="flex-1 min-w-0">
              <span class="flex items-center gap-1">
                <v-icon
                  v-if="isFollowed(row)"
                  name="hi-solid-star"
                  class="w-3 h-3 text-amber-500 shrink-0"
                  :aria-label="$t('football.standings.followedAria')"
                />
                <span
                  class="truncate text-footnote text-gray-900 dark:text-white"
                  :class="isFollowed(row) ? 'font-bold' : 'font-semibold'"
                >
                  {{ row.team?.name }}
                </span>
              </span>

              <!-- Segunda línea: el resto de la fila de la tabla, comprimido.
                   PJ y el registro G-E-P a la izquierda, la forma a la derecha;
                   en pantallas muy estrechas cede primero el texto, nunca la
                   forma. -->
              <span class="flex items-center gap-1.5 mt-1 overflow-hidden">
                <span class="flex items-center gap-1.5 min-w-0 truncate">
                  <span class="text-2xs tabular-nums text-gray-400 dark:text-gray-500">
                    {{ getStat(row.statistics, 'overall-matches-played') }} {{ $t('football.standings.mp') }}
                  </span>
                  <span class="text-2xs text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                  <span class="text-2xs tabular-nums">
                    <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ getStat(row.statistics, 'overall-won') }}</span
                    ><span class="text-gray-300 dark:text-gray-600">-</span><span class="text-gray-500 dark:text-gray-400">{{ getStat(row.statistics, 'overall-draw') }}</span
                    ><span class="text-gray-300 dark:text-gray-600">-</span><span class="font-semibold text-red-500 dark:text-red-400">{{ getStat(row.statistics, 'overall-lost') }}</span>
                  </span>
                </span>

                <!-- La letra va dentro del cuadro: el color por sí solo no
                     distingue ganado de perdido para todo el mundo. -->
                <span class="ml-auto flex items-center gap-[3px] shrink-0">
                  <span
                    v-for="(f, i) in lastFive(row.form)"
                    :key="`m-f-${i}`"
                    :class="[
                      formColor(f.form),
                      'w-4 h-4 rounded-[3px] flex items-center justify-center text-white text-2xs font-bold leading-none',
                    ]"
                  >
                    {{ f.form }}
                  </span>
                </span>
              </span>
            </span>

            <span
              class="w-10 text-center text-2xs tabular-nums font-semibold shrink-0"
              :class="gdColor(getStat(row.statistics, 'goal-difference'))"
            >
              {{ formatGD(getStat(row.statistics, 'goal-difference')) }}
            </span>

            <span
              class="w-9 flex justify-center shrink-0"
            >
              <span
                class="inline-flex items-center justify-center min-w-[30px] px-1.5 py-0.5 rounded-md text-footnote font-bold tabular-nums"
                :class="row.position === 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'"
              >
                {{ getStat(row.statistics, 'overall-points') }}
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ── Tablet y escritorio: la tabla completa, que ya cabe ── -->
    <div class="relative hidden sm:block">
      <div
        ref="scrollWrapper"
        class="standings-table-wrapper overflow-x-auto overflow-y-auto max-h-[70vh]"
        @scroll="updateScrollHints"
      >
        <table class="w-full min-w-[600px]">
          <!-- Header row (sticky so labels stay while scrolling long tables) -->
          <thead>
            <tr>
              <th class="standings-th standings-sticky-left left-0 z-30 w-8 text-center">#</th>
              <th class="standings-th standings-sticky-left left-8 z-30 text-left pl-2">{{ $t('football.standings.team') }}</th>
              <th class="standings-th w-8 text-center">{{ $t('football.standings.mp') }}</th>
              <th class="standings-th w-8 text-center">{{ $t('football.standings.w') }}</th>
              <th class="standings-th w-8 text-center">{{ $t('football.standings.d') }}</th>
              <th class="standings-th w-8 text-center">{{ $t('football.standings.l') }}</th>
              <th class="standings-th w-9 text-center">{{ $t('football.standings.gf') }}</th>
              <th class="standings-th w-9 text-center">{{ $t('football.standings.ga') }}</th>
              <th class="standings-th w-9 text-center">{{ $t('football.standings.gd') }}</th>
              <th class="standings-th w-24 text-center">{{ $t('football.standings.form') }}</th>
              <th class="standings-th standings-sticky-right right-0 z-30 w-12 text-center">{{ $t('football.standings.pts') }}</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              v-for="(row, idx) in standings"
              :key="row.team?.uuid || idx"
              @click="onTeamSelect(row)"
              @keydown.enter="onTeamSelect(row)"
              @keydown.space.prevent="onTeamSelect(row)"
              class="standings-row group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
              tabindex="0"
              :aria-label="$t('football.standings.openTeamAria', { team: row.team?.name })"
              :class="{
                'border-b border-gray-50 dark:border-gray-700/30': idx < standings.length - 1,
                'standings-row--followed': isFollowed(row),
              }"
            >
              <!-- Position with zone indicator -->
              <td class="py-3 px-1 text-center relative standings-sticky-left left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 group-active:bg-gray-50 dark:group-active:bg-gray-700/30 transition-colors">
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
              <td class="py-3 pl-2 pr-1 standings-sticky-left left-8 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 group-active:bg-gray-50 dark:group-active:bg-gray-700/30 transition-colors">
                <div class="flex items-center gap-2 min-w-0">
                  <TeamLogo :team="row.team" size="sm" variant="square" />
                  <v-icon
                    v-if="isFollowed(row)"
                    name="hi-solid-star"
                    class="w-3 h-3 text-amber-500 shrink-0"
                    :aria-label="$t('football.standings.followedAria')"
                  />
                  <span
                    class="text-xs truncate"
                    :class="isFollowed(row)
                      ? 'font-bold text-gray-900 dark:text-white'
                      : 'font-medium text-gray-900 dark:text-white'"
                  >
                    {{ row.team?.name }}
                  </span>
                  <v-icon
                    name="hi-solid-chevron-right"
                    class="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0 ml-auto opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                  />
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
              <td class="py-3 px-1 text-center">
                <span
                  class="text-2xs tabular-nums font-semibold"
                  :class="gdColor(getStat(row.statistics, 'goal-difference'))"
                >
                  {{ formatGD(getStat(row.statistics, 'goal-difference')) }}
                </span>
              </td>

              <!-- Form -->
              <td class="py-3 px-1 text-center">
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
              <td class="py-3 px-1 text-center standings-sticky-right right-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 group-active:bg-gray-50 dark:group-active:bg-gray-700/30 transition-colors">
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

      <!-- Right-edge scroll hint: sits just left of the pinned Pts column -->
      <div
        v-show="canScrollRight"
        class="pointer-events-none absolute top-0 bottom-0 right-12 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-800"
        aria-hidden="true"
      />
    </div>

    <!-- Zone legend -->
    <div
      v-if="legendZones.length"
      class="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2.5 border-t border-gray-100 dark:border-gray-700/60"
    >
      <div v-for="zone in legendZones" :key="zone.label" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="zone.color" />
        <span class="text-2xs text-gray-500 dark:text-gray-400">{{ zone.label }}</span>
      </div>
      <div v-if="hasFollowedInTable" class="flex items-center gap-1.5">
        <v-icon name="hi-solid-star" class="w-2.5 h-2.5 text-amber-500 shrink-0" />
        <span class="text-2xs text-gray-500 dark:text-gray-400">
          {{ $t('football.standings.followedLegend') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Compact header cells — sticky to the top so column labels stay visible
   while scrolling long tables. */
.standings-th {
  position: sticky;
  top: 0;
  z-index: 20;
  padding: 8px 4px;
  font-size: 0.6875rem; /* 11px — mínimo legible */
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af; /* gray-400 */
  white-space: nowrap;
  background: #ffffff;
  box-shadow: inset 0 -1px 0 #f3f4f6; /* gray-100 — keeps a hairline under the header */
}
.dark .standings-th {
  color: #6b7280; /* gray-500 */
  background: #1f2937; /* gray-800 */
  box-shadow: inset 0 -1px 0 rgba(55, 65, 81, 0.6); /* gray-700/60 */
}
/* Corner cells (frozen row + column) must sit above the other sticky cells. */
.standings-th.standings-sticky-left,
.standings-th.standings-sticky-right {
  z-index: 30;
}

/* Compact body cells */
.standings-cell {
  padding: 12px 4px;
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

/* Followed teams — an amber wash across the whole row.
   Painted on the cells, not the row: the pinned # / Team / Pts columns carry
   their own opaque background to cover the scrolling content underneath, and it
   would hide a tint set on the <tr>. */
.standings-row--followed > td {
  background-color: #fffbeb; /* amber-50 */
}
.standings-row--followed:hover > td {
  background-color: #fef3c7; /* amber-100 */
}
.dark .standings-row--followed > td {
  background-color: rgba(120, 53, 15, 0.22); /* amber-900/22 */
}
.dark .standings-row--followed:hover > td {
  background-color: rgba(120, 53, 15, 0.34);
}

/* Smooth horizontal scroll on mobile */
.standings-table-wrapper {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
.standings-table-wrapper::-webkit-scrollbar {
  height: 3px;
  width: 3px;
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
