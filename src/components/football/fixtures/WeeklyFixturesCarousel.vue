<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <!-- Card Header -->
    <div class="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0"
          >
            <v-icon
              name="hi-calendar"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Weekly Fixtures
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              This week's matches
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2" v-if="maxSlides > 1">
          <span class="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {{ currentSlide + 1 }}/{{ maxSlides }}
          </span>
          <div class="flex items-center gap-0.5">
            <button
              @click="prevSlide"
              :disabled="currentSlide === 0"
              class="p-1 rounded-md text-gray-400 dark:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <v-icon name="hi-chevron-left" class="w-4 h-4" />
            </button>
            <button
              @click="nextSlide"
              :disabled="currentSlide >= maxSlides - 1"
              class="p-1 rounded-md text-gray-400 dark:text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <v-icon name="hi-chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4 sm:p-6">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="text-center py-8 text-gray-400 dark:text-gray-500"
    >
      <v-icon
        name="pr-spinner"
        class="w-5 h-5 mx-auto text-gray-300 dark:text-gray-600"
        animation="spin"
        aria-hidden="true"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-sm text-red-500 mb-3">{{ error }}</p>
      <button
        @click="fetchFixtures"
        class="px-3 py-1.5 text-sm text-red-500 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="fixtures.length === 0"
      class="text-center py-8 text-gray-400 dark:text-gray-500"
    >
      <v-icon
        name="hi-calendar"
        class="w-6 h-6 mx-auto mb-1.5 text-gray-300 dark:text-gray-600"
      />
      <p class="text-xs">No fixtures this week</p>
    </div>

    <!-- Fixtures Carousel -->
    <div v-else class="relative">
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
            <!-- Mobile: single card per slide -->
            <div v-if="isMobile">
              <div
                v-for="fixture in slideFixtures"
                :key="fixture.uuid"
                class="py-2"
              >
                <!-- Date -->
                <div class="text-center mb-3">
                  <span class="text-xs text-gray-400 dark:text-gray-500">
                    {{ formatMatchDate(fixture.starting_at) }} · {{ formatMatchTime(fixture.starting_at) }}
                  </span>
                </div>

                <!-- Match row -->
                <div class="flex items-center justify-between gap-3">
                  <!-- Home Team -->
                  <div class="flex items-center gap-2.5 flex-1 min-w-0">
                    <TeamLogo :team="fixture.participants[0]" size="md" />
                    <span
                      :class="getTeamResultClass(fixture, 0)"
                      class="text-sm truncate"
                      :title="getTeamName(fixture.participants[0])"
                    >
                      {{ getTeamName(fixture.participants[0]) }}
                    </span>
                  </div>

                  <!-- Score -->
                  <div class="flex flex-col items-center shrink-0 min-w-[60px]">
                    <div class="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                      <template v-if="hasScores(fixture)">
                        {{ getHomeScore(fixture) }} - {{ getAwayScore(fixture) }}
                      </template>
                      <span v-else class="text-sm text-gray-300 dark:text-gray-600 font-medium">vs</span>
                    </div>
                    <span
                      :class="[
                        getStateClass(fixture.state),
                        isMatchInProgress(fixture) ? 'animate-pulse' : '',
                      ]"
                      class="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 font-medium"
                    >
                      {{ getStateText(fixture.state) }}
                    </span>
                  </div>

                  <!-- Away Team -->
                  <div class="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                    <span
                      :class="getTeamResultClass(fixture, 1)"
                      class="text-sm truncate text-right"
                      :title="getTeamName(fixture.participants[1])"
                    >
                      {{ getTeamName(fixture.participants[1]) }}
                    </span>
                    <TeamLogo :team="fixture.participants[1]" size="md" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop: grid layout -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              <div
                v-for="fixture in slideFixtures"
                :key="fixture.uuid"
                class="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <!-- Home Team -->
                <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span
                    :class="getTeamResultClass(fixture, 0)"
                    class="text-xs truncate text-right"
                    :title="getTeamName(fixture.participants[0])"
                  >
                    {{ getTeamName(fixture.participants[0]) }}
                  </span>
                  <TeamLogo :team="fixture.participants[0]" size="sm" />
                </div>

                <!-- Score -->
                <div class="flex flex-col items-center shrink-0 min-w-[52px]">
                  <div class="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                    <template v-if="hasScores(fixture)">
                      {{ getHomeScore(fixture) }} - {{ getAwayScore(fixture) }}
                    </template>
                    <span v-else class="text-xs text-gray-300 dark:text-gray-600 font-medium">vs</span>
                  </div>
                  <span
                    :class="[
                      getStateClass(fixture.state),
                      isMatchInProgress(fixture) ? 'animate-pulse' : '',
                    ]"
                    class="text-[10px] leading-tight px-1.5 py-px rounded-full font-medium"
                  >
                    {{ getStateText(fixture.state) }}
                  </span>
                </div>

                <!-- Away Team -->
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <TeamLogo :team="fixture.participants[1]" size="sm" />
                  <span
                    :class="getTeamResultClass(fixture, 1)"
                    class="text-xs truncate"
                    :title="getTeamName(fixture.participants[1])"
                  >
                    {{ getTeamName(fixture.participants[1]) }}
                  </span>
                </div>

                <!-- Time (desktop) -->
                <span class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 tabular-nums">
                  {{ formatMatchTime(fixture.starting_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide Indicators (dots) -->
      <div class="flex justify-center mt-3 gap-1" v-if="maxSlides > 1">
        <button
          v-for="slide in maxSlides"
          :key="slide"
          @click="currentSlide = slide - 1"
          :class="[
            'rounded-full transition-all duration-200',
            'w-1.5 h-1.5',
            currentSlide === slide - 1
              ? 'bg-emerald-500 w-4'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600',
          ]"
        />
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { footballFixtureService } from "@/services/football/fixture/FootballFixtureService";
import { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { FootballTeamResponse } from "@/interfaces/football/team/FootballTeamResponse";
import { FootballStateResponse } from "@/interfaces/football/state/FootballStateResponse";
import { useToast } from "@/composables/useToast";
import { useMediaQuery } from "@/composables/useMediaQuery";
import TeamLogo from "@/components/football/ui/TeamLogo.vue";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";

// State
const fixtures = ref<FootballFixtureResponse[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentSlide = ref(0);

// Touch/Swipe state
const touchStartX = ref(0);
const touchEndX = ref(0);
const touchStartY = ref(0);
const touchEndY = ref(0);
const isSwiping = ref(false);

// Composables
const { error: showErrorToast } = useToast();
const isMobile = useMediaQuery("(max-width: 639px)"); // sm breakpoint

// Computed
const fixturesPerSlide = computed(() => {
  return isMobile.value ? 1 : 6; // 1 on mobile, 6 on desktop/tablet
});

const paginatedFixtures = computed(() => {
  const pages = [];
  const perSlide = fixturesPerSlide.value;
  for (let i = 0; i < fixtures.value.length; i += perSlide) {
    pages.push(fixtures.value.slice(i, i + perSlide));
  }
  return pages;
});

const maxSlides = computed(() => paginatedFixtures.value.length);

// Methods
const fetchFixtures = async () => {
  try {
    console.log("Fetching weekly fixtures...");
    loading.value = true;
    error.value = null;
    fixtures.value = await footballFixtureService.getFixturesForTheWeek();
  } catch (err) {
    error.value = "Error loading weekly fixtures";
    showErrorToast("Error loading fixtures");
    console.error("Error fetching weekly fixtures:", err);
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
    // Continue preventing scroll while swiping
    e.preventDefault();
    return;
  }
  
  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value);
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value);
  
  // Only consider it a swipe if horizontal movement is greater than vertical
  if (deltaX > deltaY && deltaX > 10) {
    isSwiping.value = true;
    // Prevent vertical scrolling when swiping horizontally
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
  const swipeThreshold = 50; // Minimum swipe distance in pixels
  const deltaX = touchStartX.value - touchEndX.value;
  const deltaY = Math.abs(touchStartY.value - touchEndY.value);
  
  // Only process horizontal swipes (ignore if vertical movement is too large)
  if (Math.abs(deltaX) < swipeThreshold || deltaY > 100) {
    return;
  }
  
  // Swipe left (next slide)
  if (deltaX > 0 && currentSlide.value < maxSlides.value - 1) {
    nextSlide();
  }
  // Swipe right (previous slide)
  else if (deltaX < 0 && currentSlide.value > 0) {
    prevSlide();
  }
};

const getTeamName = (team: FootballTeamResponse | undefined): string => {
  return team?.name || "TBD";
};

const hasScores = (fixture: FootballFixtureResponse): boolean => {
  // Check if both teams have current_score
  return (
    fixture.participants.length >= 2 &&
    fixture.participants[0]?.current_score !== null &&
    fixture.participants[1]?.current_score !== null
  );
};

const isMatchInProgress = (fixture: FootballFixtureResponse): boolean => {
  if (!fixture.state) return false;
  const stateName = fixture.state.name.toLowerCase();
  return (
    stateName.includes("live") ||
    stateName.includes("in play") ||
    stateName.includes("ht") ||
    stateName.includes("half time")
  );
};

const isMatchFinished = (fixture: FootballFixtureResponse): boolean => {
  if (!fixture.state) return false;
  const stateName = fixture.state.state;
  return stateName.includes("FT");
};

const getHomeScore = (fixture: FootballFixtureResponse): number => {
  // Score of the first participant (home)
  return fixture.participants[0]?.current_score?.score || 0;
};

const getAwayScore = (fixture: FootballFixtureResponse): number => {
  // Score of the second participant (away)
  return fixture.participants[1]?.current_score?.score || 0;
};

const getTeamResultClass = (
  fixture: FootballFixtureResponse,
  teamIndex: number,
): string => {
  // Only show result colors if the match has finished
  if (!hasScores(fixture) || !isMatchFinished(fixture)) {
    return "text-gray-600 dark:text-gray-300";
  }

  const homeScore = getHomeScore(fixture);
  const awayScore = getAwayScore(fixture);

  // Draw
  if (homeScore === awayScore) {
    return "text-yellow-600 dark:text-yellow-400 font-medium";
  }

  // Determine if this team won
  const isHomeTeam = teamIndex === 0;
  const teamWon =
    (isHomeTeam && homeScore > awayScore) ||
    (!isHomeTeam && awayScore > homeScore);

  return teamWon
    ? "text-emerald-600 dark:text-emerald-400 font-semibold" // Winner
    : "text-red-500 dark:text-red-400"; // Loser
};

const getStateClass = (state: FootballStateResponse | null): string => {
  if (!state)
    return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

  const stateName = state.name.toLowerCase();

  if (stateName.includes("finished") || stateName.includes("ft")) {
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  } else if (
    stateName.includes("live") ||
    stateName.includes("ht") ||
    stateName.includes("in play")
  ) {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  } else if (
    stateName.includes("postponed") ||
    stateName.includes("cancelled")
  ) {
    return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
  } else {
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  }
};

const getStateText = (state: FootballStateResponse | null): string => {
  if (!state) return "NS";

  // Show common abbreviations in English
  const stateName = state.name.toLowerCase();

  if (stateName.includes("finished") || stateName.includes("ft")) {
    return "FT";
  } else if (stateName.includes("live") || stateName.includes("in play")) {
    return "LIVE";
  } else if (stateName.includes("ht") || stateName.includes("half time")) {
    return "HT";
  } else if (stateName.includes("postponed")) {
    return "POSTPONED";
  } else if (stateName.includes("cancelled")) {
    return "CANCELLED";
  } else {
    return state.name;
  }
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

// Lifecycle
onMounted(async () => {

  await fetchFixtures();

  inPlayChannel.subscribe("matchedFixtures", (msg) => {
    const matchedFixtures: FootballFixtureResponse[] = msg.data;

    console.log("Received matchedFixtures update via Ably:", matchedFixtures);
  });
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
</style>
