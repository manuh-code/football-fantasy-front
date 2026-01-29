<template>
  <div
    class="w-full mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Card Body -->
    <div class="p-6">
      <div
        v-if="loading"
        class="text-center py-8 text-gray-400 dark:text-gray-500"
      >
        <div class="flex items-center justify-center">
          <v-icon
            name="pr-spinner"
            class="w-6 h-6 text-gray-400 dark:text-gray-500"
            animation="spin"
            aria-hidden="true"
          />
          <span class="sr-only">Loading rounds...</span>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-500">
        {{ error }}
      </div>

      <div
        v-else-if="rounds.length === 0"
        class="text-center py-8 text-gray-400 dark:text-gray-500"
      >
        No rounds available.
      </div>

      <div v-else class="w-full">
        <!-- Rounds selector -->
        <div
          class="overflow-x-auto hide-scrollbar px-2 py-2"
          ref="roundsWrapper"
        >
          <div class="flex gap-2 items-center">
            <button
              v-for="(r, i) in rounds"
              :key="r.name + i"
              @click="selectRound(i)"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition transform flex items-center justify-center gap-2',
                selectedRound === i
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg round-selected'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200',
              ]"
            >
              <div
                class="truncate max-w-[8rem] flex items-center justify-center"
              >
                <span>Round {{ r.name }}</span>
                <span
                  v-if="r.games_in_current_week"
                  class="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-400 relative"
                >
                  <span
                    class="absolute inset-0 rounded-full animate-ping bg-emerald-300 dark:bg-emerald-400 opacity-50"
                  ></span>
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Fixtures for selected round -->
        <div class="mt-4">
          <div
            v-if="selectedFixtures.length === 0"
            class="text-center py-8 text-gray-400 dark:text-gray-500"
          >
            No fixtures for this round.
          </div>
          <div
            v-else
            ref="carousel"
            class="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar w-full px-1 md:px-6"
          >
            <div
              v-for="(fixture, idx) in selectedFixtures"
              :key="fixture.fixture_id || idx"
              :class="[
                'min-w-[90vw] max-w-[95vw] sm:min-w-[320px] sm:max-w-[340px] flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-5 flex flex-col items-center justify-center shadow transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                isFixtureLive(fixture) ? 'ring-2 ring-red-500 ring-opacity-50 bg-red-50 dark:bg-red-900/10' : ''
              ]"
            >
              <!-- Live indicator -->
              <div
                v-if="isFixtureLive(fixture)"
                class="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium"
              >
                <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              
              <div
                class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  >{{ fixture.league?.name }}</span
                >
              </div>
              <div class="flex flex-col items-center mb-2">
                <span class="text-xs text-gray-400 text-center">{{
                  fixture.starting_at
                }}</span>
              </div>
              <div class="flex items-center gap-6 w-full justify-center">
                <div class="flex flex-col items-center">
                  <img
                    :src="
                      fixture.participants[0]?.image_path ||
                      '/img/default-avatar.svg'
                    "
                    :alt="fixture.participants[0]?.name || 'Team 1'"
                    class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                  <span
                    :class="resultClass(fixture, 0)"
                    class="mt-2 text-sm text-center max-w-[90px] truncate"
                    >{{ fixture.participants[0]?.name || "Team 1" }}</span
                  >
                </div>
                <div class="flex flex-col items-center min-w-[60px]">
                  <span class="text-2xl font-bold">
                    <template
                      v-if="
                        getScore(fixture, 0) !== null &&
                        getScore(fixture, 1) !== null
                      "
                    >
                      {{ getScore(fixture, 0) }} - {{ getScore(fixture, 1) }}
                    </template>
                    <template v-else>-</template>
                  </span>
                  <span class="text-xs text-gray-400 mt-1">{{
                    fixture.football_state?.name
                  }}</span>
                </div>
                <div class="flex flex-col items-center">
                  <img
                    :src="
                      fixture.participants[1]?.image_path ||
                      '/img/default-avatar.svg'
                    "
                    :alt="fixture.participants[1]?.name || 'Team 2'"
                    class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  />
                  <span
                    :class="resultClass(fixture, 1)"
                    class="mt-2 text-sm text-center max-w-[90px] truncate"
                    >{{ fixture.participants[1]?.name || "Team 2" }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center mt-4 w-full">
          <div class="flex items-center gap-4">
            <button
              @click="scrollLeft"
              class="group p-1.5 rounded-full focus:outline-none"
              aria-label="Previous"
            >
              <v-icon
                name="hi-solid-arrow-left"
                class="text-2xl text-gray-400 group-hover:text-emerald-500 transition"
              />
            </button>
            <div class="flex gap-2">
              <span
                v-for="(f, i) in selectedFixtures"
                :key="i"
                :class="[
                  currentCard === i
                    ? 'bg-emerald-500 w-6 h-2.5 rounded-full'
                    : 'bg-gray-300 dark:bg-gray-700 w-2.5 h-2.5 rounded-full',
                  'transition-all duration-200 cursor-pointer',
                ]"
                @click="scrollToCard(i)"
              ></span>
            </div>
            <button
              @click="scrollRight"
              class="group p-1.5 rounded-full focus:outline-none"
              aria-label="Next"
            >
              <v-icon
                name="hi-solid-arrow-right"
                class="text-2xl text-gray-400 group-hover:text-emerald-500 transition"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import FootballFixtureService from "@/services/football/fixture/FootballFixtureService";
import { useFootballLeagueStore } from "@/store/football/league/useFootballLeagueStore";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { FootballFixtureResponse } from "@/interfaces/football/fixture/FootballFixtureResponse";
import { useAblyBroadcast } from "@/composables/broadcast/useAblyBroadcast";

const { inPlayChannel } = useAblyBroadcast();

const rounds = ref<FootballRoundResponse[]>([]);
const loading = ref(true);
const error = ref("");
const selectedRound = ref(0);
const carousel = ref<HTMLElement | null>(null);
const roundsWrapper = ref<HTMLElement | null>(null);

const store = useFootballLeagueStore();

const getScore = (fixture: FootballFixtureResponse, participantIdx: number) => {
  const participant = fixture.participants?.[participantIdx];
  const cs = participant?.current_score;
  if (cs && typeof cs.score === "number") return cs.score;
  if (Array.isArray(fixture.scores) && fixture.scores.length > 0) {
    const s = fixture.scores.find(
      (
        sc: import("@/interfaces/football/fixture/ScoreResponse").ScoreResponse
      ) => sc.score?.participant === (participantIdx === 0 ? "home" : "away")
    );
    if (s && typeof s.score?.goals === "number") return s.score.goals;
  }
  return null;
};

const resultClass = (
  fixture: FootballFixtureResponse,
  participantIdx: number
) => {
  const participant = fixture.participants?.[participantIdx];
  const other = fixture.participants?.[participantIdx === 0 ? 1 : 0];
  const pWin = !!participant?.meta?.winner;
  const oWin = !!other?.meta?.winner;
  if (pWin && !oWin)
    return "font-semibold text-emerald-600 dark:text-emerald-400";
  if (!pWin && oWin) return "text-gray-500 dark:text-gray-500 line-through";
  return "text-gray-700 dark:text-gray-200";
};

const fetchRounds = async () => {
  loading.value = true;
  error.value = "";
  rounds.value = [];
  const seasonUuid = store.getCurrentFootballSeason()?.uuid;
  if (!seasonUuid) {
    error.value = "No season selected.";
    loading.value = false;
    return;
  }

  try {
    const res = await FootballFixtureService.getRoundBySeasonFixtures(
      seasonUuid
    );
    if (Array.isArray(res)) {
      rounds.value = res;
      // select current round by default when available
      const currentIdx = rounds.value.findIndex((r) => !!r.is_current);
      selectedRound.value = currentIdx !== -1 ? currentIdx : 0;
      // ensure layout settles and center selected round
      await nextTick();
      centerRound(selectedRound.value);
    } else {
      rounds.value = [];
    }
  } catch (e) {
    error.value = "Failed to load rounds.";
  } finally {
    loading.value = false;
  }
};

const selectRound = (idx: number) => {
  selectedRound.value = idx;
  // small delay to allow layout then center
  nextTick(() => {
    if (!carousel.value) return;
    carousel.value.scrollLeft = 0;
    centerRound(idx);
  });
};

const centerRound = (idx: number) => {
  if (!roundsWrapper.value) return;
  const wrapper = roundsWrapper.value;
  const button = wrapper.querySelectorAll("button")[idx] as
    | HTMLElement
    | undefined;
  if (!button) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();
  const targetScroll =
    wrapper.scrollLeft +
    (btnRect.left - wrapperRect.left) -
    (wrapperRect.width / 2 - btnRect.width / 2);
  wrapper.scrollTo({ left: targetScroll, behavior: "smooth" });
};

const selectedFixtures = computed(() => {
  return rounds.value[selectedRound.value]?.fixtures || [];
});

const currentCard = ref(0);

const scrollLeft = () => {
  if (selectedFixtures.value.length === 0) return;
  let newIdx = currentCard.value - 1;
  if (newIdx < 0) newIdx = 0;
  scrollToCard(newIdx);
};

const scrollRight = () => {
  if (selectedFixtures.value.length === 0) return;
  let newIdx = currentCard.value + 1;
  if (newIdx > selectedFixtures.value.length - 1)
    newIdx = selectedFixtures.value.length - 1;
  scrollToCard(newIdx);
};

const scrollToCard = (idx: number) => {
  if (!carousel.value) return;
  const card = (carousel.value as HTMLElement).children[idx] as
    | HTMLElement
    | undefined;
  if (!card) return;

  const carouselRect = (carousel.value as HTMLElement).getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  const targetScroll: number =
    (carousel.value as HTMLElement).scrollLeft +
    (cardRect.left - carouselRect.left) -
    (carouselRect.width / 2 - cardRect.width / 2);
  (carousel.value as HTMLElement).scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });
  currentCard.value = idx;
};

// reset pagination when fixtures change (new round)
watch(selectedFixtures, (newVal) => {
  if (newVal.length > 0) {
    // ensure layout then go to first card or live fixture
    nextTick(() => {
      // First, look for live matches
      const liveFixtures = newVal
        .map((fixture, index) => ({ fixture, index }))
        .filter(({ fixture }) => isFixtureLive(fixture));
      
      if (liveFixtures.length > 0) {
        // If there are live matches, focus on the first one
        const firstLiveIndex = liveFixtures[0].index;
        scrollToCard(firstLiveIndex);
        console.log(`[RoundFixtureCarousel] Auto-focused on live fixture at index ${firstLiveIndex}`);
      } else {
        // If no live matches, go to the first match
        scrollToCard(0);
      }
    });
    currentCard.value = 0;
  } else {
    currentCard.value = 0;
  }
});

onMounted(async () => {
  await fetchRounds();
  
  // Subscribe to real-time match updates
  inPlayChannel.subscribe("matchedFixtures", (msg) => {
    const matchedFixtures: FootballFixtureResponse[] = msg.data;
    
    console.log(`[RoundFixtureCarousel] Received ${matchedFixtures.length} matchedFixtures from Ably`);
    updateFixturesInRounds(matchedFixtures);
  });
});

// Function to check if a match is live
const isFixtureLive = (fixture: FootballFixtureResponse): boolean => {
  const now = Date.now();
  const startTime = fixture.starting_at_timestamp * 1000; // Convert to milliseconds
  const matchDuration = fixture.length * 60 * 1000; // Convert minutes to milliseconds
  const endTime = startTime + matchDuration;
  
  // A match is live if:
  // 1. It has started (now >= startTime)
  // 2. It hasn't ended (now <= endTime)
  // 3. Or the state indicates it's in progress
  const isInTimeWindow = now >= startTime && now <= endTime;
  const isInProgress = fixture.football_state?.name?.toLowerCase().includes('in progress') || 
                      fixture.football_state?.name?.toLowerCase().includes('live') ||
                      fixture.football_state?.name?.toLowerCase().includes('playing');
  
  return isInTimeWindow || isInProgress;
};

// Function to focus on live matches
const focusLiveFixtures = () => {
  const liveFixtures = selectedFixtures.value
    .map((fixture, index) => ({ fixture, index }))
    .filter(({ fixture }) => isFixtureLive(fixture));
  
  if (liveFixtures.length > 0) {
    // Focus on the first live match
    const firstLiveIndex = liveFixtures[0].index;
    scrollToCard(firstLiveIndex);
    
    console.log(`[RoundFixtureCarousel] Focused on live fixture at index ${firstLiveIndex}`);
  }
};

// Función para actualizar los fixtures en tiempo real
const updateFixturesInRounds = (updatedFixtures: FootballFixtureResponse[]) => {
  if (!updatedFixtures || updatedFixtures.length === 0) return;
  
  let hasLiveUpdates = false;
  
  // Actualizar fixture por fixture usando fixture_id como identificador principal
  updatedFixtures.forEach(updatedFixture => {
    const fixtureId = updatedFixture.fixture_id;
    
    // Verificar si este fixture está en vivo
    const isLive = isFixtureLive(updatedFixture);
    if (isLive) hasLiveUpdates = true;
    
    // Buscar y actualizar el fixture específico en todas las rondas
    rounds.value.forEach(round => {
      if (round.fixtures) {
        const fixtureIndex = round.fixtures.findIndex(
          existingFixture => existingFixture.fixture_id === fixtureId
        );
        
        if (fixtureIndex !== -1) {
          // Actualizar solo el fixture específico manteniendo el resto de datos
          round.fixtures[fixtureIndex] = {
            ...round.fixtures[fixtureIndex],
            ...updatedFixture
          };
          
          console.log(`[RoundFixtureCarousel] Updated fixture ${fixtureId}${isLive ? ' (LIVE)' : ''}`);
        }
      }
    });
  });
  
  // If there are live match updates, focus on them
  if (hasLiveUpdates) {
    // Wait a tick for the UI to update
    nextTick(() => {
      focusLiveFixtures();
    });
  }
};

onBeforeUnmount(() => {
  inPlayChannel.unsubscribe("matchedFixtures");
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.round-selected::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 9999px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.12);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .round-selected {
    transform: none !important;
  }

  .animate-ping {
    animation: none !important;
  }
}
</style>
