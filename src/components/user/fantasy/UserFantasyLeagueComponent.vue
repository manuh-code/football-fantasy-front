<template>
  <div class="animate-page-enter space-y-6">
    <!-- Main Content -->
    <div>
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Loading your fantasy leagues...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="text-center py-16">
        <div
          class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <v-icon
            name="hi-solid-exclamation"
            class="w-10 h-10 text-red-600 dark:text-red-400"
          />
        </div>
        <h3 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
          Error Loading Leagues
        </h3>
        <p class="text-red-700 dark:text-red-300 mb-8">{{ errorMessage }}</p>
        <button
          @click="loadFantasyLeagues"
          class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>

      <!-- Fantasy Leagues Cards -->
      <div v-else-if="fantasyLeagues && fantasyLeagues.length > 0">
        <!-- Section Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Leagues
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Manage and track your fantasy leagues
          </p>
        </div>

        <!-- Leagues Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <FantasyLeagueCard
            v-for="league in fantasyLeagues"
            :key="league.uuid"
            :league="league"
            :show-join-button="false"
            @viewDetails="viewLeague"
          />
        </div>

        <!-- Stats Summary (compact) -->
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 mb-8">
        <div
          class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <v-icon name="bi-trophy-fill" class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No Fantasy Leagues Yet
        </h3>
        <p
          class="text-gray-600 dark:text-gray-400 text-base mb-6 max-w-md mx-auto leading-relaxed"
        >
          Start your fantasy football journey by creating your own league or
          joining an existing one below!
        </p>
      </div>
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
  // Check if fantasy leagues are already loaded
  if (!fantasyLeagues.value) {
    await loadFantasyLeagues();
  }
});
</script>

<style scoped>
/* Loading spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Smooth hover animations for action cards */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-4px) scale(1.02);
  }
}

/* Pulse animation for icons */
@keyframes pulse-icon {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

button:hover .w-16 {
  animation: pulse-icon 0.6s ease-in-out;
}

/* FAB Transitions */
.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}

/* FAB Menu Transitions */
.fab-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.95);
}

/* Rotate animation for main FAB */
.rotate-45 {
  transform: rotate(45deg);
}

.rotate-0 {
  transform: rotate(0deg);
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-spin,
  .transition-all,
  .transition-transform,
  .transition-colors,
  .transition-shadow {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }

  button:hover .w-16 {
    animation: none !important;
  }
}
</style>
