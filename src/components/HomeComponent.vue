<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Home header: brand + stage switcher + profile (replaces the global HeaderMenu on Home) -->
    <HomeHeaderMenu
      v-model:stage-uuid="selectedStageUuid"
      v-model:season-uuid="selectedSeasonUuid"
    />

    <template v-if="hasLeague">
      <template v-if="selectedStageUuid">
        <!-- Linear scrollable tab menu (Standings / Fixtures / Statistics / Versus / TOTW) -->
        <TabsMenu
          :model-value="activeTab"
          :tabs="tabs"
          aria-label="League sections"
          @update:model-value="selectTab"
        />

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
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 px-6 text-center">
        <v-icon name="md-sportssoccer" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
        <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
          Select a league
        </h3>
        <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          Choose your favorite league to view fixtures and statistics
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from "vue";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import HomeHeaderMenu from "@/components/home/HomeHeaderMenu.vue";
import TabsMenu from "@/components/ui/TabsMenu.vue";

// Lazy-load heavy content panels. Keep the raw loaders so we can warm the
// chunks on mount — that way the slide transition has a resolved component to
// animate the first time the user switches tabs.
const loadStanding = () => import("@/components/football/leagues/LeagueStanding.vue");
const loadFixtures = () => import("@/components/football/fixtures/LeagueFixtures.vue");
const loadStatistics = () => import("@/components/football/leagues/LeagueStatistics.vue");
const loadVersus = () => import("@/components/football/player/versus/PlayerVersus.vue");
const loadTotw = () => import("@/components/football/teamOfTheWeek/TeamOfTheWeek.vue");

const LeagueStanding = defineAsyncComponent(loadStanding);
const LeagueFixtures = defineAsyncComponent(loadFixtures);
const LeagueStatistics = defineAsyncComponent(loadStatistics);
const PlayerVersus = defineAsyncComponent(loadVersus);
const TeamOfTheWeek = defineAsyncComponent(loadTotw);

const store = useFootballLeagueStore();
const hasLeague = computed(() => store.existLeague());

// Active stage/season context, driven by the HomeHeaderMenu.
const selectedStageUuid = ref("");
const selectedSeasonUuid = ref("");

// ── Tabs ──
type TabKey = "standings" | "fixtures" | "statistics" | "versus" | "totw";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "standings", label: "Standings", icon: "bi-trophy-fill" },
  { key: "fixtures", label: "Fixtures", icon: "md-sportssoccer" },
  { key: "statistics", label: "Statistics", icon: "hi-solid-chart-bar" },
  { key: "versus", label: "Versus", icon: "md-comparearrows-round" },
  { key: "totw", label: "TOTW", icon: "bi-star-fill" },
];

const activeTab = ref<TabKey>("standings");

// Direction-aware slide: "next" when moving right, "prev" when moving left.
const transitionName = ref<"slide-next" | "slide-prev">("slide-next");
const isAnimating = ref(false);

const tabIndex = (key: string) => tabs.findIndex((t) => t.key === key);

const selectTab = (key: string) => {
  if (key === activeTab.value) return;
  transitionName.value = tabIndex(key) > tabIndex(activeTab.value) ? "slide-next" : "slide-prev";
  activeTab.value = key as TabKey;
};

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case "fixtures":
      return LeagueFixtures;
    case "statistics":
      return LeagueStatistics;
    case "versus":
      return PlayerVersus;
    case "totw":
      return TeamOfTheWeek;
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
  if (activeTab.value === "versus") {
    return { seasonUuid: selectedSeasonUuid.value };
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
  loadVersus();
  loadTotw();
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
