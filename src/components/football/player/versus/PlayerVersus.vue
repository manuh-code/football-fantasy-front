<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { footballPlayerService } from "@/services/football/player/FootballPlayerService";
import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import type {
  FootballPlayerVersusResponse,
  PlayerVersusData,
} from "@/interfaces/football/player/FootballPlayerVersusResponse";
import {
  flattenPlayerStats,
  buildComparison,
  buildRadarMetrics,
} from "@/utils/playerVersus";
import PlayerAvatar from "@/components/football/ui/PlayerAvatar.vue";
import PlayerSearchDrawer from "./PlayerSearchDrawer.vue";
import PlayerVersusRadar from "./PlayerVersusRadar.vue";
import PlayerVersusStatBars from "./PlayerVersusStatBars.vue";

const props = defineProps<{
  seasonUuid: string;
}>();

const COLOR_A = "#10b981"; // emerald-500
const COLOR_B = "#0ea5e9"; // sky-500

// ── Selected players ──
const playerA = ref<FootballPlayerResponse | null>(null);
const playerB = ref<FootballPlayerResponse | null>(null);

// ── Search drawer ──
const openSlot = ref<"a" | "b" | null>(null);
const drawerOpen = computed(() => openSlot.value !== null);
const excludeUuid = computed(() =>
  openSlot.value === "a" ? playerB.value?.uuid ?? null : playerA.value?.uuid ?? null,
);

const openSearch = (slot: "a" | "b") => {
  openSlot.value = slot;
};
const closeSearch = () => {
  openSlot.value = null;
};
const onPlayerSelected = (player: FootballPlayerResponse) => {
  if (openSlot.value === "a") playerA.value = player;
  else if (openSlot.value === "b") playerB.value = player;
  closeSearch();
};
const clearSlot = (slot: "a" | "b") => {
  if (slot === "a") playerA.value = null;
  else playerB.value = null;
  versus.value = null;
};

// ── Versus data ──
const versus = ref<FootballPlayerVersusResponse | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const bothSelected = computed(() => !!playerA.value && !!playerB.value);

const loadVersus = async () => {
  if (!playerA.value || !playerB.value || !props.seasonUuid) return;
  isLoading.value = true;
  error.value = null;
  versus.value = null;
  try {
    const response = await footballPlayerService.getPlayerVersus(
      playerA.value.uuid,
      playerB.value.uuid,
      props.seasonUuid,
    );
    versus.value = response.data;
  } catch (err) {
    console.error("Error loading player versus:", err);
    error.value = "Couldn't load the comparison. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Refetch whenever the pair or season changes.
watch(
  () => [playerA.value?.uuid, playerB.value?.uuid, props.seasonUuid] as const,
  () => {
    if (bothSelected.value && props.seasonUuid) loadVersus();
  },
);

// Map the response back to the selected players (guard against order swaps).
const dataA = computed<PlayerVersusData | null>(() => {
  if (!versus.value) return null;
  const { first_player, second_player } = versus.value;
  if (first_player?.player?.uuid === playerA.value?.uuid) return first_player;
  if (second_player?.player?.uuid === playerA.value?.uuid) return second_player;
  return first_player ?? null;
});
const dataB = computed<PlayerVersusData | null>(() => {
  if (!versus.value) return null;
  const { first_player, second_player } = versus.value;
  if (first_player?.player?.uuid === playerB.value?.uuid) return first_player;
  if (second_player?.player?.uuid === playerB.value?.uuid) return second_player;
  return second_player ?? null;
});

const comparison = computed(() =>
  buildComparison(
    flattenPlayerStats(dataA.value, props.seasonUuid),
    flattenPlayerStats(dataB.value, props.seasonUuid),
  ),
);

const radar = computed(() => buildRadarMetrics(comparison.value));
const hasStats = computed(() => comparison.value.length > 0);

const positionName = (p: FootballPlayerResponse | null): string => p?.position?.name ?? "";
</script>

<template>
  <div class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
    <!-- No season context -->
    <div v-if="!seasonUuid" class="px-4 py-12 flex flex-col items-center text-center">
      <v-icon name="md-comparearrows-round" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
      <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.versus.selectLeague') }}</p>
    </div>

    <template v-else>
      <!-- Player slots -->
      <div class="px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <!-- Slot A -->
        <button
          @click="openSearch('a')"
          class="relative min-w-0 flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors"
          :class="playerA
            ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/10'
            : 'border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
        >
          <template v-if="playerA">
            <span
              @click.stop="clearSlot('a')"
              class="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :aria-label="$t('football.versus.removePlayer')"
            >
              <v-icon name="hi-solid-x" class="w-3.5 h-3.5" />
            </span>
            <PlayerAvatar :player="playerA" size="xl" variant="circle" />
            <div class="text-center w-full min-w-0">
              <p class="text-footnote font-bold text-gray-900 dark:text-white truncate">{{ playerA.common_name }}</p>
              <p v-if="positionName(playerA)" class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ positionName(playerA) }}</p>
            </div>
          </template>
          <template v-else>
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
              <v-icon name="hi-solid-plus" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ $t('football.versus.addPlayer') }}</span>
          </template>
        </button>

        <!-- VS -->
        <div class="flex items-center justify-center">
          <span class="text-xs font-extrabold tracking-widest text-gray-300 dark:text-gray-600">VS</span>
        </div>

        <!-- Slot B -->
        <button
          @click="openSearch('b')"
          class="relative min-w-0 flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors"
          :class="playerB
            ? 'border-sky-200 dark:border-sky-800/50 bg-sky-50/40 dark:bg-sky-900/10'
            : 'border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
        >
          <template v-if="playerB">
            <span
              @click.stop="clearSlot('b')"
              class="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :aria-label="$t('football.versus.removePlayer')"
            >
              <v-icon name="hi-solid-x" class="w-3.5 h-3.5" />
            </span>
            <PlayerAvatar :player="playerB" size="xl" variant="circle" />
            <div class="text-center w-full min-w-0">
              <p class="text-footnote font-bold text-gray-900 dark:text-white truncate">{{ playerB.common_name }}</p>
              <p v-if="positionName(playerB)" class="text-2xs text-gray-400 dark:text-gray-500 truncate">{{ positionName(playerB) }}</p>
            </div>
          </template>
          <template v-else>
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
              <v-icon name="hi-solid-plus" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ $t('football.versus.addPlayer') }}</span>
          </template>
        </button>
      </div>

      <!-- Results -->
      <div class="border-t border-gray-100 dark:border-gray-800">
        <!-- Prompt: need both players -->
        <div v-if="!bothSelected" class="px-4 py-12 flex flex-col items-center text-center">
          <v-icon name="md-comparearrows-round" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
          <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.versus.pickTwo') }}</p>
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="isLoading" class="px-4 py-4 animate-pulse">
          <!-- Legend -->
          <div class="flex items-center justify-center gap-4 mb-4">
            <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <!-- Radar placeholder -->
          <div class="flex justify-center mb-6">
            <div class="w-[220px] h-[220px] rounded-full bg-gray-100 dark:bg-gray-800" />
          </div>
          <!-- Comparison bar rows -->
          <div class="space-y-4">
            <div v-for="i in 6" :key="i">
              <div class="flex justify-center mb-1.5">
                <div class="h-2.5 w-20 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
              <div class="flex items-center gap-2">
                <div class="w-9 h-3 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div class="flex-1 flex items-center gap-1">
                  <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800" />
                  <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800" />
                </div>
                <div class="w-9 h-3 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="px-4 py-12 flex flex-col items-center text-center">
          <v-icon name="hi-solid-exclamation-circle" class="w-9 h-9 text-red-400 dark:text-red-500 mb-3" />
          <p class="text-footnote text-red-500 dark:text-red-400 mb-3">{{ error }}</p>
          <button
            @click="loadVersus"
            class="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            {{ $t('common.actions.retry') }}
          </button>
        </div>

        <!-- Empty: no comparable stats -->
        <div v-else-if="!hasStats" class="px-4 py-12 flex flex-col items-center text-center">
          <v-icon name="hi-solid-chart-bar" class="w-9 h-9 text-gray-200 dark:text-gray-700 mb-2" />
          <p class="text-footnote text-gray-400 dark:text-gray-500">{{ $t('football.versus.noComparableStats') }}</p>
        </div>

        <!-- Comparison -->
        <div v-else class="px-4 py-4">
          <!-- Legend -->
          <div class="flex items-center justify-center gap-4 mb-3">
            <span class="flex items-center gap-1.5 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: COLOR_A }" />
              <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ playerA?.display_name }}</span>
            </span>
            <span class="flex items-center gap-1.5 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: COLOR_B }" />
              <span class="text-2xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ playerB?.display_name }}</span>
            </span>
          </div>

          <!-- Radar -->
          <PlayerVersusRadar
            v-if="radar.labels.length > 0"
            :labels="radar.labels"
            :dataset-a="{ name: playerA?.display_name ?? 'A', values: radar.valuesA, color: COLOR_A }"
            :dataset-b="{ name: playerB?.display_name ?? 'B', values: radar.valuesB, color: COLOR_B }"
          />

          <!-- Comparison bars -->
          <div class="mt-5">
            <PlayerVersusStatBars :comparison="comparison" :color-a="COLOR_A" :color-b="COLOR_B" />
          </div>
        </div>
      </div>
    </template>

    <!-- Player search drawer -->
    <PlayerSearchDrawer
      :is-visible="drawerOpen"
      :exclude-uuid="excludeUuid"
      @select="onPlayerSelected"
      @close="closeSearch"
    />
  </div>
</template>
