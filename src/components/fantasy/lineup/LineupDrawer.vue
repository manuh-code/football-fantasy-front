<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="lineup-backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
      />
    </Transition>

    <!-- Full-screen Sheet -->
    <Transition name="lineup-sheet">
      <div
        v-if="modelValue"
        ref="sheetRef"
        class="fixed inset-x-0 top-0 bottom-0 z-[61] flex flex-col bg-white dark:bg-gray-900 rounded-t-[20px] pt-[env(safe-area-inset-top)] lineup-sheet-drag"
        :class="{ 'lineup-sheet-snapping': !isDragging && dragOffset > 0 }"
        :style="dragOffset > 0 ? { transform: `translateY(${dragOffset}px)` } : undefined"
      >
        <!-- Draggable Header Area -->
        <div
          class="shrink-0 cursor-grab active:cursor-grabbing"
          @touchstart.passive="onDragStart"
          @touchmove.passive="onDragMove"
          @touchend="onDragEnd"
          @mousedown="onMouseDragStart"
        >
          <!-- Drag Handle -->
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-9 h-[5px] rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <!-- Header -->
          <div class="px-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between">
              <p v-if="playerName" class="text-[13px] text-gray-600 dark:text-gray-300 font-semibold truncate">
                {{ playerName }}
              </p>
              <span v-else />
              <button
                @click.stop="close"
                class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform"
              >
                <v-icon name="hi-solid-x" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <!-- Loading -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-3">
            <v-icon name="pr-spinner" class="w-5 h-5 text-gray-300 dark:text-gray-600" animation="spin" />
            <p class="text-[12px] text-gray-400 dark:text-gray-500">Loading lineup...</p>
          </div>

          <!-- Error -->
          <div v-else-if="loadError" class="px-5 py-10 text-center">
            <v-icon name="hi-solid-exclamation-circle" class="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p class="text-[13px] text-gray-500 dark:text-gray-400">{{ loadError }}</p>
            <button
              @click="loadData"
              class="mt-3 px-4 py-2 text-[12px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>

          <!-- Lineup -->
          <template v-else>
            <div class="px-4 py-4 space-y-4">
              <StartersTable
                :players="players"
                :formation="formation"
                league-uuid=""
                :adding-player-position="props.addingPlayerPosition"
                @draft-by-position="handleSlotSelected"
                @swap-player="(uuid, pos) => emit('swap-player', uuid, pos)"
              />
              <BenchTable
                :players="players"
                :formation="formation"
                league-uuid=""
                :adding-player-position="props.addingPlayerPosition"
                @draft-by-position="handleSlotSelected"
                @swap-player="(uuid, pos) => emit('swap-player', uuid, pos)"
              />
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import StartersTable from "@/components/fantasy/lineup/StartersTable.vue";
import BenchTable from "@/components/fantasy/lineup/BenchTable.vue";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import { useUserStore } from "@/store/user/useUserStore";
import { useFantasyRounds } from "@/composables/useFantasyRounds";
import type { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyLeagueFormationResponse } from "@/interfaces/fantasy/leagues/FantasyLeagueFormationResponse";
import type { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";

export interface LineupSlotSelection {
  isStarter: boolean;
  isFlex: boolean;
}

interface Props {
  modelValue: boolean;
  fantasyLeagueUuid: string;
  playerName?: string;
  /** developer_name of the player position being added (e.g. GOALKEEPER, DEFENDER, etc.) */
  addingPlayerPosition?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  playerName: "",
  addingPlayerPosition: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "slot-selected": [slot: LineupSlotSelection];
  "swap-player": [playerUuid: string, position: string];
}>();

const userStore = useUserStore();

// Data
const players = ref<FantasyFootballPlayersResponse[]>([]);
const formation = ref<FantasyLeagueFormationResponse | null>(null);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

// Drag-to-dismiss
const sheetRef = ref<HTMLElement | null>(null);
const dragOffset = ref(0);
const dragStartY = ref(0);
const isDragging = ref(false);

// Rounds
const { rounds, selectedRoundUuid, loadRounds } = useFantasyRounds(
  () => props.fantasyLeagueUuid,
);

function close() {
  dragOffset.value = 0;
  emit("update:modelValue", false);
}

function handleSlotSelected(position: string) {
  const slot: LineupSlotSelection = {
    isStarter: position !== "BENCH",
    isFlex: position === "FLEX",
  };
  close();
  emit("slot-selected", slot);
}

// Load data when drawer opens
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await loadData();
    }
  },
);

async function loadData() {
  if (!props.fantasyLeagueUuid) return;

  isLoading.value = true;
  loadError.value = null;

  try {
    // Load league for formation
    const league = await fantasyLeagueService.showFantasyLeague(props.fantasyLeagueUuid);
    formation.value = league.formation ?? null;

    // Load rounds to get current round
    await loadRounds();

    if (selectedRoundUuid.value) {
      const payload: FantasyFootballLineupPayload = {
        fantasy_round_uuid: selectedRoundUuid.value,
      };
      players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(
        props.fantasyLeagueUuid,
        payload,
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error loading lineup";
    loadError.value = msg;
  } finally {
    isLoading.value = false;
  }
}

// Drag-to-dismiss handlers (touch)
function onDragStart(e: TouchEvent) {
  const touch = e.touches[0];
  dragStartY.value = touch.clientY;
  isDragging.value = true;
  dragOffset.value = 0;
}

function onDragMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const touch = e.touches[0];
  const delta = touch.clientY - dragStartY.value;
  dragOffset.value = Math.max(0, delta);
}

function onDragEnd() {
  const offset = dragOffset.value;
  isDragging.value = false;
  if (offset > window.innerHeight * 0.8) {
    close();
  } else {
    dragOffset.value = 0;
  }
}

// Drag-to-dismiss handlers (mouse — desktop)
function onMouseDragStart(e: MouseEvent) {
  dragStartY.value = e.clientY;
  isDragging.value = true;
  dragOffset.value = 0;
  document.addEventListener("mousemove", onMouseDragMove);
  document.addEventListener("mouseup", onMouseDragEnd);
}

function onMouseDragMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const delta = e.clientY - dragStartY.value;
  dragOffset.value = Math.max(0, delta);
}

function onMouseDragEnd() {
  document.removeEventListener("mousemove", onMouseDragMove);
  document.removeEventListener("mouseup", onMouseDragEnd);
  const offset = dragOffset.value;
  isDragging.value = false;
  if (offset > window.innerHeight * 0.8) {
    close();
  } else {
    dragOffset.value = 0;
  }
}
</script>

<style scoped>
/* Backdrop */
.lineup-backdrop-enter-active {
  transition: opacity 0.3s ease;
}
.lineup-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.lineup-backdrop-enter-from,
.lineup-backdrop-leave-to {
  opacity: 0;
}

/* Sheet */
.lineup-sheet-enter-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.lineup-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.lineup-sheet-enter-from,
.lineup-sheet-leave-to {
  transform: translateY(100%);
}

/* Snap-back animation when drag is released */
.lineup-sheet-snapping {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
</style>
