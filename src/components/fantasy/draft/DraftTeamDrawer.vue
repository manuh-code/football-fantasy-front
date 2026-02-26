<template>
  <Teleport to="body">
    <!-- ==================== DESKTOP: Left-side draggable sheet ==================== -->
    <template v-if="!isMobile">
      <!-- Backdrop (only when fully expanded) -->
      <Transition name="backdrop">
        <div
          v-if="desktopState === 'full'"
          class="fixed inset-0 bg-black/20 z-40"
          @click="desktopState = 'half'"
        />
      </Transition>

      <!-- Left Side Sheet -->
      <div
        ref="desktopSheetRef"
        class="fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-gray-900 shadow-[4px_0_24px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] flex flex-row will-change-[width]"
        :style="desktopSheetStyle"
      >
        <!-- Content area -->
        <div class="flex-1 flex flex-col overflow-hidden min-w-0">
          <!-- Header -->
          <div
            class="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-600 to-green-600 shrink-0"
          >
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0"
              >
                <v-icon name="ri-team-line" class="w-4 h-4 text-white" />
              </div>
              <h2
                v-if="desktopState !== 'peek'"
                class="text-sm font-bold text-white truncate"
              >
                My Team
              </h2>
            </div>

            <!-- State badge -->
            <span
              v-if="refreshKey > 0 && desktopState !== 'peek'"
              class="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shrink-0"
            />
          </div>

          <!-- Loading state -->
          <div
            v-if="isLoadingData && players.length === 0 && desktopState !== 'peek'"
            class="flex-1 flex items-center justify-center"
          >
            <v-icon
              name="pr-spinner"
              class="w-8 h-8 text-emerald-500"
              animation="spin"
            />
          </div>

          <!-- Lineup content (scrollable) -->
          <div
            v-else
            class="flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200"
            :class="desktopState === 'peek' ? 'opacity-0 pointer-events-none' : 'opacity-100'"
          >
            <div class="p-2 space-y-3">
              <StartersTable
                :players="players"
                :formation="league?.formation ?? null"
                :highlighted-player-uuid="highlightedPlayerUuid"
              />
              <BenchTable
                :players="players"
                :formation="league?.formation ?? null"
                :highlighted-player-uuid="highlightedPlayerUuid"
              />
            </div>
          </div>
        </div>

        <!-- Drag handle (right edge) -->
        <div
          class="w-5 flex items-center justify-center cursor-col-resize shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-l border-gray-200 dark:border-gray-700 select-none"
          @mousedown.prevent="onDesktopDragStart"
          @click="toggleDesktop"
        >
          <div class="flex flex-col gap-1">
            <div class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
            <div class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
            <div class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== MOBILE: Persistent draggable bottom sheet ==================== -->
    <template v-else>
      <!-- Backdrop (only when expanded to full) -->
      <Transition name="backdrop">
        <div
          v-if="mobileState === 'full'"
          class="fixed inset-0 bg-black/30 z-40"
          @click="mobileState = 'half'; mobileCurrentDragHeight = null"
        />
      </Transition>

      <!-- Bottom Sheet -->
      <div
        ref="mobileSheetRef"
        class="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] flex flex-col will-change-transform"
        :style="mobileSheetStyle"
        @touchstart.passive="onMobileTouchStart"
        @touchmove.passive="onMobileTouchMove"
        @touchend="onMobileTouchEnd"
      >
        <!-- Drag Handle -->
        <div
          class="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing shrink-0"
          @click="toggleMobile"
        >
          <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <!-- Peek Header (always visible) -->
        <div
          class="flex items-center justify-between px-4 py-2 shrink-0"
          @click="toggleMobile"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center"
            >
              <v-icon name="ri-team-line" class="w-4 h-4 text-white" />
            </div>
            <div>
              <h3
                class="text-sm font-bold text-gray-900 dark:text-white leading-tight"
              >
                My Team
              </h3>
              <p
                class="text-[11px] text-gray-500 dark:text-gray-400 leading-tight"
              >
                {{
                  mobileState === "peek"
                    ? "Swipe up to view"
                    : "Swipe down to minimize"
                }}
              </p>
            </div>
          </div>

          <!-- Chevron indicator -->
          <div class="flex items-center gap-1.5">
            <span
              v-if="refreshKey > 0"
              class="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"
            />
            <v-icon
              :name="
                mobileState === 'peek'
                  ? 'hi-solid-chevron-up'
                  : 'hi-solid-chevron-down'
              "
              class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200"
            />
          </div>
        </div>

        <!-- Loading state -->
        <div
          v-if="isLoadingData && players.length === 0 && mobileState !== 'peek'"
          class="flex-1 flex items-center justify-center py-8"
        >
          <v-icon
            name="pr-spinner"
            class="w-8 h-8 text-emerald-500"
            animation="spin"
          />
        </div>

        <!-- Content (scrollable, only interactive when not in peek) -->
        <div
          v-else
          ref="mobileContentRef"
          class="flex-1 overflow-y-auto overscroll-contain px-2 pb-4 transition-opacity duration-200"
          :class="
            mobileState === 'peek'
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          "
        >
          <div class="space-y-3">
            <StartersTable
              :players="players"
              :formation="league?.formation ?? null"
              :highlighted-player-uuid="highlightedPlayerUuid"
            />
            <BenchTable
              :players="players"
              :formation="league?.formation ?? null"
              :highlighted-player-uuid="highlightedPlayerUuid"
            />
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import StartersTable from "@/components/fantasy/lineup/StartersTable.vue";
import BenchTable from "@/components/fantasy/lineup/BenchTable.vue";
import { useBreakpoints } from "@/composables/useMediaQuery";
import { useFantasyRounds } from "@/composables/useFantasyRounds";
import { useUserStore } from "@/store/user/useUserStore";
import { fantasyLeagueService } from "@/services/fantasy/leagues/FantasyLeagueService";
import type { FantasyFootballPlayersResponse } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import type { FantasyFootballLineupPayload } from "@/interfaces/fantasy/leagues/FantasyFootballLineupPayload";

type SheetState = "peek" | "half" | "full";

// ==================== Constants ====================
// Mobile: heights in vh
const MOBILE_PEEK_PX = 72;
const MOBILE_HALF_VH = 45;
const MOBILE_FULL_VH = 88;

// Desktop: widths in px
const DESKTOP_PEEK_PX = 56;
const DESKTOP_HALF_PX = 360;
const DESKTOP_FULL_PX = 480;

interface Props {
  /** Whether the drawer is visible (used for auto-expand on mobile) */
  modelValue: boolean;
  /** Fantasy league UUID to load data */
  fantasyLeagueUuid?: string;
  /** Change this value to trigger a data reload */
  refreshKey?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  fantasyLeagueUuid: undefined,
  refreshKey: 0,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const { isMobile } = useBreakpoints();
const userStore = useUserStore();

// ==================== Data loading ====================
const players = ref<FantasyFootballPlayersResponse[]>([]);
const league = ref<FantasyLeaguesResponse | null>(null);
const isLoadingData = ref(false);
const highlightedPlayerUuid = ref<string | null>(null);

const leagueUuid = computed(() => props.fantasyLeagueUuid);

const { selectedRoundUuid, loadRounds } = useFantasyRounds(
  () => leagueUuid.value,
);

async function loadLeague() {
  if (!leagueUuid.value) return;
  try {
    league.value = await fantasyLeagueService.showFantasyLeague(
      leagueUuid.value,
    );
  } catch (err: unknown) {
    console.error("DraftTeamDrawer: Error loading league:", err);
  }
}

async function loadPlayers() {
  if (!leagueUuid.value || !selectedRoundUuid.value) return;
  isLoadingData.value = true;
  try {
    const payload: FantasyFootballLineupPayload = {
      fantasy_round_uuid: selectedRoundUuid.value,
    };
    players.value = await userStore.getFantasyFootballPlayersByLeagueUuid(
      leagueUuid.value,
      payload,
    );
  } catch (err: unknown) {
    console.error("DraftTeamDrawer: Error loading players:", err);
  } finally {
    isLoadingData.value = false;
  }
}

// Reload players when round is resolved
watch(selectedRoundUuid, () => {
  if (selectedRoundUuid.value) {
    loadPlayers();
  }
});

// Reload when refreshKey changes (player was picked)
watch(
  () => props.refreshKey,
  () => {
    if (selectedRoundUuid.value) {
      loadPlayers();
    }
  },
);

onMounted(async () => {
  await loadLeague();
  await loadRounds();
});

// ==================== DESKTOP: Left-side draggable sheet ====================
const desktopSheetRef = ref<HTMLElement | null>(null);
const desktopState = ref<SheetState>("half");
const isDesktopDragging = ref(false);
const desktopDragStartX = ref(0);
const desktopDragStartWidth = ref(0);
const desktopCurrentDragWidth = ref<number | null>(null);

function getDesktopWidthForState(state: SheetState): number {
  switch (state) {
    case "peek":
      return DESKTOP_PEEK_PX;
    case "half":
      return DESKTOP_HALF_PX;
    case "full":
      return DESKTOP_FULL_PX;
  }
}

const desktopSheetStyle = computed(() => {
  if (isMobile.value) return {};
  const width =
    desktopCurrentDragWidth.value ??
    getDesktopWidthForState(desktopState.value);
  return {
    width: `${width}px`,
    transition: isDesktopDragging.value
      ? "none"
      : "width 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
  };
});

function toggleDesktop() {
  if (isDesktopDragging.value) return;
  switch (desktopState.value) {
    case "peek":
      desktopState.value = "half";
      break;
    case "half":
      desktopState.value = "full";
      break;
    case "full":
      desktopState.value = "peek";
      break;
  }
  desktopCurrentDragWidth.value = null;
}

function onDesktopDragStart(e: MouseEvent) {
  isDesktopDragging.value = true;
  desktopDragStartX.value = e.clientX;
  desktopDragStartWidth.value =
    desktopCurrentDragWidth.value ??
    getDesktopWidthForState(desktopState.value);

  document.addEventListener("mousemove", onDesktopDragMove);
  document.addEventListener("mouseup", onDesktopDragEnd);
  // Prevent text selection while dragging
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";
}

function onDesktopDragMove(e: MouseEvent) {
  if (!isDesktopDragging.value) return;
  const deltaX = e.clientX - desktopDragStartX.value;
  const newWidth = Math.max(
    DESKTOP_PEEK_PX,
    Math.min(desktopDragStartWidth.value + deltaX, DESKTOP_FULL_PX),
  );
  desktopCurrentDragWidth.value = newWidth;
}

function onDesktopDragEnd() {
  if (!isDesktopDragging.value) return;
  isDesktopDragging.value = false;
  document.removeEventListener("mousemove", onDesktopDragMove);
  document.removeEventListener("mouseup", onDesktopDragEnd);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";

  const width =
    desktopCurrentDragWidth.value ??
    getDesktopWidthForState(desktopState.value);

  // Snap to nearest state
  const peekDist = Math.abs(width - DESKTOP_PEEK_PX);
  const halfDist = Math.abs(width - DESKTOP_HALF_PX);
  const fullDist = Math.abs(width - DESKTOP_FULL_PX);
  const minDist = Math.min(peekDist, halfDist, fullDist);

  if (minDist === peekDist) {
    desktopState.value = "peek";
  } else if (minDist === halfDist) {
    desktopState.value = "half";
  } else {
    desktopState.value = "full";
  }

  desktopCurrentDragWidth.value = null;
}

// Cleanup desktop drag listeners on unmount
onUnmounted(() => {
  document.removeEventListener("mousemove", onDesktopDragMove);
  document.removeEventListener("mouseup", onDesktopDragEnd);
});

// ==================== MOBILE: Bottom sheet ====================
const mobileSheetRef = ref<HTMLElement | null>(null);
const mobileContentRef = ref<HTMLElement | null>(null);
const mobileState = ref<SheetState>("peek");
const isMobileDragging = ref(false);
const mobileDragStartY = ref(0);
const mobileDragStartHeight = ref(0);
const mobileCurrentDragHeight = ref<number | null>(null);

function getMobileHeightForState(state: SheetState): number {
  const vh = window.innerHeight;
  switch (state) {
    case "peek":
      return MOBILE_PEEK_PX;
    case "half":
      return (MOBILE_HALF_VH / 100) * vh;
    case "full":
      return (MOBILE_FULL_VH / 100) * vh;
  }
}

const mobileSheetStyle = computed(() => {
  if (!isMobile.value) return {};
  const height =
    mobileCurrentDragHeight.value ??
    getMobileHeightForState(mobileState.value);
  return {
    height: `${height}px`,
    transition: isMobileDragging.value
      ? "none"
      : "height 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
  };
});

function toggleMobile() {
  if (isMobileDragging.value) return;
  switch (mobileState.value) {
    case "peek":
      mobileState.value = "half";
      break;
    case "half":
      mobileState.value = "full";
      break;
    case "full":
      mobileState.value = "peek";
      break;
  }
  mobileCurrentDragHeight.value = null;
}

function onMobileTouchStart(e: TouchEvent) {
  if (
    mobileContentRef.value &&
    mobileContentRef.value.scrollTop > 0 &&
    mobileState.value !== "peek"
  ) {
    return;
  }
  const touch = e.touches[0];
  mobileDragStartY.value = touch.clientY;
  mobileDragStartHeight.value =
    mobileCurrentDragHeight.value ??
    getMobileHeightForState(mobileState.value);
  isMobileDragging.value = true;
}

function onMobileTouchMove(e: TouchEvent) {
  if (!isMobileDragging.value) return;
  const touch = e.touches[0];
  const deltaY = mobileDragStartY.value - touch.clientY;
  const newHeight = Math.max(
    MOBILE_PEEK_PX,
    Math.min(
      mobileDragStartHeight.value + deltaY,
      (MOBILE_FULL_VH / 100) * window.innerHeight,
    ),
  );
  mobileCurrentDragHeight.value = newHeight;
}

function onMobileTouchEnd() {
  if (!isMobileDragging.value) return;
  isMobileDragging.value = false;

  const height =
    mobileCurrentDragHeight.value ??
    getMobileHeightForState(mobileState.value);
  const vh = window.innerHeight;

  const peekH = MOBILE_PEEK_PX;
  const halfH = (MOBILE_HALF_VH / 100) * vh;
  const fullH = (MOBILE_FULL_VH / 100) * vh;

  const peekDist = Math.abs(height - peekH);
  const halfDist = Math.abs(height - halfH);
  const fullDist = Math.abs(height - fullH);
  const minDist = Math.min(peekDist, halfDist, fullDist);

  if (minDist === peekDist) {
    mobileState.value = "peek";
  } else if (minDist === halfDist) {
    mobileState.value = "half";
  } else {
    mobileState.value = "full";
  }

  mobileCurrentDragHeight.value = null;
}

// Auto-expand mobile sheet when modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (isMobile.value && newVal && mobileState.value === "peek") {
      mobileState.value = "half";
      mobileCurrentDragHeight.value = null;
    }
  },
);

// Auto-expand mobile sheet when refreshKey changes
watch(
  () => props.refreshKey,
  () => {
    if (isMobile.value && mobileState.value === "peek") {
      mobileState.value = "half";
      mobileCurrentDragHeight.value = null;
    }
  },
);
</script>

<style scoped>
/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
