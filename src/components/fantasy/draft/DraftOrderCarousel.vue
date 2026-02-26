<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors duration-300"
    :class="
      isDraftComplete
        ? 'border-purple-300 dark:border-purple-700'
        : isMyTurn
          ? 'border-green-300 dark:border-green-700 ring-1 ring-green-200 dark:ring-green-800'
          : 'border-gray-200 dark:border-gray-700'
    "
  >
    <!-- Turn Status Banner (top, always visible when draft is active) -->
    <div
      v-if="currentTurn && !isDraftComplete"
      class="px-4 py-3 flex items-center gap-3 transition-all duration-300"
      :class="
        isMyTurn
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600'
          : 'bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600'
      "
    >
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-sm"
        :class="isMyTurn ? 'animate-pulse-soft' : ''"
      >
        <v-icon
          :name="isMyTurn ? 'hi-solid-cursor-click' : 'hi-solid-clock'"
          class="w-5 h-5 text-white"
        />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm text-white leading-tight">
          {{
            isMyTurn
              ? "Your turn to pick!"
              : `${currentTurn.user_name}'s turn...`
          }}
        </p>
        <p class="text-xs text-white/80 mt-0.5">
          Pick #{{ currentTurn.pick }} — Round {{ currentTurn.round }} · {{ currentTurn.team_name }}
        </p>
      </div>
      <div
        v-if="isMyTurn"
        class="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
      >
        <span class="text-xs font-bold text-white animate-pulse">GO!</span>
      </div>
    </div>

    <!-- Draft Complete Banner -->
    <div
      v-else-if="isDraftComplete"
      class="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600"
    >
      <p class="text-white font-bold text-sm text-center">
        🏆 Draft Complete! All players have been selected.
      </p>
    </div>

    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center"
          >
            <v-icon
              name="hi-solid-switch-horizontal"
              class="w-4 h-4 text-orange-600 dark:text-orange-400"
            />
          </div>
          <div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-white leading-tight"
            >
              Draft Order
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Round {{ currentRound }} &middot; Pick {{ currentPickInRound }} of
              {{ totalPicksPerRound }}
            </p>
          </div>
        </div>

        <!-- Round navigation -->
        <div class="flex items-center gap-1">
          <button
            :disabled="currentRound <= 1"
            class="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            @click="prevRound"
          >
            <v-icon name="hi-solid-chevron-left" class="w-4 h-4" />
          </button>
          <span
            class="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center"
          >
            Rd {{ currentRound }}
          </span>
          <button
            :disabled="currentRound >= totalRounds"
            class="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            @click="nextRound"
          >
            <v-icon name="hi-solid-chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Carousel -->
    <div class="relative px-2 py-3">
      <!-- Scroll left button -->
      <button
        v-if="canScrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        @click="scrollCarousel('left')"
      >
        <v-icon name="hi-solid-chevron-left" class="w-3.5 h-3.5" />
      </button>

      <!-- Scrollable picks container -->
      <div
        ref="carouselRef"
        class="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        @scroll="updateScrollState"
      >
        <div
          v-for="pick in currentRoundPicks"
          :key="`${pick.round}-${pick.pick}`"
          :ref="(el) => setPickRef(pick, el as HTMLElement)"
          class="flex-shrink-0 flex flex-col items-center gap-1 w-14 md:w-16 transition-all duration-300"
          :class="{
            'scale-110 z-10': isActivePick(pick),
            'opacity-40': isPastPick(pick) && !isDraftComplete,
          }"
        >
          <!-- Pick number badge -->
          <span
            class="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none transition-all duration-300"
            :class="pickBadgeClasses(pick)"
          >
            #{{ pick.pick_in_round }}
          </span>

          <!-- Avatar -->
          <div
            class="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300"
            :class="pickAvatarClasses(pick)"
          >
            <img
              :src="pick.user.avatar || '/img/default-avatar.svg'"
              :alt="`${pick.user.firstname} ${pick.user.lastname}`"
              class="w-full h-full rounded-full object-cover"
              @error="handleImageError"
            />
            <!-- Active turn pulsing ring -->
            <div
              v-if="isActivePick(pick)"
              class="absolute -inset-1 rounded-full border-2 animate-ping-slow"
              :class="
                isCurrentUser(pick.user.uuid)
                  ? 'border-green-400'
                  : 'border-yellow-400'
              "
            ></div>
            <!-- Current user indicator dot -->
            <div
              v-if="isCurrentUser(pick.user.uuid)"
              class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
              :class="
                isActivePick(pick)
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-emerald-500'
              "
            ></div>
          </div>

          <!-- User name (truncated) -->
          <span
            class="text-[10px] md:text-xs text-center leading-tight truncate w-full transition-colors duration-300"
            :class="pickNameClasses(pick)"
          >
            {{ pick.user.firstname }}
          </span>
        </div>
      </div>

      <!-- Scroll right button -->
      <button
        v-if="canScrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        @click="scrollCarousel('right')"
      >
        <v-icon name="hi-solid-chevron-right" class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Your next pick info (only when not your turn and draft is active) -->
    <div
      v-if="currentUserNextPick && !isMyTurn && !isDraftComplete"
      class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-900/30"
    >
      <p
        class="text-xs text-emerald-700 dark:text-emerald-300 text-center font-medium"
      >
        <v-icon
          name="hi-solid-lightning-bolt"
          class="w-3.5 h-3.5 inline -mt-0.5"
        />
        Your next pick: Round {{ currentUserNextPick.round }}, Pick #{{
          currentUserNextPick.pick_in_round
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { useUserStore } from "@/store";
import type { FantasyDraftOrderResponse } from "@/interfaces/fantasy/draft/FantasyDraftOrderResponse";
import type { DraftTurn } from "@/composables/useDraftChannel";

interface Props {
  draftOrder: FantasyDraftOrderResponse[];
  currentTurn?: DraftTurn | null;
  isDraftComplete?: boolean;
  isMyTurn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentTurn: null,
  isDraftComplete: false,
  isMyTurn: false,
});

const userStore = useUserStore();
const carouselRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const currentRound = ref(1);
const pickRefs = ref<Map<number, HTMLElement>>(new Map());

/** Check if a user is the authenticated user */
function isCurrentUser(userUuid: string): boolean {
  return userStore.getUserData?.uuid === userUuid;
}

/** Check if this pick is the currently active turn */
function isActivePick(pick: FantasyDraftOrderResponse): boolean {
  if (!props.currentTurn || props.isDraftComplete) return false;
  return (
    pick.round === props.currentTurn.round &&
    pick.pick_in_round === props.currentTurn.pick_in_round
  );
}

/** Check if this pick has already happened (before current turn) */
function isPastPick(pick: FantasyDraftOrderResponse): boolean {
  if (!props.currentTurn) return false;
  return pick.pick < props.currentTurn.pick;
}

/** Dynamic classes for pick number badge */
function pickBadgeClasses(pick: FantasyDraftOrderResponse): string {
  if (isActivePick(pick)) {
    return isCurrentUser(pick.user.uuid)
      ? 'bg-green-500 text-white shadow-sm'
      : 'bg-yellow-500 text-white shadow-sm';
  }
  if (isCurrentUser(pick.user.uuid)) {
    return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
  }
  if (isPastPick(pick) && !props.isDraftComplete) {
    return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
}

/** Dynamic classes for avatar container */
function pickAvatarClasses(pick: FantasyDraftOrderResponse): string {
  if (isActivePick(pick)) {
    return isCurrentUser(pick.user.uuid)
      ? 'border-green-500 dark:border-green-400 ring-2 ring-green-300 dark:ring-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/40'
      : 'border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-300 dark:ring-yellow-700 shadow-lg shadow-yellow-200 dark:shadow-yellow-900/40';
  }
  if (isCurrentUser(pick.user.uuid)) {
    return 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800';
  }
  if (isPastPick(pick) && !props.isDraftComplete) {
    return 'border-gray-200 dark:border-gray-600 grayscale';
  }
  return 'border-gray-200 dark:border-gray-600';
}

/** Dynamic classes for user name */
function pickNameClasses(pick: FantasyDraftOrderResponse): string {
  if (isActivePick(pick)) {
    return isCurrentUser(pick.user.uuid)
      ? 'font-bold text-green-700 dark:text-green-300'
      : 'font-semibold text-yellow-700 dark:text-yellow-300';
  }
  if (isCurrentUser(pick.user.uuid)) {
    return 'font-semibold text-emerald-700 dark:text-emerald-300';
  }
  if (isPastPick(pick) && !props.isDraftComplete) {
    return 'text-gray-400 dark:text-gray-500';
  }
  return 'text-gray-500 dark:text-gray-400';
}

/** Store refs for each pick element (for scroll-to logic) */
function setPickRef(pick: FantasyDraftOrderResponse, el: HTMLElement | null) {
  if (el) {
    pickRefs.value.set(pick.pick, el);
  }
}

/** Total rounds derived from data */
const totalRounds = computed(() => {
  if (!props.draftOrder.length) return 1;
  return Math.max(...props.draftOrder.map((p) => p.round));
});

/** Total picks per round (number of participants) */
const totalPicksPerRound = computed(() => {
  if (!props.draftOrder.length) return 0;
  return props.draftOrder.filter((p) => p.round === 1).length;
});

/** Picks for the currently displayed round */
const currentRoundPicks = computed(() => {
  return props.draftOrder
    .filter((p) => p.round === currentRound.value)
    .sort((a, b) => a.pick_in_round - b.pick_in_round);
});

/** Current pick position in the current round derived from turn data */
const currentPickInRound = computed(() => {
  if (props.currentTurn && props.currentTurn.round === currentRound.value) {
    return props.currentTurn.pick_in_round;
  }
  if (props.isDraftComplete) return totalPicksPerRound.value;
  return 1;
});

/** Next pick for the current user */
const currentUserNextPick = computed(() => {
  const userUuid = userStore.getUserData?.uuid;
  if (!userUuid || !props.currentTurn) return null;
  // Find the next pick for this user that is >= current overall pick
  return (
    props.draftOrder.find(
      (p) => p.user.uuid === userUuid && p.pick >= props.currentTurn!.pick,
    ) || null
  );
});

/** Auto-navigate to the round of the current turn */
function navigateToCurrentTurn() {
  if (props.currentTurn && !props.isDraftComplete) {
    currentRound.value = props.currentTurn.round;
    // Scroll to active pick element after DOM update
    nextTick(() => {
      scrollToActivePick();
      updateScrollState();
    });
  }
}

/** Scroll carousel to center the active pick */
function scrollToActivePick() {
  if (!props.currentTurn || !carouselRef.value) return;
  const activePick = props.currentTurn.pick;
  const el = pickRefs.value.get(activePick);
  if (el) {
    const containerWidth = carouselRef.value.clientWidth;
    const elLeft = el.offsetLeft;
    const elWidth = el.offsetWidth;
    const scrollTo = elLeft - containerWidth / 2 + elWidth / 2;
    carouselRef.value.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
  }
}

/** Navigate to previous round */
function prevRound() {
  if (currentRound.value > 1) {
    currentRound.value--;
    scrollToStart();
  }
}

/** Navigate to next round */
function nextRound() {
  if (currentRound.value < totalRounds.value) {
    currentRound.value++;
    scrollToStart();
  }
}

/** Scroll carousel programmatically */
function scrollCarousel(direction: "left" | "right") {
  if (!carouselRef.value) return;
  const scrollAmount = 200;
  carouselRef.value.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
}

/** Scroll back to start */
function scrollToStart() {
  nextTick(() => {
    if (carouselRef.value) {
      carouselRef.value.scrollTo({ left: 0, behavior: "smooth" });
    }
    updateScrollState();
  });
}

/** Update scroll arrow visibility */
function updateScrollState() {
  if (!carouselRef.value) return;
  const el = carouselRef.value;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
}

/** Handle broken avatar images */
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = "true";
    img.src = "/img/default-avatar.svg";
  }
}

/** Re-check scroll state when round changes */
watch(currentRoundPicks, () => {
  nextTick(() => updateScrollState());
});

/** Auto-navigate when currentTurn changes (real-time via Ably) */
watch(
  () => props.currentTurn,
  () => {
    navigateToCurrentTurn();
  },
  { immediate: true },
);
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Slow ping animation for active turn indicator */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Soft pulse for the "your turn" icon */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}
</style>
