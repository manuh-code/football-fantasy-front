<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Section Header -->
    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60">
      <div class="flex items-center gap-2">
        <v-icon name="hi-solid-users" class="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
        <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white">Bench</h3>
      </div>
    </div>

    <!-- Bench List -->
    <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
      <template v-if="formation?.bench && formation.bench > 0">
        <div
          v-for="player in benchPlayers"
          :key="player.football_player?.uuid ?? player.position?.code"
          :data-player-uuid="player.football_player?.uuid"
          :class="[{ 'player-highlight': isHighlighted(player.football_player?.uuid) }]"
        >
          <div class="relative overflow-hidden">
            <div class="absolute inset-y-0 right-0 w-[68px] bg-red-500 flex items-center justify-center">
              <v-icon name="hi-solid-trash" class="w-4 h-4 text-white" />
            </div>
            <div
              class="relative flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 swipe-row"
              :style="{ transform: `translateX(${getSwipeOffset(player.football_player?.uuid ?? '')}px)`, transition: getSwipeTransition(player.football_player?.uuid ?? '') }"
              @touchstart="onSwipeStart(player.football_player?.uuid ?? '', $event)"
              @touchmove="onSwipeMove(player.football_player?.uuid ?? '', $event)"
              @touchend="onSwipeEnd(player.football_player?.uuid ?? '')"
              @mousedown="onSwipeStart(player.football_player?.uuid ?? '', $event)"
            >
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold shrink-0">
                {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
              </span>
              <img :src="player.football_player?.image_path || '/img/default-avatar.svg'" :alt="player.football_player?.display_name || 'Player'" class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-gray-900 dark:text-white truncate">{{ player.football_player?.display_name }}</p>
                <NextFixtureBadge :fixture="player.next_fixture" />
              </div>
              <span class="text-[12px] font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">{{ player.fantasy_points ?? 0 }} pts</span>
            </div>
          </div>
        </div>

        <!-- Empty bench slots -->
        <div
          v-for="slot in emptyBenchSlots"
          :key="`empty-${slot}`"
          @click="$emit('draftByPosition', 'BENCH')"
          class="flex items-center gap-3 px-4 py-2.5 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/40 transition-colors"
        >
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-[10px] font-bold opacity-60 shrink-0">BN</span>
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0">
            <v-icon name="hi-solid-plus" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </div>
          <p class="text-[12px] text-gray-400 dark:text-gray-500">Add bench player</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";
import NextFixtureBadge from "@/components/fantasy/lineup/NextFixtureBadge.vue";

interface Props {
  /** All players (the component filters bench internally) */
  players: FantasyFootballPlayersResponse[];
  /** League formation configuration */
  formation: FantasyLeagueFormationResponse | null;
  /** UUID of the player to highlight */
  highlightedPlayerUuid?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  highlightedPlayerUuid: null,
});

defineEmits<{
  draftByPosition: [position: string];
}>();

// Bench: is_starter === false and not flex (filter out entries with null football_player)
const benchPlayers = computed(() =>
  props.players.filter((p) => !p.is_starter && !p.is_flex && p.football_player),
);

const emptyBenchSlots = computed(() => {
  const maxBenchSize = props.formation?.bench ?? 6;
  const currentBenchSize = benchPlayers.value.length;
  return Math.max(0, maxBenchSize - currentBenchSize);
});

// Utility
function getPositionShortCode(developerName: string, code: string): string {
  const shortCodes: Record<string, string> = {
    GOALKEEPER: "GK",
    DEFENDER: "DEF",
    MIDFIELDER: "MID",
    ATTACKER: "FW",
    FLEX: "FX",
    BENCH: "BN",
  };
  return shortCodes[developerName] || code?.substring(0, 3) || "?";
}

function isHighlighted(playerUuid: string): boolean {
  return props.highlightedPlayerUuid === playerUuid;
}

// Swipe-to-delete
const swipeStates = ref<
  Record<string, { startX: number; startY: number; offsetX: number; swiping: boolean; open: boolean }>
>({});
const SWIPE_THRESHOLD = -60;
const SWIPE_ACTION_WIDTH = 76;

function getSwipeOffset(uuid: string): number {
  const state = swipeStates.value[uuid];
  if (!state) return 0;
  if (state.swiping) return Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, state.offsetX));
  return state.open ? -SWIPE_ACTION_WIDTH : 0;
}

function getSwipeTransition(uuid: string): string {
  const state = swipeStates.value[uuid];
  if (state?.swiping) return "none";
  return "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
}

function onSwipeStart(uuid: string, e: TouchEvent | MouseEvent) {
  for (const id in swipeStates.value) {
    if (id !== uuid && swipeStates.value[id]?.open) {
      swipeStates.value[id].open = false;
      swipeStates.value[id].offsetX = 0;
    }
  }
  const point = "touches" in e ? e.touches[0] : e;
  const wasOpen = swipeStates.value[uuid]?.open || false;
  swipeStates.value[uuid] = {
    startX: point.clientX + (wasOpen ? SWIPE_ACTION_WIDTH : 0),
    startY: point.clientY,
    offsetX: wasOpen ? -SWIPE_ACTION_WIDTH : 0,
    swiping: false,
    open: wasOpen,
  };
  if (!("touches" in e)) {
    const onMouseMove = (ev: MouseEvent) => onSwipeMove(uuid, ev);
    const onMouseUp = () => {
      onSwipeEnd(uuid);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
}

function onSwipeMove(uuid: string, e: TouchEvent | MouseEvent) {
  const state = swipeStates.value[uuid];
  if (!state) return;
  const point = "touches" in e ? e.touches[0] : e;
  const deltaX = point.clientX - state.startX;
  const deltaY = Math.abs(point.clientY - state.startY);
  if (!state.swiping) {
    if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > deltaY) {
      state.swiping = true;
    } else {
      return;
    }
  }
  if (!("touches" in e)) e.preventDefault();
  state.offsetX = Math.min(0, Math.max(-SWIPE_ACTION_WIDTH, deltaX));
}

function onSwipeEnd(uuid: string) {
  const state = swipeStates.value[uuid];
  if (!state) return;
  if (!state.swiping) {
    if (state.open) {
      state.open = false;
      state.offsetX = 0;
    }
    return;
  }
  state.swiping = false;
  if (state.offsetX < SWIPE_THRESHOLD) {
    state.open = true;
    state.offsetX = -SWIPE_ACTION_WIDTH;
  } else {
    state.open = false;
    state.offsetX = 0;
  }
}
</script>

<style scoped>
.swipe-row {
  touch-action: pan-y;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}
.swipe-row:active {
  cursor: grabbing;
}

@keyframes player-highlight {
  0% { background-color: rgba(59, 130, 246, 0.25); box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5); }
  50% { background-color: rgba(59, 130, 246, 0.1); box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.25); }
  100% { background-color: transparent; box-shadow: none; }
}
.player-highlight {
  animation: player-highlight 2.5s ease-out forwards;
  border-radius: 0.5rem;
}
</style>
