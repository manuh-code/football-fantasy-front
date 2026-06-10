<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Loading skeleton -->
    <StandingsTableSkeleton v-if="loading" />

    <!-- No stage selected -->
    <div v-else-if="!stageUuid" class="flex items-center justify-center py-12">
      <p class="text-[13px] text-gray-400 dark:text-gray-500">No stage selected.</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-10 px-4">
      <p class="text-[13px] text-red-500 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="standings.length === 0"
      class="text-center py-10 text-gray-400 dark:text-gray-500"
    >
      <NoResults
        title="No standings available"
        description="No standings available for this stage."
        icon="bi-trophy-fill"
      />
    </div>

    <!-- Table -->
    <StandingsTable v-else :standings="standings" @team-selected="openTeamProfile" />

    <!-- Team profile drawer -->
    <FootballTeamProfileComponent
      :is-open="isProfileOpen"
      :team-uuid="selectedTeamUuid"
      :stage-uuid="stageUuid"
      @close="closeTeamProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import footballLeagueService from "@/services/football/league/FootballLeagueService";
import NoResults from "@/components/ui/NoResults.vue";
import StandingsTable from "./StandingsTable.vue";
import StandingsTableSkeleton from "./StandingsTableSkeleton.vue";
import FootballTeamProfileComponent from "@/components/football/team/FootballTeamProfileComponent.vue";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import type { FootballLeagueStandingsPayload } from "@/interfaces/football/league/Standing/FootballLeagueStandingsPayload";

const props = defineProps<{
  stageUuid: string;
  seasonUuid: string;
}>();

const standings = ref<FootballLeagueStandingsResponse[]>([]);
const loading = ref(false);
const error = ref("");

// ── Team profile drawer ──
const isProfileOpen = ref(false);
const selectedTeamUuid = ref<string | null>(null);

const openTeamProfile = (teamUuid: string) => {
  selectedTeamUuid.value = teamUuid;
  isProfileOpen.value = true;
};

const closeTeamProfile = () => {
  isProfileOpen.value = false;
};

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
