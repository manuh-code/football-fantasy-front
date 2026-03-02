<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <v-icon name="pr-spinner" class="w-6 h-6 text-gray-300 dark:text-gray-600" animation="spin" />
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center">
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-[13px] text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
      <button
        @click="loadFantasyLeagues"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-[13px] font-medium active:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Fantasy Leagues List -->
    <template v-else-if="fantasyLeagues && fantasyLeagues.length > 0">
      <!-- Section Header -->
      <div class="px-1">
        <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">My Leagues</h2>
        <p class="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{{ fantasyLeagues.length }} league{{ fantasyLeagues.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Leagues Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <FantasyLeagueCard
          v-for="league in fantasyLeagues"
          :key="league.uuid"
          :league="league"
          :show-join-button="false"
          @viewDetails="viewLeague"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center">
      <v-icon name="bi-trophy-fill" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">No Leagues Yet</h3>
      <p class="text-[13px] text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        Create your own league or join an existing one to start playing.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user/useUserStore";
import FantasyLeagueCard from "@/components/fantasy/FantasyLeagueCard.vue";

// Stores and composables
const userStore = useUserStore();
const router = useRouter();

// State
const isLoading = ref(false);
const errorMessage = ref<string>("");

// Computed properties
const fantasyLeagues = computed(() => userStore.getUserFantasyLeagues);

// Methods
const loadFantasyLeagues = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await userStore.getUserFantasyLeaguesFromApi();
  } catch (error) {
    console.error("Error loading fantasy leagues:", error);
    errorMessage.value =
      "Failed to load your fantasy leagues. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const viewLeague = (league: string | { uuid: string }) => {
  // Navigate to league details page using the league object or UUID
  const leagueUuid = typeof league === "string" ? league : league.uuid;
  router.push({ name: "fantasyLeagueDetail", params: { uuid: leagueUuid } });
};

// Lifecycle
onMounted(async () => {
  // Always refresh leagues to reflect recent joins or changes
  await loadFantasyLeagues();
});
</script>

<style scoped>
/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
