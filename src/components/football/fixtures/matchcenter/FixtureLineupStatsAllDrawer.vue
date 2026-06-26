<script setup lang="ts">
import type { FootballFixtureLineupStatsResponse } from "@/interfaces/football/fixture/FootballFixtureLineupStatsResponse";

interface Props {
  stat: FootballFixtureLineupStatsResponse | null;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const FALLBACK_PLAYER = "/img/default-avatar.svg";

const formatValue = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(2);

const playerImg = (path: string | null | undefined): string => {
  if (!path || path.includes("placeholder")) return FALLBACK_PLAYER;
  return path;
};

const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = FALLBACK_PLAYER;
};

const rankColor = (index: number): string => {
  if (index === 0) return "text-amber-500";
  if (index === 1) return "text-gray-400 dark:text-gray-400";
  if (index === 2) return "text-amber-700 dark:text-amber-600";
  return "text-gray-300 dark:text-gray-600";
};
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="overlay-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="sheet-slide">
      <div
        v-if="isOpen && stat"
        class="fixed bottom-0 left-0 right-0 z-[135] md:left-4 md:right-4 md:bottom-4 md:max-w-2xl md:mx-auto"
      >
        <div class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-t-3xl md:rounded-3xl max-h-[82dvh] overflow-hidden">
          <!-- Drag pill -->
          <div class="shrink-0 flex justify-center pt-2.5 pb-1">
            <div class="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <!-- Header -->
          <div class="shrink-0 flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-callout font-bold text-gray-900 dark:text-white">
              {{ stat.type.name }}
            </h2>
            <button
              @click="emit('close')"
              class="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :aria-label="$t('common.actions.close')"
            >
              <v-icon name="hi-solid-x" class="w-4 h-4" />
            </button>
          </div>

          <!-- List -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
            style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom))"
          >
            <ul class="space-y-1.5">
              <li
                v-for="(entry, index) in stat.top"
                :key="entry.player.uuid"
                class="flex items-center gap-3 rounded-xl px-3 py-2"
                :class="index === 0
                  ? 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-gray-50 dark:bg-gray-800/40'"
              >
                <!-- Rank -->
                <span
                  class="w-6 shrink-0 text-center text-xs font-extrabold tabular-nums"
                  :class="rankColor(index)"
                >{{ index + 1 }}</span>

                <!-- Avatar -->
                <img
                  :src="playerImg(entry.player.image_path)"
                  :alt="entry.player.display_name"
                  class="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700"
                  @error="onImgError"
                />

                <!-- Name + team -->
                <div class="flex-1 min-w-0">
                  <p class="text-footnote font-semibold text-gray-900 dark:text-white truncate leading-snug">
                    {{ entry.player.display_name }}
                  </p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <img
                      :src="entry.team.image_path ?? ''"
                      :alt="entry.team.short_code ?? entry.team.name"
                      class="w-3.5 h-3.5 object-contain"
                      @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                    />
                    <span class="text-2xs text-gray-400 dark:text-gray-500 truncate">
                      {{ entry.team.short_code ?? entry.team.name }}
                    </span>
                  </div>
                </div>

                <!-- Value -->
                <span
                  class="shrink-0 text-callout font-extrabold tabular-nums"
                  :class="index === 0
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'"
                >
                  {{ formatValue(entry.data.value) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
