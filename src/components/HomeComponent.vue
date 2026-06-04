<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Home header: brand + stage switcher + profile (replaces the global HeaderMenu on Home) -->
    <HomeHeaderMenu
      v-model:stage-uuid="selectedStageUuid"
      v-model:season-uuid="selectedSeasonUuid"
    />

    <template v-if="hasLeague">
      <template v-if="selectedStageUuid">
        <!-- Linear segmented menu (Standings / Fixtures / Statistics) -->
        <div
          class="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner"
          role="tablist"
          aria-label="League sections"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            @click="selectTab(tab.key)"
            class="flex-1 flex items-center justify-center gap-1.5 h-9 px-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200"
            :class="activeTab === tab.key
              ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          >
            <v-icon :name="tab.icon" class="w-3.5 h-3.5 shrink-0" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Sliding panel area -->
        <div
          class="relative"
          :class="{ 'overflow-hidden': isAnimating }"
        >
          <Transition
            :name="transitionName"
            @before-leave="isAnimating = true"
            @after-enter="isAnimating = false"
            @enter-cancelled="isAnimating = false"
            @leave-cancelled="isAnimating = false"
          >
            <component
              :is="activeComponent"
              :key="activeTab"
              v-bind="activeProps"
              class="slide-panel"
            />
          </Transition>
        </div>
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
import { ref, computed, defineAsyncComponent, onMounted } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import HomeHeaderMenu from "@/components/home/HomeHeaderMenu.vue";

// Lazy-load heavy content panels. Keep the raw loaders so we can warm the
// chunks on mount — that way the slide transition has a resolved component to
// animate the first time the user switches tabs.
const loadStanding = () => import("@/components/football/leagues/LeagueStanding.vue");
const loadFixtures = () => import("@/components/football/fixtures/LeagueFixtures.vue");
const loadStatistics = () => import("@/components/football/leagues/LeagueStatistics.vue");

const LeagueStanding = defineAsyncComponent(loadStanding);
const LeagueFixtures = defineAsyncComponent(loadFixtures);
const LeagueStatistics = defineAsyncComponent(loadStatistics);

const store = useFootballLeagueStore();
const hasLeague = computed(() => store.existLeague());

// Active stage/season context, driven by the HomeHeaderMenu.
const selectedStageUuid = ref("");
const selectedSeasonUuid = ref("");

// ── Tabs ──
type TabKey = "standings" | "fixtures" | "statistics";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "standings", label: "Standings", icon: "bi-trophy-fill" },
  { key: "fixtures", label: "Fixtures", icon: "md-sportssoccer" },
  { key: "statistics", label: "Statistics", icon: "hi-solid-chart-bar" },
];

const activeTab = ref<TabKey>("standings");

// Direction-aware slide: "next" when moving right, "prev" when moving left.
const transitionName = ref<"slide-next" | "slide-prev">("slide-next");
const isAnimating = ref(false);

const tabIndex = (key: TabKey) => tabs.findIndex((t) => t.key === key);

const selectTab = (key: TabKey) => {
  if (key === activeTab.value) return;
  transitionName.value = tabIndex(key) > tabIndex(activeTab.value) ? "slide-next" : "slide-prev";
  activeTab.value = key;
};

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "fixtures":
      return LeagueFixtures;
    case "statistics":
      return LeagueStatistics;
    default:
      return LeagueStanding;
  }
});

const activeProps = computed<Record<string, unknown>>(() => {
  if (activeTab.value === "fixtures") {
    return {
      stageUuid: selectedStageUuid.value,
      seasonUuid: selectedSeasonUuid.value,
    };
  }
  return {
    stageUuid: selectedStageUuid.value,
    seasonUuid: selectedSeasonUuid.value,
  };
});

// Warm the non-default chunks so tab switches animate smoothly.
onMounted(() => {
  loadFixtures();
  loadStatistics();
});
</script>

<style scoped>
/* Direction-aware horizontal slide (FotMob / Apple Sports style).
   The leaving panel is taken out of flow so the entering panel defines the
   container height — avoids vertical jumps when panels differ in height. */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.32s ease;
  will-change: transform, opacity;
}

.slide-next-leave-active,
.slide-prev-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* Forward (moving to a tab on the right) */
.slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Backward (moving to a tab on the left) */
.slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: opacity 0.2s ease;
    transform: none !important;
  }
}
</style>
