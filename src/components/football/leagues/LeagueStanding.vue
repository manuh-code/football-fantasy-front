<template>
  <div
    class="w-full mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60"
  >
    <!-- Card Header (minimal iOS/Android style) -->
    <div class="px-4 py-3">
      <div class="flex items-center gap-2">
        <v-icon
          name="bi-trophy-fill"
          class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0"
        />
        <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">
          Standings
        </h2>
        <span class="text-[11px] text-gray-400 dark:text-gray-500">
          Table
        </span>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6">
      <div
        v-if="!stageUuid"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        No stage selected.
      </div>

      <div v-else>
        <!-- Loading state -->
        <div
          v-if="loading"
          class="text-center py-8 text-gray-400 dark:text-gray-500"
        >
          <div class="flex items-center justify-center">
            <v-icon
              name="pr-spinner"
              class="w-6 h-6 text-gray-400 dark:text-gray-500"
              animation="spin"
              aria-hidden="true"
            />
            <span class="sr-only">Loading standings...</span>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-8 text-red-500">
          {{ error }}
        </div>

        <!-- Empty state -->
        <div
          v-else-if="standings.length === 0"
          class="text-center py-8 text-gray-400 dark:text-gray-500"
        >
          <NoResults
            title="No standings available"
            description="No standings available for this stage."
            icon="bi-trophy-fill"
          />
        </div>

        <!-- Standings table -->
        <div v-else>
          <!-- Desktop table -->
          <div
            class="hidden md:block table-container overflow-x-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg"
          >
            <table
              class="table-fixed min-w-[720px] w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <colgroup>
                <col style="width: 56px" />
                <col style="width: 260px" />
                <col style="width: 56px" />
                <col style="width: 56px" />
                <col style="width: 56px" />
                <col style="width: 56px" />
                <col style="width: 72px" />
                <col style="width: 72px" />
                <col style="width: 72px" />
                <col style="width: 140px" />
                <col style="width: 80px" />
              </colgroup>
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    Team
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    MP
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    W
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    D
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    L
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    GF
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    GA
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    GD
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    Form
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                  >
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="(row, idx) in standings"
                  :key="row.team?.uuid || idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ row.position }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <TeamLogo :team="row.team" size="sm" variant="square" />
                      <div class="flex flex-col">
                        <span
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ row.team?.name }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-matches-played") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-won") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-draw") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-lost") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-goals-for") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "overall-goals-against") }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {{ getStat(row.statistics, "goal-difference") }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <template v-for="(f, i) in lastFive(row.form)" :key="i">
                        <div
                          :class="[
                            formColor(f.form),
                            'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                          ]"
                          :title="
                            f.form === 'W'
                              ? 'Win'
                              : f.form === 'L'
                                ? 'Loss'
                                : f.form === 'D'
                                  ? 'Draw'
                                  : ''
                          "
                        >
                          {{ f.form }}
                        </div>
                      </template>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      class="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded font-semibold"
                    >
                      {{ getStat(row.statistics, "overall-points") }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <ul class="md:hidden space-y-3">
            <li
              v-for="(row, idx) in standings"
              :key="row.team?.uuid || idx"
              class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    {{ row.position }}.
                  </div>
                  <TeamLogo :team="row.team" size="sm" variant="square" />
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ row.team?.name }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="text-sm text-gray-700 dark:text-gray-200">
                    <span
                      class="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded font-semibold"
                    >
                      {{ getStat(row.statistics, "overall-points") }} pts
                    </span>
                  </div>
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <div
                  class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  <div>W {{ getStat(row.statistics, "overall-won") }}</div>
                  <div>D {{ getStat(row.statistics, "overall-draw") }}</div>
                  <div>L {{ getStat(row.statistics, "overall-lost") }}</div>
                </div>
                <div class="flex items-center gap-1">
                  <template v-for="(f, i) in lastFive(row.form)" :key="i">
                    <div
                      :class="[
                        formColor(f.form),
                        'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                      ]"
                    >
                      {{ f.form }}
                    </div>
                  </template>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import footballLeagueService from "@/services/football/league/FootballLeagueService";
import NoResults from "@/components/ui/NoResults.vue";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import type { FootballLeagueStandingsPayload } from "@/interfaces/football/league/Standing/FootballLeagueStandingsPayload";

// Props
const props = defineProps<{
  stageUuid: string;
  seasonUuid: string;
}>();

// State para standings
const standings = ref<FootballLeagueStandingsResponse[]>([]);
const loading = ref(false);
const error = ref("");

// Helper functions
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

// Cargar standings
const fetchStandings = async () => {
  if (!props.stageUuid || !props.seasonUuid) return;
  loading.value = true;
  error.value = "";
  standings.value = [];
  try {
    const payload: FootballLeagueStandingsPayload = {
      stage_uuid: props.stageUuid,
      season_uuid: props.seasonUuid,
    };
    const res = await footballLeagueService.getStandings(payload);
    if (Array.isArray(res)) standings.value = res;
    else standings.value = [];
  } catch (e) {
    error.value = "Error loading standings.";
    console.error("Error loading standings:", e);
  } finally {
    loading.value = false;
  }
};

// Watch for prop changes
watch(
  () => [props.stageUuid, props.seasonUuid],
  ([newStage, newSeason]) => {
    if (newStage && newSeason) {
      fetchStandings();
    }
  },
);

onMounted(() => {
  if (props.stageUuid && props.seasonUuid) {
    fetchStandings();
  }
});
</script>

<style scoped>
.dark .dark\:bg-gray-850 {
  background-color: #0b1220;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
