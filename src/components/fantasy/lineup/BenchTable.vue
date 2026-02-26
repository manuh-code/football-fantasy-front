<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
  >
    <!-- Section Header -->
    <div
      class="bg-gradient-to-r from-gray-600 to-gray-700 px-4 md:px-6 py-3"
    >
      <h3 class="text-lg font-bold text-white flex items-center gap-2">
        <v-icon name="hi-solid-users" class="w-5 h-5" />
        Bench
      </h3>
    </div>

    <!-- Bench Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead
          class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
        >
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              Position
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              Player
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <template
            v-if="formation?.bench && formation.bench > 0"
          >
            <tr
              v-for="player in benchPlayers"
              :key="player.football_player.uuid"
              :data-player-uuid="player.football_player.uuid"
              :class="[{ 'player-highlight': isHighlighted(player.football_player.uuid) }]"
            >
              <td colspan="2" class="p-0">
                <div class="relative overflow-hidden">
                  <div
                    class="absolute inset-y-0 right-0 w-[76px] bg-red-500 flex items-center justify-center"
                  >
                    <div class="flex flex-col items-center gap-0.5">
                      <v-icon name="hi-solid-trash" class="w-5 h-5 text-white" />
                      <span class="text-[10px] text-white font-medium">Remove</span>
                    </div>
                  </div>
                  <div
                    class="relative flex items-center bg-white dark:bg-gray-800 swipe-row"
                    :style="{
                      transform: `translateX(${getSwipeOffset(player.football_player.uuid)}px)`,
                      transition: getSwipeTransition(player.football_player.uuid),
                    }"
                    @touchstart="onSwipeStart(player.football_player.uuid, $event)"
                    @touchmove="onSwipeMove(player.football_player.uuid, $event)"
                    @touchend="onSwipeEnd(player.football_player.uuid)"
                    @mousedown="onSwipeStart(player.football_player.uuid, $event)"
                  >
                    <div class="px-4 py-4 shrink-0">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase whitespace-nowrap"
                        >
                          {{ getPositionShortCode(player.position.developer_name, player.position.code) }}
                        </span>
                      </div>
                    </div>
                    <div class="px-4 py-4 flex-1 min-w-0">
                      <div class="flex items-center gap-3">
                        <img
                          :src="player.football_player.image_path || '/img/default-avatar.svg'"
                          :alt="player.football_player.display_name"
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                            {{ player.football_player.display_name }}
                          </p>
                        </div>
                        <span
                          class="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold"
                        >
                          {{ player.fantasy_points ?? 0 }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty bench slots -->
            <tr
              v-for="slot in emptyBenchSlots"
              :key="`empty-${slot}`"
              @click="$emit('draftByPosition', 'BENCH')"
              class="bg-gray-50/50 dark:bg-gray-700/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-colors duration-150"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-bold"
                  >
                    BN
                  </span>
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  >
                    <v-icon name="hi-solid-plus" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p class="text-sm text-gray-400 dark:text-gray-500 italic">
                    Click to add player
                  </p>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";

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

// Bench: is_starter === false and not flex
const benchPlayers = computed(() =>
  props.players.filter((p) => !p.is_starter && !p.is_flex),
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
