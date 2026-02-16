<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Header -->
    <div
      class="px-3 py-3 sm:px-4 sm:py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between">
        <h2
          class="text-base sm:text-lg font-medium text-gray-900 dark:text-white"
        >
          Weekly Fixtures
        </h2>
        <div class="flex items-center gap-1" v-if="maxSlides > 1">
          <button
            @click="prevSlide"
            :disabled="currentSlide === 0"
            class="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <v-icon name="hi-chevron-left" class="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            @click="nextSlide"
            :disabled="currentSlide >= maxSlides - 1"
            class="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <v-icon name="hi-chevron-right" class="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500"
      >
        <div class="flex items-center justify-center gap-2">
          <v-icon
            name="pr-spinner"
            class="w-5 h-5 text-gray-400 dark:text-gray-500"
            animation="spin"
            aria-hidden="true"
          />
          <span class="text-sm">Loading...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-6 sm:py-8">
        <p class="text-sm text-red-500 mb-3">{{ error }}</p>
        <button
          @click="fetchFixtures"
          class="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="fixtures.length === 0"
        class="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500"
      >
        <v-icon
          name="hi-calendar"
          class="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600"
        />
        <p class="text-sm">No fixtures this week</p>
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
              <div
                class="gap-2 sm:gap-3"
                :class="
                  isMobile
                    ? 'flex justify-center'
                    : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                "
              >
                <div
                  v-for="fixture in slideFixtures"
                  :key="fixture.uuid"
                  class="fixture-card bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  :class="isMobile ? 'p-4 w-full max-w-sm mx-auto' : 'p-3'"
                >
                  <!-- Match Date/Time -->
                  <div class="text-center" :class="isMobile ? 'mb-4' : 'mb-3'">
                    <div
                      :class="isMobile ? 'text-sm' : 'text-xs'"
                      class="text-gray-500 dark:text-gray-400"
                    >
                      {{ formatMatchDate(fixture.starting_at) }}
                    </div>
                    <div
                      :class="
                        isMobile
                          ? 'text-base font-semibold'
                          : 'text-xs font-medium'
                      "
                      class="text-gray-700 dark:text-gray-300"
                    >
                      {{ formatMatchTime(fixture.starting_at) }}
                    </div>
                  </div>

                  <!-- Teams and Score -->
                  <div class="flex items-center justify-between gap-2">
                    <!-- Home Team -->
                    <div class="flex flex-col items-center flex-1 min-w-0">
                      <div :class="isMobile ? 'mb-2' : 'mb-1'">
                        <TeamLogo
                          :team="fixture.participants[0]"
                          :size="isMobile ? 'lg' : 'md'"
                        />
                      </div>
                      <span
                        :class="[
                          getTeamResultClass(fixture, 0),
                          isMobile ? 'text-sm font-medium' : 'text-xs',
                        ]"
                        class="text-center truncate w-full px-1"
                        :title="getTeamName(fixture.participants[0])"
                      >
                        {{ getTeamName(fixture.participants[0]) }}
                      </span>
                    </div>

                    <!-- Score Section -->
                    <div
                      class="flex flex-col items-center"
                      :class="isMobile ? 'min-w-[70px]' : 'min-w-[50px]'"
                    >
                      <div
                        :class="
                          isMobile ? 'text-2xl mb-2' : 'text-lg sm:text-xl mb-1'
                        "
                        class="font-bold text-gray-900 dark:text-white"
                      >
                        <template v-if="hasScores(fixture)">
                          {{ getHomeScore(fixture) }}-{{
                            getAwayScore(fixture)
                          }}
                        </template>
                        <template v-else>
                          <span
                            class="text-gray-400"
                            :class="isMobile ? 'text-lg' : 'text-sm'"
                            >VS</span
                          >
                        </template>
                      </div>
                      <span
                        :class="[
                          getStateClass(fixture.state),
                          isMobile
                            ? 'text-sm px-2 py-1'
                            : 'text-xs px-1.5 py-0.5',
                          isMatchInProgress(fixture) ? 'animate-pulse' : '',
                        ]"
                        class="rounded-full whitespace-nowrap"
                      >
                        {{ getStateText(fixture.state) }}
                      </span>
                    </div>

                    <!-- Away Team -->
                    <div class="flex flex-col items-center flex-1 min-w-0">
                      <div :class="isMobile ? 'mb-2' : 'mb-1'">
                        <TeamLogo
                          :team="fixture.participants[1]"
                          :size="isMobile ? 'lg' : 'md'"
                        />
                      </div>
                      <span
                        :class="[
                          getTeamResultClass(fixture, 1),
                          isMobile ? 'text-sm font-medium' : 'text-xs',
                        ]"
                        class="text-center truncate w-full px-1"
                        :title="getTeamName(fixture.participants[1])"
                      >
                        {{ getTeamName(fixture.participants[1]) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide Indicators -->
        <div class="flex justify-center mt-3 gap-1.5" v-if="maxSlides > 1">
          <button
            v-for="slide in maxSlides"
            :key="slide"
            @click="currentSlide = slide - 1"
            :class="[
              'rounded-full transition-all duration-200',
              isMobile ? 'w-2 h-2' : 'w-1.5 h-1.5',
              currentSlide === slide - 1
                ? 'bg-emerald-500 scale-125'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
            ]"
          />
        </div>

        <!-- Mobile Swipe Hint -->
        <div v-if="isMobile && maxSlides > 1" class="text-center mt-2">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            <v-icon name="md-comparearrows-round" class="w-3 h-3 inline-block mr-1" />
            Swipe to navigate • {{ currentSlide + 1 }} of {{ maxSlides }}
          </p>
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

/* Responsive fixture cards */
.fixture-card {
  min-height: 130px; /* More compact without league badge */
}

@media (min-width: 640px) {
  .fixture-card {
    min-height: 120px; /* Even more compact on desktop/tablet */
  }
}

/* Better image loading states - more minimal without circles */
img {
  background: transparent;
}

/* Hover states for better interaction feedback */
.fixture-card:hover {
  transform: translateY(-1px);
}

/* Ensure proper text truncation */
.truncate-team-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-height: 2.4em;
}
</style>
