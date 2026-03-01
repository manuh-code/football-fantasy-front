<template>
  <div class="space-y-4 sm:space-y-6">
    <template v-if="hasLeague">
      <!-- Stage Selector Bar — Apple Sports / FotMob style -->
      <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <!-- League identity row -->
        <div class="flex items-center gap-3 px-4 pt-3.5 pb-2">
          <img
            :src="leagueImage || '/img/default-avatar.svg'"
            :alt="leagueName"
            class="w-8 h-8 rounded-lg object-cover shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {{ leagueName }}
            </h2>
          </div>
          <!-- Season badge -->
          <span
            v-if="selectedStageName"
            class="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-0.5 rounded-full shrink-0"
          >
            {{ currentSeasonLabel }}
          </span>
        </div>

        <!-- Stage selector row -->
        <div class="px-4 pb-3.5">
          <div class="relative">
            <SearchableSelectComponent
              v-model="selectedStageUuid"
              :options="stages"
              value-key="stageUuid"
              label-key="stage"
              placeholder="Select stage"
              search-placeholder="Search stage..."
              :disabled="loadingStages"
              :loading="loadingStages"
              accent-color="blue"
              :searchable="stages.length > 5"
              :clearable="false"
              @change="onStageChange"
            />
          </div>
        </div>
      </div>

      <!-- Content (only when a stage is selected) -->
      <template v-if="selectedStageUuid">
        <FixturesByStageAndCurrentRound :stage-uuid="selectedStageUuid" />
        <LeagueStanding
          :stage-uuid="selectedStageUuid"
          :season-uuid="selectedSeasonUuid"
        />
      </template>
    </template>

    <template v-else>
      <div class="text-center py-8 sm:py-12">
        <div class="text-gray-400 dark:text-gray-500">
          <v-icon name="md-sportssoccer" class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 class="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
            Select a league
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Choose your favorite league to view fixtures and statistics
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, watch } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { footballLeagueService } from "@/services/football/league/FootballLeagueService";
import { SearchableSelectComponent } from "@/components/ui";
import type { FootballStageLeagueResponse } from "@/interfaces/football/league/stage/FootballStageLeagueResponse";

// Lazy-load heavy components
const FixturesByStageAndCurrentRound = defineAsyncComponent(() => import('@/components/football/fixtures/FixturesByStageAndCurrentRound.vue'))
const LeagueStanding = defineAsyncComponent(() => import('@/components/football/leagues/LeagueStanding.vue'))

const store = useFootballLeagueStore();

const hasLeague = computed(() => store.existLeague());
const leagueName = computed(() => store.getLeague?.name ?? 'League');
const leagueImage = computed(() => store.getLeague?.image_path ?? '');

// Stage state
const stages = ref<FootballStageLeagueResponse[]>([]);
const loadingStages = ref(false);
const selectedStageUuid = ref("");
const selectedSeasonUuid = ref("");

const selectedStageName = computed(() => {
  const stage = stages.value.find((s) => s.stageUuid === selectedStageUuid.value);
  return stage?.stage ?? "";
});

/** Extract a short season label from the selected stage */
const currentSeasonLabel = computed(() => {
  const stage = stages.value.find((s) => s.stageUuid === selectedStageUuid.value);
  return stage?.stage ?? "";
});

/**
 * Fetch stages for the current league and auto-select the current one.
 */
const fetchStages = async () => {
  const leagueUuid = store.getFootballLeagueUuid();
  if (!leagueUuid) return;

  loadingStages.value = true;
  stages.value = [];
  selectedStageUuid.value = "";
  selectedSeasonUuid.value = "";

  try {
    const res = await footballLeagueService.getStage(leagueUuid);
    if (Array.isArray(res) && res.length > 0) {
      stages.value = res;
      const currentStage = res.find((s) => s.isCurrent === true) || res[0];
      selectedStageUuid.value = currentStage.stageUuid;
      selectedSeasonUuid.value = currentStage.seasonUuid;
    }
  } catch (e) {
    console.error("Error loading stages:", e);
  } finally {
    loadingStages.value = false;
  }
};

const onStageChange = (value: string | number | null) => {
  selectedStageUuid.value = String(value || "");
  const stage = stages.value.find((s) => s.stageUuid === selectedStageUuid.value);
  if (stage) {
    selectedSeasonUuid.value = stage.seasonUuid;
  }
};

// Re-fetch stages when the league changes
watch(() => store.getLeague, () => {
  if (hasLeague.value) {
    fetchStages();
  }
});

onMounted(() => {
  if (hasLeague.value) {
    fetchStages();
  }
});
</script>

<style scoped>
/* HomeComponent minimal */
</style>
