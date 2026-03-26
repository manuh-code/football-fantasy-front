<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-colors duration-300">
    <!-- Header -->
    <div class="px-4 py-2.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <div>
          <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
            Draft Order
          </h3>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">
            Round {{ currentRound }}/{{ totalRounds }}
            · <span class="text-green-500">{{ onlineCount }}</span>/{{ totalMembers }} online
          </p>
        </div>
      </div>

      <!-- Round navigation -->
      <div class="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/60 rounded-lg p-0.5">
        <button
          :disabled="currentRound <= 1"
          class="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          @click="prevRound"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <span class="text-[11px] font-bold text-gray-700 dark:text-gray-300 min-w-[2.5rem] text-center tabular-nums">
          Rd {{ currentRound }}
        </span>
        <button
          :disabled="currentRound >= totalRounds"
          class="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          @click="nextRound"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Carousel -->
    <div class="relative">
      <!-- Scroll left -->
      <button
        v-if="canScrollLeft"
        class="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white/90 dark:bg-gray-700/90 backdrop-blur rounded-full shadow flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
        @click="scrollCarousel('left')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Picks -->
      <div
        ref="carouselRef"
        class="flex gap-1 overflow-x-auto scrollbar-hide scroll-smooth px-3 py-3"
        @scroll="updateScrollState"
      >
        <div
          v-for="entry in currentRoundEntries"
          :key="`${entry.round}-${entry.pick}`"
          class="flex-shrink-0 flex flex-col items-center transition-all duration-300"
          :class="[
            isCurrentTurn(entry.user) ? 'w-[4.5rem]' : 'w-[3.75rem]',
            {
              'opacity-35': !isOnline(entry.user) && !isCurrentTurn(entry.user),
            },
          ]"
        >
          <!-- Avatar container -->
          <div
            class="relative mb-1.5"
            :class="isCurrentTurn(entry.user) ? 'w-12 h-12' : 'w-10 h-10'"
          >
            <!-- Active turn glow ring -->
            <div
              v-if="isCurrentTurn(entry.user)"
              class="absolute -inset-1 rounded-full bg-amber-400/30 dark:bg-amber-500/20 animate-pulse-soft"
            />

            <!-- Avatar -->
            <div
              class="relative w-full h-full rounded-full border-2 overflow-hidden transition-all duration-300"
              :class="isCurrentTurn(entry.user)
                ? 'border-amber-500 dark:border-amber-400'
                : isOnline(entry.user)
                  ? 'border-green-500/70 dark:border-green-400/70'
                  : 'border-gray-200 dark:border-gray-600'"
            >
              <img
                v-if="entry.user.avatar"
                :src="entry.user.avatar"
                :alt="entry.user.firstname ?? ''"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-400 dark:text-gray-500"
              >
                {{ getInitials(entry.user) }}
              </div>
            </div>

            <!-- Pick badge -->
            <span
              class="absolute -bottom-0.5 -right-0.5 z-20 text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none border border-white dark:border-gray-800 transition-all duration-300"
              :class="isCurrentTurn(entry.user)
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'"
            >
              {{ entry.pick_in_round }}
            </span>

            <!-- Online indicator -->
            <span
              class="absolute -top-0.5 -right-0.5 z-20 w-2.5 h-2.5 rounded-full border-[1.5px] border-white dark:border-gray-800 transition-colors duration-300"
              :class="isOnline(entry.user) ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'"
            />
          </div>

          <!-- Name -->
          <span
            class="text-[10px] text-center leading-tight truncate w-full transition-colors duration-300"
            :class="isCurrentTurn(entry.user)
              ? 'font-bold text-amber-600 dark:text-amber-400'
              : isOnline(entry.user)
                ? 'font-medium text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-500'"
          >
            {{ entry.user.firstname ?? 'User' }}
          </span>
        </div>
      </div>

      <!-- Scroll right -->
      <button
        v-if="canScrollRight"
        class="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white/90 dark:bg-gray-700/90 backdrop-blur rounded-full shadow flex items-center justify-center text-gray-500 dark:text-gray-300 transition-colors"
        @click="scrollCarousel('right')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FantasyDraftOrderResponse } from '@/interfaces/fantasy/draft/FantasyDraftOrderResponse';
import { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse';
import { UserDataInterface } from '@/interfaces/user/userInterface';
import { computed, ref, nextTick, watch } from 'vue';

const props = defineProps<{
  fantasyLeague: FantasyLeaguesResponse;
  membersInDraftRoom: UserDataInterface[];
  activeRound?: number;
  currentTurnUserUuid?: string;
}>();

const draft = props.fantasyLeague.draft;
const draftOrder: FantasyDraftOrderResponse[] = draft?.draft_order || [];

const currentRound = ref(1);
const carouselRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const onlineUuids = computed(() =>
  new Set(props.membersInDraftRoom.map((m) => m.uuid).filter(Boolean))
);

const onlineCount = computed(() => props.membersInDraftRoom.length);

const totalMembers = computed(() => {
  const uniqueUuids = new Set(draftOrder.map((e) => e.user.uuid));
  return uniqueUuids.size;
});

const totalRounds = computed(() => {
  if (draftOrder.length === 0) return 1;
  return Math.max(...draftOrder.map((e) => e.round));
});

const currentRoundEntries = computed(() =>
  draftOrder
    .filter((e) => e.round === currentRound.value)
    .sort((a, b) => a.pick_in_round - b.pick_in_round)
);

function prevRound() {
  if (currentRound.value > 1) {
    currentRound.value--;
    scrollToStart();
  }
}

function nextRound() {
  if (currentRound.value < totalRounds.value) {
    currentRound.value++;
    scrollToStart();
  }
}

function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return;
  const scrollAmount = 200;
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  });
}

function scrollToStart() {
  nextTick(() => {
    if (carouselRef.value) {
      carouselRef.value.scrollTo({ left: 0, behavior: 'smooth' });
    }
    updateScrollState();
  });
}

function updateScrollState() {
  if (!carouselRef.value) return;
  const el = carouselRef.value;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
}

function isOnline(user: UserDataInterface): boolean {
  return onlineUuids.value.has(user.uuid);
}

function isCurrentTurn(user: UserDataInterface): boolean {
  return !!props.currentTurnUserUuid && user.uuid === props.currentTurnUserUuid;
}

function getInitials(user: UserDataInterface): string {
  const first = user.firstname?.charAt(0)?.toUpperCase() ?? '';
  const last = user.lastname?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '?';
}

watch(() => props.activeRound, (round) => {
  if (round && round >= 1 && round <= totalRounds.value) {
    currentRound.value = round;
    scrollToStart();
  }
});

watch(currentRoundEntries, () => {
  nextTick(() => updateScrollState());
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.08); }
}
.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}
</style>
