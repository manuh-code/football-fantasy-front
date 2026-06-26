<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { catalogService } from "@/services/catalog/CatalogService";
import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import PlayerAvatar from "@/components/football/ui/PlayerAvatar.vue";

const props = defineProps<{
  isVisible: boolean;
  /** Hide this player from results (already chosen in the other slot). */
  excludeUuid?: string | null;
}>();

const emit = defineEmits<{
  select: [player: FootballPlayerResponse];
  close: [];
}>();

const MIN_QUERY = 2;

const query = ref("");
const results = ref<FootballPlayerResponse[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);

// Only auto-focus on pointer/hover devices, so the mobile keyboard doesn't pop
// up and cover the results (same approach as SearchableSelectComponent).
const isDesktop =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const runSearch = async (term: string) => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await catalogService.getPlayerSearch(term);
    results.value = res ?? [];
  } catch (err) {
    console.error("Error searching players:", err);
    error.value = "Couldn't search players. Please try again.";
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  const term = value.trim();
  if (term.length < MIN_QUERY) {
    results.value = [];
    isLoading.value = false;
    error.value = null;
    return;
  }
  isLoading.value = true;
  debounceTimer = setTimeout(() => runSearch(term), 400);
});

const visibleResults = () =>
  props.excludeUuid
    ? results.value.filter((p) => p.uuid !== props.excludeUuid)
    : results.value;

const onSelect = (player: FootballPlayerResponse) => {
  emit("select", player);
};

const retry = () => {
  const term = query.value.trim();
  if (term.length >= MIN_QUERY) runSearch(term);
};

// ── Open/close: reset state, lock scroll, focus (desktop only) ──
watch(
  () => props.isVisible,
  (open) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (open) {
      query.value = "";
      results.value = [];
      error.value = null;
      isLoading.value = false;
      if (isDesktop) nextTick(() => searchInput.value?.focus());
    } else {
      dragOffsetY.value = 0;
      isDragging.value = false;
    }
  },
);

// ── Drag-to-dismiss (same pattern as the app's other bottom-sheets) ──
const dragOffsetY = ref(0);
const isDragging = ref(false);
const dragStartY = ref(0);
const dragStartTime = ref(0);

const onDragStart = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  isDragging.value = true;
  dragStartY.value = e.clientY;
  dragStartTime.value = Date.now();
  dragOffsetY.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
};
const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffsetY.value = delta > 0 ? delta : delta * 0.15;
};
const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // ignore
  }
  const elapsed = Date.now() - dragStartTime.value;
  const velocity = elapsed > 0 ? dragOffsetY.value / elapsed : 0;
  const shouldClose = dragOffsetY.value > 100 || velocity > 0.6;
  dragOffsetY.value = 0;
  if (shouldClose) emit("close");
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.isVisible) emit("close");
};
onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (typeof document !== "undefined") document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="psd-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="psd-slide">
      <div
        v-if="isVisible"
        class="fixed bottom-0 left-0 right-0 z-[140] md:left-4 md:right-4 md:bottom-4 md:max-w-md md:mx-auto pointer-events-none"
      >
        <div
          :style="{
            transform: `translateY(${dragOffsetY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }"
          class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl max-h-[80dvh] overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('football.versus.selectPlayer')"
        >
          <!-- Draggable header -->
          <div
            @pointerdown="onDragStart"
            @pointermove="onDragMove"
            @pointerup="onDragEnd"
            @pointercancel="onDragEnd"
            class="relative shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div class="flex justify-center pt-2.5 pb-1.5">
              <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div class="flex items-center justify-between px-4 pb-2.5 pt-1">
              <h3 class="text-callout font-bold text-gray-900 dark:text-white">{{ $t('football.versus.selectPlayer') }}</h3>
              <button
                @click.stop="emit('close')"
                @pointerdown.stop
                class="w-8 h-8 -mr-1 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :aria-label="$t('common.actions.close')"
              >
                <v-icon name="hi-x" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Search input (pinned, never scrolls away) -->
          <div class="shrink-0 px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div class="relative">
              <v-icon
                name="hi-solid-search"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                :placeholder="$t('football.versus.searchPlayer')"
                class="w-full h-11 pl-9 pr-3 text-footnote bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <!-- Results (scrollable region) -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain px-2 py-2"
            style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
          >
            <!-- Loading -->
            <div v-if="isLoading" class="flex items-center justify-center py-10">
              <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-8 flex flex-col items-center text-center">
              <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 dark:text-red-500 mb-2" />
              <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
              <button
                @click="retry"
                class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
               {{ $t('common.actions.retry') }}
              </button>
            </div>

            <!-- Hint (query too short) -->
            <div
              v-else-if="query.trim().length < MIN_QUERY"
              class="py-10 text-center text-footnote text-gray-400 dark:text-gray-500"
            >
              {{ $t('football.versus.typeAtLeast', { count: MIN_QUERY }) }}
            </div>

            <!-- Empty -->
            <div
              v-else-if="visibleResults().length === 0"
              class="py-10 flex flex-col items-center text-center"
            >
              <v-icon name="hi-solid-search" class="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
              <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.versus.noPlayersFound', { query: query.trim() }) }}</p>
            </div>

            <!-- Results -->
            <ul v-else class="space-y-1">
              <li v-for="player in visibleResults()" :key="player.uuid">
                <button
                  @click="onSelect(player)"
                  class="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                >
                  <PlayerAvatar :player="player" size="md" variant="circle" />
                  <div class="flex-1 min-w-0">
                    <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate">
                      {{ player.display_name }}
                    </p>
                    <p
                      v-if="player.position?.name"
                      class="text-2xs text-gray-400 dark:text-gray-500 truncate"
                    >
                      {{ player.position.name }}
                    </p>
                  </div>
                  <v-icon name="hi-solid-plus" class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.psd-fade-enter-active,
.psd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.psd-fade-enter-from,
.psd-fade-leave-to {
  opacity: 0;
}

.psd-slide-enter-active,
.psd-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.psd-slide-enter-from,
.psd-slide-leave-to {
  transform: translateY(100%);
}
</style>
