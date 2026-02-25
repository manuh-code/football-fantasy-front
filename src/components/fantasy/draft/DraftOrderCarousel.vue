<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight">Draft Order</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Round {{ currentRound }} &middot; Pick {{ currentPickInRound }} of {{ totalPicksPerRound }}
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
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
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
          class="flex-shrink-0 flex flex-col items-center gap-1 w-14 md:w-16"
          :class="{ 'order-first': false }"
        >
          <!-- Pick number badge -->
          <span
            class="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none"
            :class="isCurrentUser(pick.user.uuid)
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
          >
            #{{ pick.pick_in_round }}
          </span>

          <!-- Avatar -->
          <div
            class="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all"
            :class="isCurrentUser(pick.user.uuid)
              ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-800'
              : 'border-gray-200 dark:border-gray-600'"
          >
            <img
              :src="pick.user.avatar || '/img/default-avatar.svg'"
              :alt="`${pick.user.firstname} ${pick.user.lastname}`"
              class="w-full h-full rounded-full object-cover"
              @error="handleImageError"
            />
            <!-- Current user indicator dot -->
            <div
              v-if="isCurrentUser(pick.user.uuid)"
              class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"
            ></div>
          </div>

          <!-- User name (truncated) -->
          <span
            class="text-[10px] md:text-xs text-center leading-tight truncate w-full"
            :class="isCurrentUser(pick.user.uuid)
              ? 'font-semibold text-emerald-700 dark:text-emerald-300'
              : 'text-gray-500 dark:text-gray-400'"
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

    <!-- Your turn indicator -->
    <div
      v-if="currentUserNextPick"
      class="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-900/30"
    >
      <p class="text-xs text-emerald-700 dark:text-emerald-300 text-center font-medium">
        <v-icon name="hi-solid-lightning-bolt" class="w-3.5 h-3.5 inline -mt-0.5" />
        Your next pick: Round {{ currentUserNextPick.round }}, Pick #{{ currentUserNextPick.pick_in_round }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useUserStore } from '@/store'
import type { FantasyDraftOrderResponse } from '@/interfaces/fantasy/draft/FantasyDraftOrderResponse'

interface Props {
  draftOrder: FantasyDraftOrderResponse[]
}

const props = defineProps<Props>()

const userStore = useUserStore()
const carouselRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const currentRound = ref(1)

/** Check if a user is the authenticated user */
function isCurrentUser(userUuid: string): boolean {
  return userStore.getUserData?.uuid === userUuid
}

/** Total rounds derived from data */
const totalRounds = computed(() => {
  if (!props.draftOrder.length) return 1
  return Math.max(...props.draftOrder.map(p => p.round))
})

/** Total picks per round (number of participants) */
const totalPicksPerRound = computed(() => {
  if (!props.draftOrder.length) return 0
  return props.draftOrder.filter(p => p.round === 1).length
})

/** Picks for the currently displayed round */
const currentRoundPicks = computed(() => {
  return props.draftOrder
    .filter(p => p.round === currentRound.value)
    .sort((a, b) => a.pick_in_round - b.pick_in_round)
})

/** Current pick position in the current round (first pick without selection) */
const currentPickInRound = computed(() => {
  // For now, default to 1 since we don't track completed picks yet
  return 1
})

/** Next pick for the current user across all rounds */
const currentUserNextPick = computed(() => {
  const userUuid = userStore.getUserData?.uuid
  if (!userUuid) return null
  return props.draftOrder.find(p => p.user.uuid === userUuid && p.round === currentRound.value) || null
})

/** Navigate to previous round */
function prevRound() {
  if (currentRound.value > 1) {
    currentRound.value--
    scrollToStart()
  }
}

/** Navigate to next round */
function nextRound() {
  if (currentRound.value < totalRounds.value) {
    currentRound.value++
    scrollToStart()
  }
}

/** Scroll carousel programmatically */
function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return
  const scrollAmount = 200
  carouselRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

/** Scroll back to start */
function scrollToStart() {
  nextTick(() => {
    if (carouselRef.value) {
      carouselRef.value.scrollTo({ left: 0, behavior: 'smooth' })
    }
    updateScrollState()
  })
}

/** Update scroll arrow visibility */
function updateScrollState() {
  if (!carouselRef.value) return
  const el = carouselRef.value
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

/** Handle broken avatar images */
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (!img.dataset.fallbackUsed) {
    img.dataset.fallbackUsed = 'true'
    img.src = '/img/default-avatar.svg'
  }
}

/** Re-check scroll state when round changes */
watch(currentRoundPicks, () => {
  nextTick(() => updateScrollState())
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
