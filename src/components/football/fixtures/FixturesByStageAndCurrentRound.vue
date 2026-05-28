<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
    <!-- Card Header (minimal iOS/Android style) -->
    <div class="px-4 py-3">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <v-icon
            name="md-sportssoccer"
            class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0"
          />
          <!-- Stack vertically on mobile, inline on sm+ -->
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 min-w-0 flex-1 leading-tight">
            <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
              Matches
            </h2>
            <span class="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {{ roundLabel || '' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <!-- View All (opens RoundFixturesDrawer) -->
          <button
            v-if="!loading && fixtures.length > 0"
            @click="roundsDrawerOpen = true"
            class="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-1"
          >
            View All
          </button>

          <!-- Carousel navigation dots + arrows -->
          <template v-if="maxSlides > 1">
            <span class="text-[11px] text-gray-300 dark:text-gray-600">|</span>
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
    </div>

    <!-- Card Body -->
    <div class="px-1 pb-3">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-10"
      >
        <v-icon
          name="pr-spinner"
          class="w-5 h-5 text-gray-300 dark:text-gray-600"
          animation="spin"
          aria-hidden="true"
        />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-10 px-4">
        <p class="text-[13px] text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
        <button
          @click="loadStageFixtures(props.stageUuid)"
          class="text-[13px] font-medium text-red-500 dark:text-red-400 hover:underline"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="fixtures.length === 0"
        class="text-center py-10 text-gray-400 dark:text-gray-500"
      >
        <v-icon
          name="md-sportssoccer"
          class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700"
        />
        <p class="text-[13px]">No matches available</p>
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
                  <!-- LIVE badge (top-left, iOS style) -->
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
                    <!-- Home -->
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

                    <!-- Score center -->
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
                      <!-- State badge (only when NOT live — live uses top badge) -->
                      <span
                        v-if="!isMatchLive(fixture)"
                        :class="getFixtureStateClass(fixture)"
                        class="text-[9px] px-1.5 py-px rounded-full font-semibold mt-0.5 tracking-wide"
                      >
                        {{ getFixtureStateText(fixture) }}
                      </span>
                    </div>

                    <!-- Away -->
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

              <!-- Desktop: clean rows -->
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
                  <!-- LIVE top-left pill (desktop) -->
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
                    <!-- Home Team -->
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

                    <!-- Score -->
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

                    <!-- Away Team -->
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

                    <!-- Time (only when not live) -->
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
                ? 'bg-emerald-500 w-4'
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

    <!-- Rounds drawer (replaces the old list view) -->
    <RoundFixturesDrawer
      :is-open="roundsDrawerOpen"
      :stage-uuid="props.stageUuid"
      @close="roundsDrawerOpen = false"
      @fixture-selected="onFixtureSelectedFromRounds"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch } from "vue";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { useToast } from "@/composables/useToast";
import { useMediaQuery } from "@/composables/useMediaQuery";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";
import FixtureMatchCenter from "./FixtureMatchCenter.vue";
import RoundFixturesDrawer from "./RoundFixturesDrawer.vue";

// Props
const props = defineProps<{
  stageUuid: string;
}>();

// State
const fixtures = ref<FootballFixtureResponse[]>([]);
const currentRound = ref<FootballRoundResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const currentSlide = ref(0);

// Match Center drawer state
const selectedFixtureUuid = ref<string | null>(null);
const matchCenterOpen = ref(false);

const openMatchCenter = (fixture: FootballFixtureResponse) => {
  selectedFixtureUuid.value = fixture.uuid;
  matchCenterOpen.value = true;
};

// Rounds drawer state
const roundsDrawerOpen = ref(false);

const onFixtureSelectedFromRounds = (fixtureUuid: string) => {
  selectedFixtureUuid.value = fixtureUuid;
  matchCenterOpen.value = true;
};

// Carousel swipe — listener registered manually with { passive: false }
// so preventDefault works without browser-intervention warnings
const carouselSwipeEl = ref<HTMLElement | null>(null);

// Touch/Swipe state
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const isSwiping = ref(false);

// Composables
const { error: showErrorToast } = useToast();
const isMobile = useMediaQuery("(max-width: 639px)");

// Computed
const fixturesPerSlide = computed(() => {
  return isMobile.value ? 1 : 6;
});

const paginatedFixtures = computed(() => {
  const pages: FootballFixtureResponse[][] = [];
  const perSlide = fixturesPerSlide.value;
  for (let i = 0; i < fixtures.value.length; i += perSlide) {
    pages.push(fixtures.value.slice(i, i + perSlide));
  }
  return pages;
});

const maxSlides = computed(() => paginatedFixtures.value.length);

// Methods

/**
 * Fetches fixtures for the given stage UUID.
 */
const loadStageFixtures = async (stageUuid: string) => {
  try {
    loading.value = true;
    error.value = null;
    currentSlide.value = 0;
    fixtures.value = [];
    currentRound.value = null;

    if (!stageUuid) {
      error.value = "No stage selected";
      return;
    }

    // Fetch fixtures directly for the current round
    fixtures.value = await footballFixtureService.getFixturesByStageAndCurrentRound(stageUuid);
  } catch (err) {
    error.value = "Error loading current round fixtures";
    showErrorToast("Error loading fixtures");
    console.error("Error fetching fixtures by stage and current round:", err);
  } finally {
    loading.value = false;
  }
};

const nextSlide = () => {
  if (currentSlide.value < maxSlides.value - 1) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

// Touch/Swipe handlers
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

  if (Math.abs(deltaX) < swipeThreshold || deltaY > 100) {
    return;
  }

  if (deltaX > 0 && currentSlide.value < maxSlides.value - 1) {
    nextSlide();
  } else if (deltaX < 0 && currentSlide.value > 0) {
    prevSlide();
  }
};

/**
 * Computed label for the round subtitle (e.g. "Regular Season · Round 8")
 */
const roundLabel = computed(() => {
  if (currentRound.value?.name) return `Round ${currentRound.value.name}`;
  return 'Fixtures for the current round';
});

// ── Participant helpers (use meta.location to find home/away) ──

const getHomeParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined => {
  return fixture.participants?.find((p) => p.meta?.location === 'home');
};

const getAwayParticipant = (fixture: FootballFixtureResponse): FootballTeamResponse | undefined => {
  return fixture.participants?.find((p) => p.meta?.location === 'away');
};

const getTeamName = (team: FootballTeamResponse | undefined): string => {
  return team?.name || "TBD";
};

// ── Score helpers ──

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

const getHomeScore = (fixture: FootballFixtureResponse): number => {
  return getHomeParticipant(fixture)?.current_score?.score ?? 0;
};

const getAwayScore = (fixture: FootballFixtureResponse): number => {
  return getAwayParticipant(fixture)?.current_score?.score ?? 0;
};

// ── Match state helpers (derived from meta.winner + fixture.state when available) ──

const isMatchLive = (fixture: FootballFixtureResponse): boolean => {
  // If state exists, use it
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    return (
      stateName.includes("live") ||
      stateName.includes("in play") ||
      stateName.includes("ht") ||
      stateName.includes("half time")
    );
  }
  // Without state, infer: has scores but no winner decided yet and match time has started
  if (!hasScores(fixture)) return false;
  const home = getHomeParticipant(fixture);
  const away = getAwayParticipant(fixture);
  const matchStarted = new Date(fixture.starting_at).getTime() <= Date.now();
  const noWinnerDecided = home?.meta?.winner === null && away?.meta?.winner === null;
  return matchStarted && noWinnerDecided && hasScores(fixture);
};

const isMatchFinished = (fixture: FootballFixtureResponse): boolean => {
  // If state exists, use it
  if (fixture.state) {
    return fixture.state.state.includes("FT");
  }
  // Without state, infer from meta.winner (not null means finished)
  const home = getHomeParticipant(fixture);
  return home?.meta?.winner !== null && home?.meta?.winner !== undefined;
};

const getFixtureStateText = (fixture: FootballFixtureResponse): string => {
  // Use state if available
  if (fixture.state) {
    const stateName = fixture.state.name.toLowerCase();
    if (stateName.includes("finished") || stateName.includes("ft")) return "FT";
    if (stateName.includes("live") || stateName.includes("in play")) return "LIVE";
    if (stateName.includes("ht") || stateName.includes("half time")) return "HT";
    if (stateName.includes("postponed")) return "POSTPONED";
    if (stateName.includes("cancelled")) return "CANCELLED";
    return fixture.state.name;
  }
  // Infer from data
  if (isMatchFinished(fixture)) return "FT";
  if (isMatchLive(fixture)) return "LIVE";
  // Not started
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

// ── Team result class ──

const getTeamResultClass = (
  fixture: FootballFixtureResponse,
  location: 'home' | 'away',
): string => {
  if (!hasScores(fixture) || !isMatchFinished(fixture)) {
    return "text-gray-600 dark:text-gray-300";
  }

  const homeScore = getHomeScore(fixture);
  const awayScore = getAwayScore(fixture);

  if (homeScore === awayScore) {
    return "text-yellow-600 dark:text-yellow-400 font-medium";
  }

  const teamWon =
    (location === 'home' && homeScore > awayScore) ||
    (location === 'away' && awayScore > homeScore);

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

const { inPlayChannel } = useAblyBroadcast();

// Attach swipe listeners with passive:false so preventDefault is honored
// without the "Ignored attempt to cancel a touchmove event" warning.
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

// Lifecycle
onMounted(async () => {
  await loadStageFixtures(props.stageUuid);

  inPlayChannel.subscribe("matchedFixtures", (msg) => {
    const matchedFixtures: FootballFixtureResponse[] = msg.data;
    console.log("Received matchedFixtures update via Ably:", matchedFixtures);
  });
});

// Re-fetch when stageUuid changes
watch(() => props.stageUuid, async (newUuid) => {
  if (newUuid) {
    await loadStageFixtures(newUuid);
  }
});

onBeforeUnmount(() => {
  inPlayChannel.unsubscribe("matchedFixtures");
  if (carouselSwipeEl.value) detachSwipeListeners(carouselSwipeEl.value);
});
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

/* Tabular numbers for scores */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* ── iOS-style list cell tap feedback ── */
.fixture-cell {
  -webkit-tap-highlight-color: transparent;
}

/* ── Live dot container ── */
.live-dot {
  line-height: 0;
}
</style>
