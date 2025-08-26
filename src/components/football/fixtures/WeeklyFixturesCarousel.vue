<template>
  <section class="w-full mt-6">
  <div v-if="loading" class="text-center py-8 text-gray-400 dark:text-gray-500">
    <div class="flex items-center justify-center">
      <v-icon name="pr-spinner" class="w-6 h-6 text-gray-400 dark:text-gray-500" animation="spin" aria-hidden="true" />
      <span class="sr-only">Loading fixtures...</span>
    </div>
  </div>
  <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
  <div v-else-if="fixtures.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">No fixtures this week.</div>
    <div v-else class="relative w-full">
      <div ref="carousel" class="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar w-full px-1 md:px-6">
        <div v-for="(fixture, idx) in fixtures" :key="idx"
          class="min-w-[90vw] max-w-[95vw] sm:min-w-[320px] sm:max-w-[340px] flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-5 flex flex-col items-center justify-center shadow transition-all duration-300 relative group hover:scale-[1.02] hover:shadow-lg cursor-pointer">
          <div class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">{{ fixture.league.name }}</span>
          </div>
          <div class="flex flex-col items-center mb-2">
            <span class="text-xs text-gray-400 text-center">{{ fixture.starting_at }}</span>
          </div>
          <div class="flex items-center gap-6 w-full justify-center">
            <div class="flex flex-col items-center">
              <img :src="(fixture.participants[0]?.image_path) || '/img/default-avatar.svg'" :alt="fixture.participants[0]?.name || 'Team 1'" class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700" />
              <span :class="resultClass(fixture, 0)" class="mt-2 text-sm text-center max-w-[90px] truncate">{{ fixture.participants[0]?.name || 'Team 1' }}</span>
            </div>
            <div class="flex flex-col items-center min-w-[60px]">
              <span class="text-2xl font-bold">
                <template v-if="getScore(fixture, 0) !== null && getScore(fixture, 1) !== null">
                  {{ getScore(fixture, 0) }} - {{ getScore(fixture, 1) }}
                </template>
                <template v-else>-</template>
              </span>
              <span class="text-xs text-gray-400 mt-1">{{ fixture.football_state.name }}</span>
            </div>
            <div class="flex flex-col items-center">
              <img :src="(fixture.participants[1]?.image_path) || '/img/default-avatar.svg'" :alt="fixture.participants[1]?.name || 'Equipo'" class="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700" />
              <span :class="resultClass(fixture, 1)" class="mt-2 text-sm text-center max-w-[90px] truncate">{{ fixture.participants[1]?.name || 'Equipo' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center mt-4 w-full">
        <div class="flex items-center gap-4">
              <button @click="scrollLeft" class="group p-1.5 rounded-full focus:outline-none" aria-label="Previous">
            <v-icon name="hi-solid-arrow-left" class="text-2xl text-gray-400 group-hover:text-emerald-500 transition"/>
          </button>
          <div class="flex gap-2">
            <span v-for="(fixture, idx) in fixtures" :key="idx"
              :class="[
                currentCard === idx
                  ? 'bg-emerald-500 w-6 h-2.5 rounded-full'
                  : 'bg-gray-300 dark:bg-gray-700 w-2.5 h-2.5 rounded-full',
                'transition-all duration-200 cursor-pointer'
              ]"
              @click="scrollToCard(idx)"
            ></span>
          </div>
          <button @click="scrollRight" class="group p-1.5 rounded-full focus:outline-none" aria-label="Next">
            <v-icon name="hi-solid-arrow-right" class="text-2xl text-gray-400 group-hover:text-emerald-500 transition"/>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import FootballFixtureService from '@/services/football/fixture/FootballFixtureService';

const fixtures = ref([]);
const loading = ref(true);
const error = ref(null);
const carousel = ref(null);
const currentCard = ref(0);

const getScore = (fixture, participantIdx) => {
  const participant = fixture.participants[participantIdx];
  const cs = participant?.current_score;
  if (cs && typeof cs.score === 'number') return cs.score;
  if (Array.isArray(fixture.scores) && fixture.scores.length > 0) {
    const s = fixture.scores.find(sc => sc.participant === (participantIdx === 0 ? 'home' : 'away'));
    if (s && typeof s.score === 'number') return s.score;
  }
  return null;
};

const fetchFixtures = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await FootballFixtureService.getFixturesForTheWeek();
    if (Array.isArray(response)) {
      fixtures.value = response;
    } else {
      error.value = 'Failed to fetch fixtures.';
    }
  } catch (e) {
    error.value = 'Error connecting to the service.';
  } finally {
    loading.value = false;
  }
};

const resultClass = (fixture, participantIdx) => {
  const participant = fixture.participants[participantIdx];
  const other = fixture.participants[participantIdx === 0 ? 1 : 0];

  const pWin = !!participant?.meta?.winner;
  const oWin = !!other?.meta?.winner;

  if (pWin && !oWin) return 'font-semibold text-emerald-600 dark:text-emerald-400';
  if (!pWin && oWin) return 'text-gray-500 dark:text-gray-500 line-through';
  return 'text-gray-700 dark:text-gray-200';
};

const scrollLeft = () => {
  if (fixtures.value.length === 0) return;
  let newIdx = currentCard.value - 1;
  if (newIdx < 0) newIdx = 0;
  scrollToCard(newIdx);
};
const scrollRight = () => {
  if (fixtures.value.length === 0) return;
  let newIdx = currentCard.value + 1;
  if (newIdx > fixtures.value.length - 1) newIdx = fixtures.value.length - 1;
  scrollToCard(newIdx);
};

const scrollToCard = (idx) => {
  if (!carousel.value) return;
  const card = carousel.value.children[idx];
  if (!card) return;

  const carouselRect = carousel.value.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  const scrollLeft = carousel.value.scrollLeft + (cardRect.left - carouselRect.left) - (carouselRect.width / 2 - cardRect.width / 2);
  carousel.value.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  currentCard.value = idx;
};

onMounted(async () => {
  await fetchFixtures();
  await nextTick();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const startMs = todayStart.getTime();
  const endMs = todayEnd.getTime();

  const toMs = (ts) => {
    if (ts == null) return null;
    return ts > 1e12 ? ts : ts * 1000;
  };

  const todayIndex = fixtures.value.findIndex((fixture) => {
    const ts = toMs(fixture.starting_at_timestamp) ?? (fixture.starting_at ? Date.parse(fixture.starting_at.replace(' ', 'T')) : null);
    return ts != null && ts >= startMs && ts <= endMs;
  });

  if (todayIndex !== -1) scrollToCard(todayIndex);
});

watch(fixtures, (newFixtures) => {
  if (newFixtures.length > 0 && currentCard.value === 0) {
    scrollToCard(0);
  }
});
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
