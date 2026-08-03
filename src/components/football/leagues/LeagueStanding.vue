<template>
  <div class="w-full">
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
    >
      <!-- Loading skeleton -->
      <StandingsTableSkeleton v-if="loading" />

      <!-- No stage selected -->
      <div v-else-if="!stageUuid" class="flex items-center justify-center py-12">
        <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.standings.noStage') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-12 px-6 text-center">
        <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
        <button
          @click="fetchStandings"
          class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="standings.length === 0"
        class="text-center py-10 text-gray-400 dark:text-gray-500"
      >
        <NoResults
          :title="$t('football.standings.noStandings')"
          :description="$t('football.standings.emptyDescription')"
          icon="bi-trophy-fill"
        />
      </div>

      <!-- Table -->
      <StandingsTable v-else :standings="standings" @team-selected="openTeamProfile" />
    </div>

    <!-- Ad: only below a fully loaded table (AdSense policy — never next to
         skeletons, errors or empty states). -->
    <AdUnit v-if="!loading && !error && standings.length > 0" :ad-slot="AD_SLOTS.homeContent" />

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
import { useI18n } from "vue-i18n";
import footballLeagueService from "@/services/football/league/FootballLeagueService";
import NoResults from "@/components/ui/NoResults.vue";
import AdUnit from "@/components/ads/AdUnit.vue";
import { AD_SLOTS } from "@/config/ads";
import StandingsTable from "./StandingsTable.vue";
import StandingsTableSkeleton from "./StandingsTableSkeleton.vue";
import FootballTeamProfileComponent from "@/components/football/team/FootballTeamProfileComponent.vue";
import { useAuthStore } from "@/store/auth/useAuthStore";
import { useUserStore } from "@/store/user/useUserStore";
import type { FootballLeagueStandingsResponse } from "@/interfaces/football/league/FootballLeagueStandingsResponse";
import type { FootballLeagueStandingsPayload } from "@/interfaces/football/league/Standing/FootballLeagueStandingsPayload";

const props = defineProps<{
  stageUuid: string;
  seasonUuid: string;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();

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
    error.value = t("football.standings.loadError");
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

/**
 * La tabla resalta a los equipos que sigue el usuario leyéndolos del store. Si
 * la sesión llegó aquí sin haber pasado por login (token persistido, store
 * vacío) no habría a quién resaltar, así que se hidrata una sola vez.
 */
const ensureFollowedTeams = async () => {
  if (!authStore.getToken() || userStore.getUserData) return;
  try {
    await userStore.setUserDataFromApi();
  } catch {
    // Sin datos de usuario la tabla se pinta igual, sólo sin resaltados.
  }
};

onMounted(() => {
  ensureFollowedTeams();
  if (props.stageUuid && props.seasonUuid) {
    fetchStandings();
  }
});
</script>
