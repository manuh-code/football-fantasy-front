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
          :aria-label="$t('home.league.sectionsAriaLabel')"
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

        <!-- Ad: only on this content surface (a league + stage are selected). -->
        <AdUnit :slot="AD_SLOTS.homeContent" />
      </template>
    </template>

    <template v-else>
      <div class="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 py-14 px-6 text-center">
        <span
          class="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="relative mx-auto mb-4 grid place-items-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/15"
        >
          <v-icon name="md-sportssoccer" class="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="relative text-callout font-bold text-gray-900 dark:text-white mb-1">
          {{ $t('home.league.empty.title') }}
        </h3>
        <p class="relative text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          {{ $t('home.league.empty.subtitle') }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted, type Component } from "vue";
import { useI18n } from "vue-i18n";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import HomeHeaderMenu from "@/components/home/HomeHeaderMenu.vue";
import TabsMenu from "@/components/ui/TabsMenu.vue";
import AdUnit from "@/components/ads/AdUnit.vue";
import { AD_SLOTS } from "@/config/ads";

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

const { t } = useI18n();
const store = useFootballLeagueStore();
const hasLeague = computed(() => store.existLeague());

// Active stage/season context, driven by the HomeHeaderMenu.
const selectedStageUuid = ref("");
const selectedSeasonUuid = ref("");

// ── Tabs ──
type TabKey = "standings" | "fixtures" | "playoffs" | "statistics" | "versus" | "totw";

const tabs = computed<{ key: TabKey; label: string; icon: string }[]>(() => [
  { key: "standings", label: t("home.league.tabs.standings"), icon: "bi-trophy-fill" },
  { key: "fixtures", label: t("home.league.tabs.fixtures"), icon: "md-sportssoccer" },
  { key: "playoffs", label: t("home.league.tabs.playoffs"), icon: "hi-solid-view-grid" },
  { key: "statistics", label: t("home.league.tabs.statistics"), icon: "hi-solid-chart-bar" },
  { key: "versus", label: t("home.league.tabs.versus"), icon: "md-comparearrows-round" },
  { key: "totw", label: t("home.league.tabs.totw"), icon: "bi-star-fill" },
]);

const activeTab = ref<TabKey>("standings");

// Direction-aware slide: "next" when moving right, "prev" when moving left.
const transitionName = ref<"slide-next" | "slide-prev">("slide-next");
const isAnimating = ref(false);

const tabIndex = (key: string) => tabs.value.findIndex((tab) => tab.key === key);

const selectTab = (key: string) => {
  if (key === activeTab.value) return;
  transitionName.value = tabIndex(key) > tabIndex(activeTab.value) ? "slide-next" : "slide-prev";
  activeTab.value = key as TabKey;
};

const activeComponent = computed<Component>(() => {
  switch (activeTab.value) {
    case "fixtures":
    case "playoffs":
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
  // Fixtures and Playoffs render the same LeagueFixtures panel; the tab only
  // decides which competition mode it opens in (regular season vs. knockout).
  if (activeTab.value === "fixtures" || activeTab.value === "playoffs") {
    return {
      stageUuid: selectedStageUuid.value,
      seasonUuid: selectedSeasonUuid.value,
      mode: activeTab.value === "playoffs" ? "playoffs" : "regular",
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
