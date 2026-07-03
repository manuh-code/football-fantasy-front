<template>
  <div class="flex items-center gap-1.5">
    <!-- Prev -->
    <button
      type="button"
      @click="goTo(modelValue - 1)"
      :disabled="modelValue === 0"
      :aria-label="$t('football.rounds.previous')"
      class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 active:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
          i === modelValue
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
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
      class="shrink-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 active:text-emerald-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
    >
      <v-icon name="hi-solid-chevron-right" class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import type { FootballRoundResponse } from "@/interfaces/football/round/FootballRoundResponse";

const props = defineProps<{
  rounds: FootballRoundResponse[];
  /** Index of the selected round (v-model). */
  modelValue: number;
}>();

const emit = defineEmits<{ "update:modelValue": [index: number] }>();

const stripRef = ref<HTMLElement | null>(null);

// --- Mouse drag-to-scroll (touch/pen keep native scrolling) ---
const isDragging = ref(false);
let startX = 0;
let startScroll = 0;
let moved = false;
let activePointer: number | null = null;

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  const strip = stripRef.value;
  if (!strip) return;
  isDragging.value = true;
  moved = false;
  startX = e.clientX;
  startScroll = strip.scrollLeft;
  activePointer = e.pointerId;
  strip.setPointerCapture(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const strip = stripRef.value;
  if (!strip) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 3) moved = true;
  strip.scrollLeft = startScroll - dx;
};

const onPointerUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const strip = stripRef.value;
  if (strip && activePointer !== null) {
    try {
      strip.releasePointerCapture(activePointer);
    } catch {
      /* pointer already released */
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
