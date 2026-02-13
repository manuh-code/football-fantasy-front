<template>
  <div
    class="w-full mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Card Header -->
    <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0"
          >
            <v-icon
              name="bi-trophy-fill"
              class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              League Standings
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Current standings table
            </p>
          </div>
        </div>

        <!-- Stage selector -->
        <div class="flex items-center gap-2">
          <select
            id="stage-select"
            v-model="selectedStageUuid"
            @change="onStageChange"
            :disabled="loadingStages"
            class="w-full sm:w-auto text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[180px]"
          >
            <option value="">Select stage</option>
            <option
              v-for="stage in stages"
              :key="stage.stageUuid"
              :value="stage.stageUuid"
            >
              {{ stage.stage }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-6">
      <div
        v-if="!leagueUuid"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        No league selected.
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
          v-else-if="!selectedStageUuid"
          class="text-center py-8 text-gray-400 dark:text-gray-500"
        >
          <NoResults
            title="Select stage"
            description="Please select a stage to view the standings."
            icon="bi-trophy-fill"
          />
        </div>

        <!-- No standings available -->
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
import { ref, onMounted } from "vue";
import footballLeagueService from "@/services/football/league/FootballLeagueService";
import catalogService from "@/services/catalog/CatalogService";
import NoResults from "@/components/ui/NoResults.vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import type { FootballStageLeagueResponse } from "@/interfaces/football/league/stage/FootballStageLeagueResponse";
import type { FootballLeagueStandingsPayload } from "@/interfaces/football/league/Standing/FootballLeagueStandingsPayload";

const store = useFootballLeagueStore();
const leagueUuid = store.getFootballLeagueUuid();

// State para etapas
const stages = ref<FootballStageLeagueResponse[]>([]);
const loadingStages = ref(false);
const selectedStageUuid = ref("");
const selectedSeasonUuid = ref("");

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

// Cargar etapas
const fetchStages = async () => {
  if (!leagueUuid) return;
  loadingStages.value = true;
  stages.value = [];
  selectedStageUuid.value = "";
  standings.value = [];
  try {
    const res = await footballLeagueService.getStage(leagueUuid);
    if (Array.isArray(res)) {
      stages.value = res;
      // Auto-select the current stage, or the first stage if none is current
      if (res.length > 0) {
        const currentStage = res.find(s => s.isCurrent === true);
        const stageToSelect = currentStage || res[0];
        selectedStageUuid.value = stageToSelect.stageUuid;
        selectedSeasonUuid.value = stageToSelect.seasonUuid;
        await fetchStandings();
      }
    }
  } catch (e) {
    error.value = "Error loading stages.";
  } finally {
    loadingStages.value = false;
  }
};

// Cargar standings
const fetchStandings = async () => {
  if (!selectedStageUuid.value) return;
  loading.value = true;
  error.value = "";
  standings.value = [];
  try {
    const payload: FootballLeagueStandingsPayload = {
      stage_uuid: selectedStageUuid.value,
      season_uuid: selectedSeasonUuid.value,
    };
    const res = await footballLeagueService.getStandings(payload);
    if (Array.isArray(res)) standings.value = res;
    else standings.value = [];
  } catch (e) {
    error.value = "Error loading standings.";
  } finally {
    loading.value = false;
  }
};

// Event handlers
const onStageChange = async () => {
  // Encontrar el stage seleccionado y obtener su seasonUuid
  const selectedStage = stages.value.find(
    (s) => s.stageUuid === selectedStageUuid.value,
  );
  if (selectedStage) {
    selectedSeasonUuid.value = selectedStage.seasonUuid;
  }
  await fetchStandings();
};

onMounted(() => {
  fetchStages();
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
