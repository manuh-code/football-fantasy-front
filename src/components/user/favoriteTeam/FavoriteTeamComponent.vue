<template>
  <div class="animate-page-enter space-y-5">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shrink-0">
        <v-icon name="hi-solid-star" class="w-6 h-6 text-white" />
      </div>
      <div class="min-w-0">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {{ $t('user.favoriteTeam.following.title') }}
        </h1>
        <p class="text-footnote text-gray-500 dark:text-gray-400">
          <template v-if="!isLoading && teams.length">
            {{ $t('user.favoriteTeam.following.count', { count: teams.length }, teams.length) }}
          </template>
          <template v-else>
            {{ $t('user.favoriteTeam.following.subtitle') }}
          </template>
        </p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <div
        v-for="i in 8"
        :key="`sk-${i}`"
        class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col items-center gap-3"
      >
        <div class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="h-3 w-20 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="loadError"
      class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-8 flex flex-col items-center text-center"
    >
      <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ loadError }}</p>
      <button
        @click="loadTeams"
        class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!teams.length"
      class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-10 flex flex-col items-center text-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
        <v-icon name="bi-star" class="w-8 h-8 text-amber-400 dark:text-amber-500" />
      </div>
      <h2 class="text-callout font-semibold text-gray-900 dark:text-white">
        {{ $t('user.favoriteTeam.following.empty.title') }}
      </h2>
      <p class="text-footnote text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
        {{ $t('user.favoriteTeam.following.empty.subtitle') }}
      </p>
      <button
        @click="goExplore"
        class="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
      >
        <v-icon name="bi-trophy-fill" class="w-3.5 h-3.5" />
        {{ $t('user.favoriteTeam.following.empty.cta') }}
      </button>
    </div>

    <!-- Teams grid -->
    <TransitionGroup
      v-else
      tag="div"
      name="team-card"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <div
        v-for="team in teams"
        :key="team.uuid"
        class="relative group rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="openProfile(team)"
      >
        <!-- Unfollow -->
        <button
          @click.stop="unfollow(team)"
          :disabled="pendingUuids.has(team.uuid)"
          class="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
          :aria-label="$t('user.favoriteTeam.following.unfollowAria', { name: team.name })"
          :title="$t('user.favoriteTeam.following.unfollowAria', { name: team.name })"
        >
          <v-icon v-if="pendingUuids.has(team.uuid)" name="pr-spinner" class="w-3.5 h-3.5 animate-spin" />
          <v-icon v-else name="hi-solid-star" class="w-4 h-4" />
        </button>

        <div class="w-16 h-16 flex items-center justify-center mb-3 mt-1">
          <TeamLogo :team="team" size="xl" variant="square" :show-loading-state="true" />
        </div>
        <p class="text-footnote font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 w-full">
          {{ team.name }}
        </p>
        <div
          v-if="team.country"
          class="flex items-center justify-center gap-1 mt-1 min-w-0 w-full"
        >
          <img
            v-if="team.country.image_path"
            :src="team.country.image_path"
            :alt="team.country.name ?? ''"
            class="w-3.5 h-3.5 rounded-full object-cover shrink-0"
          />
          <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
            {{ team.country.name }}
          </span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Team profile drawer -->
    <FootballTeamProfileComponent
      :is-open="isProfileOpen"
      :team-uuid="profileTeamUuid"
      :stage-uuid="profileStageUuid"
      @close="closeProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import FootballTeamProfileComponent from "@/components/football/team/FootballTeamProfileComponent.vue";
import { useToast } from "@/composables/useToast";
import { useUserStore } from "@/store/user/useUserStore";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import { footballLeagueService } from "@/services/football/league/FootballLeagueService";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const leagueStore = useFootballLeagueStore();

const isLoading = ref(false);
const loadError = ref<string | null>(null);

// ── Team profile drawer ──
const isProfileOpen = ref(false);
const profileTeamUuid = ref<string | null>(null);
const profileStageUuid = ref<string | null>(null);

const openProfile = async (team: FootballTeamResponse) => {
  let stageUuid = leagueStore.getCurrentStageUuid();
  if (!stageUuid) {
    const leagueUuid = leagueStore.getFootballLeagueUuid();
    if (leagueUuid) {
      try {
        const stages = await footballLeagueService.getStage(leagueUuid);
        if (Array.isArray(stages) && stages.length > 0) {
          const current = stages.find((s) => s.is_current) ?? stages[0];
          stageUuid = current.uuid;
          leagueStore.setCurrentStageUuid(current.uuid);
        }
      } catch {
        // can't open drawer without a stage
        return;
      }
    }
  }
  if (!stageUuid) return;
  profileTeamUuid.value = team.uuid;
  profileStageUuid.value = stageUuid;
  isProfileOpen.value = true;
};

const closeProfile = () => {
  isProfileOpen.value = false;
};
// Per-card spinner while an unfollow request is in flight.
const pendingUuids = ref<Set<string>>(new Set());

const teams = computed<FootballTeamResponse[]>(
  () => userStore.getUserData?.favoriteFootballTeam ?? [],
);

const loadTeams = async () => {
  loadError.value = null;
  // We already have user data cached most of the time; only show the skeleton
  // when we actually need to fetch it.
  if (userStore.getUserData) return;
  isLoading.value = true;
  try {
    await userStore.setUserDataFromApi();
  } catch (err) {
    console.error("Error loading favorite teams:", err);
    loadError.value = t("user.favoriteTeam.following.loadError");
  } finally {
    isLoading.value = false;
  }
};

const unfollow = async (team: FootballTeamResponse) => {
  if (pendingUuids.value.has(team.uuid)) return;
  pendingUuids.value = new Set(pendingUuids.value).add(team.uuid);
  try {
    await userStore.unfollowFavoriteTeam(team.uuid);
    toast.success(
      t("user.favoriteTeam.following.unfollowedTitle"),
      t("user.favoriteTeam.following.unfollowedMsg", { name: team.name }),
    );
  } catch (err) {
    console.error("Error unfollowing team:", err);
    toast.error(t("user.favoriteTeam.following.error"));
  } finally {
    const next = new Set(pendingUuids.value);
    next.delete(team.uuid);
    pendingUuids.value = next;
  }
};

const goExplore = () => {
  router.push({ name: "gaming" });
};

onMounted(loadTeams);
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth removal when a team is unfollowed */
.team-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: absolute;
}
.team-card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.team-card-move {
  transition: transform 0.25s ease;
}
</style>
