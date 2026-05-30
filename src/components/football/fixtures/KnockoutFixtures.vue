<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
    <!-- Card Header -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/40">
      <!-- Title row + carousel navigation -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <v-icon
            name="bi-trophy-fill"
            class="w-[18px] h-[18px] text-amber-500 dark:text-amber-400 shrink-0"
          />
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0 flex-1 leading-tight">
            <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
              Playoffs
            </h2>
            <span v-if="selectedKnockoutLabel" class="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {{ selectedKnockoutLabel }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Carousel navigation dots + arrows -->
          <template v-if="maxSlides > 1">
            <span class="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
              {{ currentSlide + 1 }}/{{ maxSlides }}
            </span>
            <button
              @click="prevSlide"
              :disabled="currentSlide === 0"
              class="p-0.5 rounded-full text-gray-400 dark:text-gray-500 disabled:opacity-20 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <v-icon name="hi-chevron-left" class="w-3.5 h-3.5" />
            </button>
            <button
              @click="nextSlide"
              :disabled="currentSlide >= maxSlides - 1"
              class="p-0.5 rounded-full text-gray-400 dark:text-gray-500 disabled:opacity-20 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <v-icon name="hi-chevron-right" class="w-3.5 h-3.5" />
            </button>
          </template>
        </div>
      </div>

      <!-- Stage select -->
      <div v-if="!stagesError">
        <SearchableSelectComponent
          v-model="selectedKnockoutUuid"
          :options="knockoutStages"
          value-key="uuid"
          label-key="name"
          placeholder="Select playoff stage"
          search-placeholder="Search stage..."
          :disabled="loadingStages || knockoutStages.length === 0"
          :loading="loadingStages"
          accent-color="amber"
          :searchable="knockoutStages.length > 5"
          :clearable="false"
        >
          <template #selected="{ option }">
            <span class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
              {{ (option.name_complete as string | null) || option.name }}
            </span>
            <span
              v-if="option.is_current"
              class="text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0 ml-2"
            >
              Current
            </span>
          </template>
          <template #option="{ option }">
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <span class="text-sm font-medium truncate">
                {{ (option.name_complete as string | null) || option.name }}
              </span>
              <span
                v-if="option.is_current"
                class="text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase shrink-0"
              >
                Current
              </span>
              <span
                v-else-if="option.finished"
                class="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0"
              >
                Done
              </span>
            </div>
          </template>
        </SearchableSelectComponent>
      </div>

      <!-- Stages load error -->
      <div v-else class="flex items-center justify-between gap-2 py-1">
        <p class="text-[12px] text-red-500 dark:text-red-400">{{ stagesError }}</p>
        <button
          @click="loadKnockoutStages(props.stageUuid)"
          class="text-[12px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Card Body -->
    <div class="px-1 pb-3 pt-3">
      <!-- Loading -->
      <div
        v-if="loadingStages || loadingFixtures"
        class="flex items-center justify-center py-10"
      >
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
        />
      </div>

      <!-- Fixtures error -->
      <div v-else-if="fixturesError" class="text-center py-10 px-4">
        <p class="text-[13px] text-red-500 dark:text-red-400 mb-3">{{ fixturesError }}</p>
        <button
          @click="retryFixtures"
          class="text-[13px] font-medium text-red-500 dark:text-red-400 hover:underline"
        >
          Retry
        </button>
      </div>

      <!-- Empty: no knockout stages -->
      <div
        v-else-if="knockoutStages.length === 0"
        class="text-center py-10 text-gray-400 dark:text-gray-500"
      >
        <v-icon
          name="bi-trophy"
          class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700"
        />
        <p class="text-[13px]">No playoffs available yet</p>
      </div>

      <!-- Empty: stage selected but no fixtures -->
      <div
        v-else-if="fixtures.length === 0 && selectedKnockoutUuid"
        class="text-center py-10 text-gray-400 dark:text-gray-500"
      >
        <v-icon
          name="md-sportssoccer"
          class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700"
        />
        <p class="text-[13px]">No matches in this stage</p>
      </div>

      <!-- Carousel -->
      <div v-else class="relative">
        <div
          ref="carouselSwipeEl"
          class="overflow-hidden"
        >
          <div
            class="flex transition-transform duration-300 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div
              v-for="(slideFixtures, slideIndex) in paginatedFixtures"
              :key="slideIndex"
              class="w-full flex-shrink-0"
            >
              <!-- Mobile: native list style -->
              <div v-if="isMobile" class="divide-y divide-gray-100 dark:divide-gray-700/50">
                <div
                  v-for="(fixture, fIdx) in slideFixtures"
                  :key="fixture.name + '-' + fIdx"
                  @click="openMatchCenter(fixture)"
                  class="fixture-cell relative transition-colors cursor-pointer"
                  :class="[
                    isMatchLive(fixture)
                      ? 'bg-red-50/40 dark:bg-red-900/5 border-l-[3px] border-l-red-500 dark:border-l-red-400'
                      : 'border-l-[3px] border-l-transparent',
                    'px-3 py-3 active:bg-gray-50 dark:active:bg-gray-700/30',
                  ]"
                >
                  <!-- LIVE badge -->
                  <div v-if="isMatchLive(fixture)" class="flex items-center gap-1.5 mb-2">
                    <span class="live-dot relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span class="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-widest uppercase">Live</span>
                  </div>

                  <!-- Time label (when NOT live) -->
                  <div v-else class="text-center mb-2">
                    <span class="text-[11px] font-medium text-gray-400 dark:text-gray-500 tracking-wide uppercase">
                      {{ formatMatchDate(fixture.starting_at) }} · {{ formatMatchTime(fixture.starting_at) }}
                    </span>
                  </div>

                  <!-- Match row -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <TeamLogo :team="getHomeParticipant(fixture)" size="md" />
                      <span
                        :class="getTeamResultClass(fixture, 'home')"
                        class="text-[13px] font-medium truncate"
                        :title="getTeamName(getHomeParticipant(fixture))"
                      >
                        {{ getTeamName(getHomeParticipant(fixture)) }}
                      </span>
                    </div>

                    <div class="flex flex-col items-center shrink-0 min-w-[56px]">
                      <div
                        class="tabular-nums"
                        :class="[
                          hasScores(fixture) ? 'font-bold text-gray-900 dark:text-white' : '',
                          isMatchLive(fixture) ? 'text-[22px]' : 'text-[20px]',
                        ]"
                      >
                        <template v-if="hasScores(fixture)">
                          {{ getHomeScore(fixture) }}<span :class="isMatchLive(fixture) ? 'text-red-300 dark:text-red-700 mx-0.5' : 'text-gray-300 dark:text-gray-600 mx-0.5'">-</span>{{ getAwayScore(fixture) }}
                        </template>
                        <span v-else class="text-[11px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider">vs</span>
                      </div>
                      <span
                        v-if="!isMatchLive(fixture)"
                        :class="getFixtureStateClass(fixture)"
                        class="text-[9px] px-1.5 py-px rounded-full font-semibold mt-0.5 tracking-wide"
                      >
                        {{ getFixtureStateText(fixture) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span
                        :class="getTeamResultClass(fixture, 'away')"
                        class="text-[13px] font-medium truncate text-right"
                        :title="getTeamName(getAwayParticipant(fixture))"
                      >
                        {{ getTeamName(getAwayParticipant(fixture)) }}
                      </span>
                      <TeamLogo :team="getAwayParticipant(fixture)" size="md" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Desktop: clean rows in grid -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px">
                <div
                  v-for="(fixture, fIdx) in slideFixtures"
                  :key="fixture.name + '-' + fIdx"
                  @click="openMatchCenter(fixture)"
                  class="fixture-cell relative rounded-xl transition-colors cursor-pointer"
                  :class="[
                    isMatchLive(fixture)
                      ? 'bg-red-50/30 dark:bg-red-900/5 ring-1 ring-red-200/60 dark:ring-red-800/30'
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/20',
                  ]"
                >
                  <div
                    v-if="isMatchLive(fixture)"
                    class="flex items-center gap-1 px-3 pt-2 pb-0.5"
                  >
                    <span class="live-dot relative flex h-1.5 w-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span class="text-[9px] font-bold text-red-500 dark:text-red-400 tracking-widest uppercase">Live</span>
                  </div>

                  <div class="flex items-center gap-2 px-3 py-2.5" :class="isMatchLive(fixture) ? 'pt-1' : ''">
                    <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span
                        :class="getTeamResultClass(fixture, 'home')"
                        class="text-[12px] font-medium truncate text-right"
                        :title="getTeamName(getHomeParticipant(fixture))"
                      >
                        {{ getTeamName(getHomeParticipant(fixture)) }}
                      </span>
                      <TeamLogo :team="getHomeParticipant(fixture)" size="sm" />
                    </div>

                    <div class="flex flex-col items-center shrink-0 min-w-[48px]">
                      <div
                        class="tabular-nums"
                        :class="[
                          hasScores(fixture) ? 'font-bold text-gray-900 dark:text-white' : '',
                          isMatchLive(fixture) ? 'text-[15px]' : 'text-[13px]',
                        ]"
                      >
                        <template v-if="hasScores(fixture)">
                          {{ getHomeScore(fixture) }}<span :class="isMatchLive(fixture) ? 'text-red-300 dark:text-red-700 mx-px' : 'text-gray-300 dark:text-gray-600 mx-px'">-</span>{{ getAwayScore(fixture) }}
                        </template>
                        <span v-else class="text-[10px] font-semibold text-gray-300 dark:text-gray-600">vs</span>
                      </div>
                      <span
                        v-if="!isMatchLive(fixture)"
                        :class="getFixtureStateClass(fixture)"
                        class="text-[9px] leading-none px-1.5 py-px rounded-full font-semibold"
                      >
                        {{ getFixtureStateText(fixture) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <TeamLogo :team="getAwayParticipant(fixture)" size="sm" />
                      <span
                        :class="getTeamResultClass(fixture, 'away')"
                        class="text-[12px] font-medium truncate"
                        :title="getTeamName(getAwayParticipant(fixture))"
                      >
                        {{ getTeamName(getAwayParticipant(fixture)) }}
                      </span>
                    </div>

                    <span v-if="!isMatchLive(fixture)" class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                      {{ formatMatchTime(fixture.starting_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide Indicators (iOS-style pill dots) -->
        <div class="flex justify-center mt-3 gap-1" v-if="maxSlides > 1">
          <button
            v-for="slide in maxSlides"
            :key="slide"
            @click="currentSlide = slide - 1"
            :class="[
              'rounded-full transition-all duration-200 h-[5px]',
              currentSlide === slide - 1
                ? 'bg-amber-500 w-4'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-[5px]',
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Match Center drawer -->
    <FixtureMatchCenter
      :is-open="matchCenterOpen"
      :fixture-uuid="selectedFixtureUuid"
      @close="matchCenterOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import type { FootballStageResponse } from "@/interfaces/football/stage/FootballStageResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import type { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { SearchableSelectComponent } from "@/components/ui";
import { useMediaQuery } from "@/composables/useMediaQuery";
import FixtureMatchCenter from "./FixtureMatchCenter.vue";

const props = defineProps<{
  stageUuid: string;
}>();

// ── State ──
const knockoutStages = ref<FootballStageResponse[]>([]);
const selectedKnockoutUuid = ref<string | null>(null);
const loadingStages = ref(false);
const stagesError = ref<string | null>(null);

const fixtures = ref<FootballFixtureResponse[]>([]);
const loadingFixtures = ref(false);
const fixturesError = ref<string | null>(null);

// Match center
const selectedFixtureUuid = ref<string | null>(null);
const matchCenterOpen = ref(false);

const openMatchCenter = (fixture: FootballFixtureResponse) => {
  selectedFixtureUuid.value = fixture.uuid;
  matchCenterOpen.value = true;
};

// ── Carousel ──
const isMobile = useMediaQuery("(max-width: 639px)");
const currentSlide = ref(0);

const fixturesPerSlide = computed(() => (isMobile.value ? 1 : 6));

const paginatedFixtures = computed(() => {
  const pages: FootballFixtureResponse[][] = [];
  const perSlide = fixturesPerSlide.value;
  for (let i = 0; i < fixtures.value.length; i += perSlide) {
    pages.push(fixtures.value.slice(i, i + perSlide));
  }
  return pages;
});

const maxSlides = computed(() => paginatedFixtures.value.length);

const nextSlide = () => {
  if (currentSlide.value < maxSlides.value - 1) currentSlide.value++;
};
const prevSlide = () => {
  if (currentSlide.value > 0) currentSlide.value--;
};

// Touch swipe (registered with passive:false to avoid browser intervention warning)
const carouselSwipeEl = ref<HTMLElement | null>(null);
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const isSwiping = ref(false);

const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
  isSwiping.value = false;
};

const handleTouchMove = (e: TouchEvent) => {
  if (isSwiping.value) {
    e.preventDefault();
    return;
  }
  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value);
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value);
  if (deltaX > deltaY && deltaX > 10) {
    isSwiping.value = true;
    e.preventDefault();
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!isSwiping.value) return;
  touchEndX.value = e.changedTouches[0].clientX;
  touchEndY.value = e.changedTouches[0].clientY;
  handleSwipe();
  isSwiping.value = false;
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const deltaX = touchStartX.value - touchEndX.value;
  const deltaY = Math.abs(touchStartY.value - touchEndY.value);
  if (Math.abs(deltaX) < swipeThreshold || deltaY > 100) return;
  if (deltaX > 0 && currentSlide.value < maxSlides.value - 1) nextSlide();
  else if (deltaX < 0 && currentSlide.value > 0) prevSlide();
};

const attachSwipeListeners = (el: HTMLElement) => {
  el.addEventListener("touchstart", handleTouchStart, { passive: true });
  el.addEventListener("touchmove", handleTouchMove, { passive: false });
  el.addEventListener("touchend", handleTouchEnd, { passive: true });
};
const detachSwipeListeners = (el: HTMLElement) => {
  el.removeEventListener("touchstart", handleTouchStart);
  el.removeEventListener("touchmove", handleTouchMove);
  el.removeEventListener("touchend", handleTouchEnd);
};

watch(carouselSwipeEl, (newEl, oldEl) => {
  if (oldEl) detachSwipeListeners(oldEl);
  if (newEl) attachSwipeListeners(newEl);
});

// ── Computed ──
const selectedKnockoutLabel = computed(() => {
  const s = knockoutStages.value.find((x) => x.uuid === selectedKnockoutUuid.value);
  if (!s) return "";
  return s.name_complete || s.name;
});

// ── Data loading ──
const loadKnockoutStages = async (parentStageUuid: string) => {
  if (!parentStageUuid) return;
  try {
    loadingStages.value = true;
    stagesError.value = null;
    knockoutStages.value = [];
    selectedKnockoutUuid.value = null;
    fixtures.value = [];
    currentSlide.value = 0;

    const result = await catalogService.getKnockoutStageByStage(parentStageUuid);
    knockoutStages.value = result;

    if (result.length > 0) {
      const current = result.find((s) => s.is_current === true);
      selectedKnockoutUuid.value = current ? current.uuid : result[0].uuid;
    }
  } catch (err) {
    console.error("Error loading knockout stages:", err);
    stagesError.value = "Couldn't load playoff stages.";
  } finally {
    loadingStages.value = false;
  }
};

const loadKnockoutFixtures = async (stageUuid: string) => {
  if (!stageUuid) return;
  try {
    loadingFixtures.value = true;
    fixturesError.value = null;
    fixtures.value = [];
    currentSlide.value = 0;

    fixtures.value = await footballFixtureService.getAllFixturesByStage(stageUuid);
  } catch (err) {
    console.error("Error loading knockout fixtures:", err);
    fixturesError.value = "Couldn't load fixtures for this stage.";
  } finally {
    loadingFixtures.value = false;
  }
};

const retryFixtures = () => {
  if (selectedKnockoutUuid.value) loadKnockoutFixtures(selectedKnockoutUuid.value);
};

// React to the parent stage UUID changing
watch(
  () => props.stageUuid,
  (uuid) => {
    if (uuid) loadKnockoutStages(uuid);
  },
);

// React to the selected knockout stage changing
watch(selectedKnockoutUuid, (uuid) => {
  if (uuid) loadKnockoutFixtures(uuid);
});

// Clamp currentSlide if maxSlides shrinks (e.g. screen resize from desktop → mobile)
watch(maxSlides, (n) => {
  if (currentSlide.value > Math.max(0, n - 1)) currentSlide.value = Math.max(0, n - 1);
});

onMounted(() => {
  if (props.stageUuid) loadKnockoutStages(props.stageUuid);
});

onBeforeUnmount(() => {
  if (carouselSwipeEl.value) detachSwipeListeners(carouselSwipeEl.value);
});

// ── Fixture helpers (mirror FixturesByStageAndCurrentRound) ──
const getHomeParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "home");

const getAwayParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined =>
  fixture.participants?.find((p) => p.meta?.location === "away");

const getTeamName = (team: FootballTeamResponse | undefined): string => team?.name || "TBD";

const hasScores = (fixture: FootballFixtureResponse): boolean => {
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  return (
    home?.current_score !== undefined &&
    home?.current_score !== null &&
    away?.current_score !== undefined &&
    away?.current_score !== null
  );
};

const getHomeScore = (fixture: FootballFixtureResponse): number =>
  getHomeParticipant(fixture)?.current_score?.score ?? 0;

const getAwayScore = (fixture: FootballFixtureResponse): number =>
  getAwayParticipant(fixture)?.current_score?.score ?? 0;

const isMatchLive = (fixture: FootballFixtureResponse): boolean => {
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    return (
      stateName.includes("live") ||
      stateName.includes("in play") ||
      stateName.includes("ht") ||
      stateName.includes("half time")
    );
  }
  if (!hasScores(fixture)) return false;
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  const matchStarted = new Date(fixture.starting_at).getTime() <= Date.now();
  const noWinnerDecided = home?.meta?.winner === null && away?.meta?.winner === null;
  return matchStarted && noWinnerDecided && hasScores(fixture);
};

const isMatchFinished = (fixture: FootballFixtureResponse): boolean => {
  if (fixture.state) return fixture.state.state.includes("FT");
  const home = getHomeParticipant(fixture);
  return home?.meta?.winner !== null && home?.meta?.winner !== undefined;
};

const getFixtureStateText = (fixture: FootballFixtureResponse): string => {
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    if (stateName.includes("finished") || stateName.includes("ft")) return "FT";
    if (stateName.includes("live") || stateName.includes("in play")) return "LIVE";
    if (stateName.includes("ht") || stateName.includes("half time")) return "HT";
    if (stateName.includes("postponed")) return "POSTPONED";
    if (stateName.includes("cancelled")) return "CANCELLED";
    return fixture.state.name;
  }
  if (isMatchFinished(fixture)) return "FT";
  if (isMatchLive(fixture)) return "LIVE";
  return formatMatchTime(fixture.starting_at);
};

const getFixtureStateClass = (fixture: FootballFixtureResponse): string => {
  if (isMatchFinished(fixture)) {
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  }
  if (isMatchLive(fixture)) {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  }
  return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
};

const getTeamResultClass = (
  fixture: FootballFixtureResponse,
  location: "home" | "away",
): string => {
  if (!hasScores(fixture) || !isMatchFinished(fixture)) {
    return "text-gray-600 dark:text-gray-300";
  }
  const homeScore = getHomeScore(fixture);
  const awayScore = getAwayScore(fixture);
  if (homeScore === awayScore) return "text-yellow-600 dark:text-yellow-400 font-medium";
  const teamWon =
    (location === "home" && homeScore > awayScore) ||
    (location === "away" && awayScore > homeScore);
  return teamWon
    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
    : "text-red-500 dark:text-red-400";
};

const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatMatchTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
/* Smooth transition for carousel */
.transition-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Improve touch responsiveness */
.overflow-hidden {
  touch-action: pan-y pinch-zoom;
  -webkit-overflow-scrolling: touch;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.fixture-cell {
  -webkit-tap-highlight-color: transparent;
}

.live-dot {
  line-height: 0;
}
</style>
