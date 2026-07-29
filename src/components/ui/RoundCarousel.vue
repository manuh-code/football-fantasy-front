<template>
  <!-- Skeleton (rounds not loaded yet) -->
  <div v-if="loading" class="flex items-center gap-1.5" aria-hidden="true">
    <div class="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    <div class="flex-1 flex gap-2 px-1 py-1 overflow-hidden">
      <div
        v-for="(w, n) in SKELETON_WIDTHS"
        :key="`round-skeleton-${n}`"
        class="shrink-0 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"
        :class="w"
      />
    </div>
    <div class="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
  </div>

  <div v-else class="flex items-center gap-1.5">
    <!-- Prev -->
    <button
      type="button"
      @click="goTo(modelValue - 1)"
      :disabled="modelValue === 0"
      :aria-label="$t('football.rounds.previous')"
      class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      :class="ACCENT_ACTIVE_TEXT[accent]"
    >
      <v-icon name="hi-solid-chevron-left" class="w-5 h-5" />
    </button>

    <!-- Draggable / swipeable strip -->
    <div
      ref="stripRef"
      class="flex-1 flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 py-1 select-none cursor-grab"
      :class="{ 'cursor-grabbing': isDragging }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <button
        v-for="(round, i) in rounds"
        :key="round.uuid"
        type="button"
        @click="onRoundClick(i)"
        :class="[
          'snap-center shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95',
          i === modelValue ? ACCENT_ACTIVE_BG[accent] : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
        ]"
      >
        {{ $t('football.rounds.rounds') }} {{ round.name }}
        <span
          v-if="round.is_current"
          class="relative inline-flex w-2 h-2 rounded-full"
          :class="i === modelValue ? 'bg-white' : 'bg-emerald-400'"
        >
          <span
            class="absolute inset-0 rounded-full animate-ping"
            :class="i === modelValue ? 'bg-white/70' : 'bg-emerald-400/60'"
          />
        </span>
      </button>
    </div>

    <!-- Next -->
    <button
      type="button"
      @click="goTo(modelValue + 1)"
      :disabled="modelValue === rounds.length - 1"
      :aria-label="$t('football.rounds.next')"
      class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      :class="ACCENT_ACTIVE_TEXT[accent]"
    >
      <v-icon name="hi-solid-chevron-right" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";
import type { BottomNavAccent } from "@/components/ui/BottomNavBar.vue";

const props = withDefaults(
  defineProps<{
    rounds: FootballRoundResponse[];
    /** Index of the selected round (v-model). */
    modelValue: number;
    /** Accent for the selected pill — lets callers match their own screen's
     *  theme color (e.g. amber on Standings) instead of a fixed green. */
    accent?: BottomNavAccent;
    /** Shows placeholder pills instead of rounds while the caller is still
     *  fetching them (replaces a generic spinner with the carousel's own shape). */
    loading?: boolean;
  }>(),
  { accent: "emerald", loading: false },
);

// Static widths (not computed) so Tailwind keeps these classes during purge.
const SKELETON_WIDTHS = ["w-20", "w-16", "w-24", "w-16"];

const emit = defineEmits<{ "update:modelValue": [index: number] }>();

// Static maps so Tailwind keeps these classes during purge (same convention as
// BottomNavBar/TopTabsBar).
const ACCENT_ACTIVE_BG: Record<BottomNavAccent, string> = {
  blue: "bg-blue-500 text-white shadow-md shadow-blue-500/25",
  emerald: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
  orange: "bg-orange-500 text-white shadow-md shadow-orange-500/25",
  red: "bg-red-500 text-white shadow-md shadow-red-500/25",
  purple: "bg-purple-500 text-white shadow-md shadow-purple-500/25",
  sky: "bg-sky-500 text-white shadow-md shadow-sky-500/25",
  amber: "bg-amber-500 text-white shadow-md shadow-amber-500/25",
};
const ACCENT_ACTIVE_TEXT: Record<BottomNavAccent, string> = {
  blue: "active:text-blue-500",
  emerald: "active:text-emerald-500",
  orange: "active:text-orange-500",
  red: "active:text-red-500",
  purple: "active:text-purple-500",
  sky: "active:text-sky-500",
  amber: "active:text-amber-500",
};

const stripRef = ref<HTMLElement | null>(null);

// --- Mouse drag-to-scroll (touch/pen keep native scrolling) ---
// Pixels the pointer must travel before a press becomes a drag. Below this a
// press stays a plain click so the round button gets selected.
const DRAG_THRESHOLD = 4;
const isDragging = ref(false);
let pressing = false;
let startX = 0;
let startScroll = 0;
let moved = false;
let activePointer: number | null = null;

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  const strip = stripRef.value;
  if (!strip) return;
  // Record the press origin but DON'T capture the pointer yet. Capturing here
  // retargets the eventual `click` to the strip, so the round <button> never
  // receives it and rounds become unselectable on desktop. We only capture once
  // the pointer actually crosses the drag threshold (see onPointerMove).
  pressing = true;
  moved = false;
  startX = e.clientX;
  startScroll = strip.scrollLeft;
  activePointer = e.pointerId;
};

const onPointerMove = (e: PointerEvent) => {
  if (!pressing) return;
  const strip = stripRef.value;
  if (!strip) return;
  const dx = e.clientX - startX;
  if (!isDragging.value) {
    if (Math.abs(dx) < DRAG_THRESHOLD) return;
    // Threshold crossed → promote to a real drag and capture from here on so we
    // keep tracking even if the cursor leaves the strip.
    isDragging.value = true;
    moved = true;
    strip.setPointerCapture(e.pointerId);
  }
  strip.scrollLeft = startScroll - dx;
};

const onPointerUp = () => {
  if (!pressing) return;
  pressing = false;
  const strip = stripRef.value;
  if (isDragging.value) {
    isDragging.value = false;
    if (strip && activePointer !== null) {
      try {
        strip.releasePointerCapture(activePointer);
      } catch {
        /* pointer already released */
      }
    }
  }
  activePointer = null;
  // Reset after the (suppressed) click has had a chance to fire.
  setTimeout(() => (moved = false), 0);
};

// --- Selection ---
const goTo = (index: number) => {
  if (index < 0 || index > props.rounds.length - 1 || index === props.modelValue) return;
  emit("update:modelValue", index);
};

const onRoundClick = (index: number) => {
  if (moved) return; // ignore clicks that were actually drags
  goTo(index);
};

// --- Keep the selected round centered ---
const centerSelected = async () => {
  await nextTick();
  const strip = stripRef.value;
  if (!strip) return;
  const button = strip.querySelectorAll("button")[props.modelValue] as HTMLElement | undefined;
  if (!button) return;
  const stripRect = strip.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();
  const target =
    strip.scrollLeft + (btnRect.left - stripRect.left) - (stripRect.width / 2 - btnRect.width / 2);
  strip.scrollTo({ left: target, behavior: "smooth" });
};

watch(() => props.modelValue, centerSelected);
watch(() => props.rounds, () => nextTick(centerSelected), { deep: false });
onMounted(centerSelected);
</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (prefers-reduced-motion: reduce) {
  .animate-ping {
    animation: none !important;
  }
  * {
    transition: none !important;
    transform: none !important;
  }
}
</style>
