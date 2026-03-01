<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60">
    <!-- Card Header (minimal iOS/Android style) -->
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <v-icon
            name="md-sportssoccer"
            class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0"
          />
          <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white truncate">
            {{ viewMode === 'carousel' ? 'Matches' : 'All Rounds' }}
          </h2>
          <span class="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
            {{ viewMode === 'carousel' ? (roundLabel || '') : `${allRounds.length} rounds` }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- View All / Back (iOS-style text link) -->
          <button
            v-if="!loading && fixtures.length > 0"
            @click="toggleViewMode"
            class="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-1"
          >
            {{ viewMode === 'carousel' ? 'View All' : 'Back' }}
          </button>

          <!-- Carousel navigation dots + arrows -->
          <template v-if="viewMode === 'carousel' && maxSlides > 1">
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
        v-if="loading || loadingAll"
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
        v-else-if="fixtures.length === 0 && viewMode === 'carousel'"
        class="text-center py-10 text-gray-400 dark:text-gray-500"
      >
        <v-icon
          name="md-sportssoccer"
          class="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700"
        />
        <p class="text-[13px]">No matches available</p>
      </div>

      <!-- ═══════════ CAROUSEL VIEW ═══════════ -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
        mode="out-in"
      >
        <div v-if="viewMode === 'carousel' && fixtures.length > 0" key="carousel" class="relative">
          <div
            class="overflow-hidden"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
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
                    class="fixture-cell px-3 py-3 active:bg-gray-50 dark:active:bg-gray-700/30 transition-colors"
                  >
                    <!-- Time label -->
                    <div class="text-center mb-2">
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
                        <div class="tabular-nums" :class="hasScores(fixture) ? 'text-[20px] font-bold text-gray-900 dark:text-white' : ''">
                          <template v-if="hasScores(fixture)">
                            {{ getHomeScore(fixture) }}<span class="text-gray-300 dark:text-gray-600 mx-0.5">-</span>{{ getAwayScore(fixture) }}
                          </template>
                          <span v-else class="text-[11px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wider">vs</span>
                        </div>
                        <span
                          :class="[
                            getFixtureStateClass(fixture),
                            isMatchLive(fixture) ? 'animate-pulse' : '',
                          ]"
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
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  <div
                    v-for="(fixture, fIdx) in slideFixtures"
                    :key="fixture.name + '-' + fIdx"
                    class="fixture-cell flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/20 transition-colors"
                  >
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
                      <div class="tabular-nums" :class="hasScores(fixture) ? 'text-[13px] font-bold text-gray-900 dark:text-white' : ''">
                        <template v-if="hasScores(fixture)">
                          {{ getHomeScore(fixture) }}<span class="text-gray-300 dark:text-gray-600 mx-px">-</span>{{ getAwayScore(fixture) }}
                        </template>
                        <span v-else class="text-[10px] font-semibold text-gray-300 dark:text-gray-600">vs</span>
                      </div>
                      <span
                        :class="[
                          getFixtureStateClass(fixture),
                          isMatchLive(fixture) ? 'animate-pulse' : '',
                        ]"
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

                    <!-- Time -->
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                      {{ formatMatchTime(fixture.starting_at) }}
                    </span>
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

        <!-- ═══════════ ALL ROUNDS LIST VIEW ═══════════ -->
        <div v-else-if="viewMode === 'list'" key="list" class="all-rounds-list max-h-[70vh] overflow-y-auto scroll-smooth" ref="allRoundsContainer">
          <div
            v-for="(round, rIdx) in allRounds"
            :key="'round-' + rIdx"
            :ref="(el) => { if (round.is_current && el) currentRoundEl = el as HTMLElement }"
            class="round-group"
            :style="{ animationDelay: `${rIdx * 50}ms` }"
          >
            <!-- Section Header (iOS grouped style) -->
            <button
              @click="toggleRound(rIdx)"
              class="w-full flex items-center justify-between px-3 py-2 transition-colors group sticky top-0 z-10"
              :class="[
                round.is_current
                  ? 'bg-emerald-50/90 dark:bg-emerald-900/20 backdrop-blur-sm'
                  : 'bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm',
              ]"
            >
              <div class="flex items-center gap-2">
                <!-- Accent dot for current -->
                <div
                  v-if="round.is_current"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"
                />
                <span
                  class="text-[12px] font-semibold tracking-wide"
                  :class="round.is_current ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'"
                >
                  Round {{ round.name }}
                </span>
                <span
                  v-if="round.is_current"
                  class="text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase"
                >
                  Now
                </span>
                <span
                  v-else-if="round.finished"
                  class="text-[10px] text-gray-400 dark:text-gray-500"
                >
                  · Done
                </span>
                <span class="text-[10px] text-gray-300 dark:text-gray-600">
                  {{ round.fixtures?.length || 0 }}
                </span>
              </div>
              <v-icon
                name="hi-chevron-right"
                class="w-3 h-3 text-gray-300 dark:text-gray-600 transition-transform duration-300"
                :class="{ 'rotate-90': expandedRounds.has(rIdx) }"
              />
            </button>

            <!-- Round Fixtures (Collapsible) -->
            <div
              class="round-fixtures-wrapper overflow-hidden"
              :style="{
                maxHeight: expandedRounds.has(rIdx) ? `${(round.fixtures?.length || 0) * 56 + 8}px` : '0px',
                opacity: expandedRounds.has(rIdx) ? 1 : 0,
              }"
            >
              <div class="divide-y divide-gray-100 dark:divide-gray-700/40">
                <div
                  v-for="(fixture, fIdx) in (round.fixtures || [])"
                  :key="fixture.name + '-' + fIdx"
                  class="fixture-row flex items-center gap-1.5 px-3 py-2 transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                  :style="{ animationDelay: `${fIdx * 30}ms` }"
                  :class="{ 'fixture-enter': expandedRounds.has(rIdx) }"
                >
                  <!-- Date/Time -->
                  <span class="text-[9px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums w-14 text-center leading-tight">
                    {{ formatShortDate(fixture.starting_at) }}
                  </span>

                  <!-- Home Team -->
                  <div class="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                    <span
                      :class="getTeamResultClass(fixture, 'home')"
                      class="text-[11px] font-medium truncate text-right"
                      :title="getTeamName(getHomeParticipant(fixture))"
                    >
                      {{ getTeamName(getHomeParticipant(fixture)) }}
                    </span>
                    <TeamLogo :team="getHomeParticipant(fixture)" size="sm" />
                  </div>

                  <!-- Score -->
                  <div class="flex flex-col items-center shrink-0 min-w-[40px]">
                    <div class="tabular-nums" :class="hasScores(fixture) ? 'text-[12px] font-bold text-gray-900 dark:text-white' : ''">
                      <template v-if="hasScores(fixture)">
                        {{ getHomeScore(fixture) }}<span class="text-gray-300 dark:text-gray-600 mx-px">-</span>{{ getAwayScore(fixture) }}
                      </template>
                      <span v-else class="text-[9px] font-semibold text-gray-300 dark:text-gray-600">vs</span>
                    </div>
                    <span
                      :class="[
                        getFixtureStateClass(fixture),
                        isMatchLive(fixture) ? 'animate-pulse' : '',
                      ]"
                      class="text-[8px] leading-none px-1 py-px rounded-full font-semibold"
                    >
                      {{ getFixtureStateText(fixture) }}
                    </span>
                  </div>

                  <!-- Away Team -->
                  <div class="flex items-center gap-1.5 flex-1 min-w-0">
                    <TeamLogo :team="getAwayParticipant(fixture)" size="sm" />
                    <span
                      :class="getTeamResultClass(fixture, 'away')"
                      class="text-[11px] font-medium truncate"
                      :title="getTeamName(getAwayParticipant(fixture))"
                    >
                      {{ getTeamName(getAwayParticipant(fixture)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from "vue";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { useToast } from "@/composables/useToast";
import { useMediaQuery } from "@/composables/useMediaQuery";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";

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

// View mode: carousel (default) or list (all rounds)
const viewMode = ref<'carousel' | 'list'>('carousel');
const allRounds = ref<FootballRoundResponse[]>([]);
const loadingAll = ref(false);
const expandedRounds = ref<Set<number>>(new Set());
const allRoundsContainer = ref<HTMLElement | null>(null);
const currentRoundEl = ref<HTMLElement | null>(null);

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

    // Fetch rounds for the stage
    const rounds: FootballRoundResponse[] = await footballFixtureService.getFixturesByStageAndCurrentRound(stageUuid);

    // Find the current round, or fallback to the first one
    const round = rounds.find((r) => r.is_current === true) || rounds[0];
    currentRound.value = round;

    // Extract fixtures from the round
    fixtures.value = round?.fixtures ?? [];
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

/**
 * Short date format for the list view (e.g. "Sat 15")
 */
const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
  const time = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
};

// ── All Rounds: load & toggle ──

/**
 * Loads all rounds for the current stage and switches to list view.
 */
const loadAllRounds = async () => {
  try {
    loadingAll.value = true;
    error.value = null;

    const rounds = await footballFixtureService.getAllFixturesByStage(props.stageUuid);
    allRounds.value = rounds;

    // Auto-expand the current round
    expandedRounds.value.clear();
    const currentIdx = rounds.findIndex((r) => r.is_current);
    if (currentIdx !== -1) {
      expandedRounds.value.add(currentIdx);
    }

    viewMode.value = 'list';

    // Auto-scroll to the current round after DOM render
    await nextTick();
    setTimeout(() => {
      scrollToCurrentRound();
    }, 150);
  } catch (err) {
    showErrorToast("Error loading all rounds");
    console.error("Error fetching all fixtures by stage:", err);
  } finally {
    loadingAll.value = false;
  }
};

/**
 * Toggle between carousel and list views
 */
const toggleViewMode = () => {
  if (viewMode.value === 'carousel') {
    loadAllRounds();
  } else {
    viewMode.value = 'carousel';
    allRounds.value = [];
    expandedRounds.value.clear();
  }
};

/**
 * Toggle expansion of a specific round
 */
const toggleRound = (roundIndex: number) => {
  if (expandedRounds.value.has(roundIndex)) {
    expandedRounds.value.delete(roundIndex);
  } else {
    expandedRounds.value.add(roundIndex);
  }
  // Force reactivity
  expandedRounds.value = new Set(expandedRounds.value);
};

/**
 * Smooth scroll to the current round element with retry for DOM readiness
 */
const scrollToCurrentRound = () => {
  const attemptScroll = (retries = 3) => {
    if (currentRoundEl.value && allRoundsContainer.value) {
      const container = allRoundsContainer.value;
      const element = currentRoundEl.value;
      // Calculate offset relative to the scrollable container
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollOffset = elementRect.top - containerRect.top + container.scrollTop - 8;
      container.scrollTo({
        top: Math.max(0, scrollOffset),
        behavior: 'smooth',
      });
    } else if (retries > 0) {
      // Retry if DOM refs aren't ready yet
      setTimeout(() => attemptScroll(retries - 1), 100);
    }
  };
  attemptScroll();
};

const { inPlayChannel } = useAblyBroadcast();

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
    // Reset to carousel view on stage change
    viewMode.value = 'carousel';
    allRounds.value = [];
    expandedRounds.value.clear();
    await loadStageFixtures(newUuid);
  }
});

onBeforeUnmount(() => {
  inPlayChannel.unsubscribe("matchedFixtures");
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

/* ── All Rounds list animations ── */

/* Round group entrance */
.round-group {
  animation: roundFadeIn 0.3s ease-out both;
}

@keyframes roundFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fixture items staggered entrance */
.fixture-enter {
  animation: fixtureSlideIn 0.25s ease-out both;
}

@keyframes fixtureSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Collapsible content smooth transition */
.round-fixtures-wrapper {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease;
}

/* Custom scrollbar — minimal like iOS */
.all-rounds-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.2) transparent;
}

.all-rounds-list::-webkit-scrollbar {
  width: 3px;
}

.all-rounds-list::-webkit-scrollbar-track {
  background: transparent;
}

.all-rounds-list::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.2);
  border-radius: 9999px;
}

.all-rounds-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.4);
}

/* Transition utilities */
.duration-400 {
  transition-duration: 400ms;
}
</style>
