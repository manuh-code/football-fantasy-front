<template>
  <div class="space-y-3">
    <!-- ============================== -->
    <!-- LOADING — skeleton table       -->
    <!-- ============================== -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
      role="status"
      :aria-label="$t('fantasy.standings.loading')"
    >
      <div class="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div class="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-4 w-32 rounded-md bg-gray-200/80 dark:bg-gray-700 animate-pulse" />
      </div>
      <div class="divide-y divide-gray-100 dark:divide-gray-700/40">
        <div
          v-for="n in 6"
          :key="`sk-row-${n}`"
          class="flex items-center gap-3 px-4 py-3"
        >
          <div class="w-6 h-6 rounded-full bg-gray-200/80 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="w-8 h-8 rounded-full bg-gray-200/80 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-28 rounded bg-gray-200/80 dark:bg-gray-700 animate-pulse" />
            <div class="h-2 w-16 rounded bg-gray-200/60 dark:bg-gray-700/70 animate-pulse" />
          </div>
          <div class="h-3 w-24 rounded bg-gray-200/80 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- ============================== -->
    <!-- ERROR                          -->
    <!-- ============================== -->
    <div
      v-else-if="errorMessage"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 py-16 text-center"
    >
      <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation" class="w-7 h-7 text-red-400" />
      </div>
      <p class="text-sm font-medium text-gray-900 dark:text-white mb-1">{{ $t('fantasy.standings.error') }}</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-xs mx-auto">{{ errorMessage }}</p>
      <ButtonComponent
        variant="outline"
        size="sm"
        :text="$t('common.actions.retry')"
        @click="fetchStandings"
      />
    </div>

    <!-- ============================== -->
    <!-- CONTENT                        -->
    <!-- ============================== -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/40 overflow-hidden"
    >
      <!-- Amber accent — this tab's signature (the leaderboard / trophy identity) -->
      <div class="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400" />

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="flex items-center gap-2">
          <v-icon name="bi-trophy-fill" class="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h3 class="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {{ $t('fantasy.standings.title') }}
          </h3>
        </div>
        <span
          v-if="rows.length"
          class="text-2xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full"
        >
          {{ $t('fantasy.standings.teams', rows.length) }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="rows.length === 0" class="py-14 text-center px-6">
        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
          <v-icon name="bi-trophy" class="w-5 h-5 text-gray-300 dark:text-gray-600" />
        </div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{{ $t('fantasy.standings.empty.title') }}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          {{ $t('fantasy.standings.empty.body') }}
        </p>
      </div>

      <!-- Standings table — identity column stays pinned while the stats scroll,
           the way real sports tables read on a phone. -->
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="text-2xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              <th
                class="sticky left-0 z-20 bg-white dark:bg-gray-800 text-left font-bold pl-4 pr-3 py-2.5"
                scope="col"
              >
                {{ $t('fantasy.standings.col.team') }}
              </th>
              <th
                v-for="col in numericCols"
                :key="col.key"
                class="px-2 py-2.5 text-center font-bold whitespace-nowrap"
                :title="col.title"
                scope="col"
              >
                {{ col.label }}
              </th>
              <th class="w-2" aria-hidden="true" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
            <tr
              v-for="row in rows"
              :key="row.user.uuid"
              class="group"
            >
              <!-- Identity — pinned: rank medal + crest + team / user -->
              <td
                class="sticky left-0 z-10 bg-white dark:bg-gray-800 pr-3 py-2.5 border-l-2"
                :class="isMe(row) ? 'border-amber-400 dark:border-amber-400/80' : 'border-transparent'"
              >
                <div class="flex items-center gap-2.5 pl-2.5">
                  <!-- Rank: gold/silver/bronze medal for the podium, plain number below -->
                  <span
                    v-if="row.position <= 3"
                    class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-2xs font-black shadow-sm ring-1 ring-inset"
                    :class="RANK_MEDAL[row.position]"
                  >
                    {{ row.position }}
                  </span>
                  <span
                    v-else
                    class="shrink-0 w-6 text-center text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums"
                  >
                    {{ row.position }}
                  </span>

                  <!-- Crest -->
                  <div class="shrink-0 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/60 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="row.team.image_path"
                      :src="row.team.image_path"
                      :alt="row.team.team_name"
                      class="w-full h-full object-cover"
                      @error="onImageError"
                    />
                    <div
                      v-else-if="row.team.svg"
                      v-html="row.team.svg"
                      class="crest-svg w-7 h-7 flex items-center justify-center"
                    />
                    <v-icon v-else name="hi-solid-user-group" class="w-4 h-4 text-gray-300 dark:text-gray-500" />
                  </div>

                  <!-- Names -->
                  <div class="min-w-0 max-w-[8.5rem] sm:max-w-[12rem]">
                    <div class="flex items-center gap-1.5">
                      <p
                        class="text-xs font-bold truncate leading-tight"
                        :class="isMe(row) ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'"
                      >
                        {{ row.team.team_name }}
                      </p>
                      <span
                        v-if="isMe(row)"
                        class="shrink-0 text-2xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-400/15 px-1.5 py-px rounded-full"
                      >
                        {{ $t('fantasy.standings.you') }}
                      </span>
                    </div>
                    <p class="text-2xs text-gray-400 dark:text-gray-500 truncate -mt-0.5">
                      {{ row.user.name }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Stats -->
              <td class="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                {{ row.played }}
              </td>
              <td class="px-2 py-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                {{ row.wins }}
              </td>
              <td class="px-2 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                {{ row.draws }}
              </td>
              <td class="px-2 py-2.5 text-center text-xs font-bold text-red-500 dark:text-red-400 tabular-nums whitespace-nowrap">
                {{ row.losses }}
              </td>
              <td class="px-2 py-2.5 text-center text-xs font-semibold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
                {{ formatPoints(row.points_for) }}
              </td>
              <td class="px-2 py-2.5 text-center text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                {{ formatPoints(row.points_against) }}
              </td>
              <td
                class="px-2 py-2.5 text-center text-xs font-bold tabular-nums whitespace-nowrap"
                :class="diffClass(row)"
              >
                {{ formatDiff(row) }}
              </td>
              <td class="w-2" aria-hidden="true" />
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend — decode the abbreviations, like a printed league table -->
      <div
        v-if="rows.length"
        class="flex flex-wrap gap-x-3 gap-y-1 px-4 py-3 border-t border-gray-100 dark:border-gray-700/40 text-2xs text-gray-400 dark:text-gray-500"
      >
        <span v-for="col in numericCols" :key="`lg-${col.key}`">
          <span class="font-bold text-gray-500 dark:text-gray-400">{{ col.label }}</span>
          {{ col.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ButtonComponent } from "@/components/ui";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type { FantasyStandingResponse } from "@/interfaces/fantasy/standing/FantasyStandingResponse";
import { useUserStore } from "@/store";

interface Props {
  fantasyLeagueUuid: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const userStore = useUserStore();

const standings = ref<FantasyStandingResponse[]>([]);
const isLoading = ref(true);
const errorMessage = ref<string>("");

// Trust the backend order but sort defensively by position so a row never
// lands out of place if the API returns them unordered.
const rows = computed(() =>
  [...standings.value].sort((a, b) => a.position - b.position),
);

// Numeric columns, driven by data so the header, cells and legend stay in sync.
// `title` is the full name used for the legend and the header tooltip.
const numericCols = computed(() => [
  { key: "played", label: t("fantasy.standings.col.played"), title: t("fantasy.standings.full.played") },
  { key: "wins", label: t("fantasy.standings.col.wins"), title: t("fantasy.standings.full.wins") },
  { key: "draws", label: t("fantasy.standings.col.draws"), title: t("fantasy.standings.full.draws") },
  { key: "losses", label: t("fantasy.standings.col.losses"), title: t("fantasy.standings.full.losses") },
  { key: "pointsFor", label: t("fantasy.standings.col.pointsFor"), title: t("fantasy.standings.full.pointsFor") },
  { key: "pointsAgainst", label: t("fantasy.standings.col.pointsAgainst"), title: t("fantasy.standings.full.pointsAgainst") },
  { key: "diff", label: t("fantasy.standings.col.diff"), title: t("fantasy.standings.full.diff") },
]);

// Podium medals — gold / silver / bronze (static so Tailwind keeps the classes).
const RANK_MEDAL: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 ring-amber-200/70",
  2: "bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700 ring-gray-200/70",
  3: "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 ring-orange-200/70",
};

const isMe = (row: FantasyStandingResponse): boolean =>
  !!userStore.getUserData?.uuid && row.user.uuid === userStore.getUserData.uuid;

const diff = (row: FantasyStandingResponse): number =>
  row.points_for - row.points_against;

const formatPoints = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const formatDiff = (row: FantasyStandingResponse): string => {
  const d = diff(row);
  const formatted = formatPoints(Math.abs(d));
  if (d > 0) return `+${formatted}`;
  if (d < 0) return `-${formatted}`;
  return "0";
};

const diffClass = (row: FantasyStandingResponse): string => {
  const d = diff(row);
  if (d > 0) return "text-emerald-600 dark:text-emerald-400";
  if (d < 0) return "text-red-500 dark:text-red-400";
  return "text-gray-400 dark:text-gray-500";
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = "true";
    img.src = "/img/default-avatar.svg";
  }
};

const fetchStandings = async () => {
  if (!props.fantasyLeagueUuid) return;
  isLoading.value = true;
  errorMessage.value = "";
  try {
    standings.value = await fantasyLeagueService.getStandingsByLeague(props.fantasyLeagueUuid);
  } catch (error) {
    console.error("Error loading standings:", error);
    errorMessage.value = t("fantasy.standings.loadError");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchStandings);
watch(() => props.fantasyLeagueUuid, fetchStandings);
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Team crests arrive as raw <svg> strings — make them fill their slot
   (scoped to the crest only, so it never touches the v-icon glyphs). */
.crest-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
