<template>
  <Teleport to="body">
    <!-- ==================== DESKTOP: Left-side sheet ==================== -->
    <template v-if="!isMobile && modelValue">
      <Transition name="backdrop">
        <div
          v-if="desktopState === 'full'"
          class="fixed inset-0 bg-black/20 z-[70]"
          @click="close"
        />
      </Transition>

      <div
        ref="desktopSheetRef"
        class="fixed left-0 bottom-0 z-[71] bg-white dark:bg-gray-900 shadow-[4px_0_24px_rgba(0,0,0,0.12)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)] flex flex-row will-change-[width]"
        :style="[desktopSheetStyle, { top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }]"
      >
        <div class="flex-1 flex flex-col overflow-hidden min-w-0">
          <!-- Header -->
          <div class="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900 shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <div v-if="desktopState !== 'peek'" class="min-w-0">
                <h2 class="text-[13px] font-semibold text-gray-900 dark:text-white truncate">
                  Swap — {{ positionLabel }}
                </h2>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">Select a player to swap</p>
              </div>
            </div>
            <button
              v-if="desktopState !== 'peek'"
              @click.stop="close"
              class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform shrink-0"
            >
              <v-icon name="hi-solid-x" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <!-- Content -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200"
            :class="desktopState === 'peek' ? 'opacity-0 pointer-events-none' : 'opacity-100'"
          >
            <SwapPlayerList
              :target-player="targetPlayer"
              :candidates="candidatePlayers"
              :is-loading="isUpdating"
              @select="handleSwap"
            />
          </div>
        </div>

        <!-- Drag handle -->
        <div
          class="w-5 flex items-center justify-center cursor-col-resize shrink-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l border-gray-100 dark:border-gray-700/60 select-none"
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

    <!-- ==================== MOBILE: Bottom sheet ==================== -->
    <template v-else-if="isMobile && modelValue">
      <Transition name="backdrop">
        <div
          v-if="mobileState === 'full'"
          class="fixed inset-0 bg-black/30 z-[70]"
          @click="mobileState = 'half'; mobileTranslateY = null"
        />
      </Transition>

      <div
        ref="mobileSheetRef"
        class="fixed inset-x-0 bottom-[52px] z-[71] bg-white dark:bg-gray-900 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] flex flex-col mobile-sheet"
        :style="mobileSheetStyle"
        @touchstart.passive="onMobileTouchStart"
        @touchmove.passive="onMobileTouchMove"
        @touchend="onMobileTouchEnd"
      >
        <!-- Drag Handle -->
        <div
          class="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing shrink-0 touch-none"
          @click="toggleMobile"
        >
          <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 shrink-0 touch-none">
          <div class="flex items-center gap-2 flex-1 min-w-0" @click="toggleMobile">
            <v-icon name="hi-solid-switch-horizontal" class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <div class="min-w-0">
              <h3 class="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight truncate">
                Swap — {{ positionLabel }}
              </h3>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                {{ mobileState === 'peek' ? 'Swipe up to view' : 'Select a player to swap' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              @click.stop="close"
              class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform"
            >
              <v-icon name="hi-solid-x" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
            <v-icon
              :name="mobileState === 'peek' ? 'hi-solid-chevron-up' : 'hi-solid-chevron-down'"
              class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200"
              @click="toggleMobile"
            />
          </div>
        </div>

        <!-- Content -->
        <div
          ref="mobileContentRef"
          class="flex-1 overflow-y-auto overscroll-contain px-2 pb-4 transition-opacity duration-200"
          :class="mobileState === 'peek' ? 'opacity-0 pointer-events-none' : 'opacity-100'"
        >
          <SwapPlayerList
            :target-player="targetPlayer"
            :candidates="candidatePlayers"
            :is-loading="isUpdating"
            @select="handleSwap"
          />
        </div>
      </div>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { useBreakpoints } from "@/composables/useMediaQuery";
import { getUserService } from "@/services/user/UserService";
import { useToast } from "@/composables/useToast";
import type { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import SwapPlayerList from "@/components/fantasy/lineup/SwapPlayerList.vue";

// ==================== Constants ====================
type SheetState = "peek" | "half" | "full";

const MOBILE_PEEK_PX = 72;
const MOBILE_HALF_VH = 50;
const MOBILE_FULL_VH = 88;

const DESKTOP_PEEK_PX = 56;
const DESKTOP_HALF_PX = 360;
const DESKTOP_FULL_PX = 480;

const FLING_VELOCITY_THRESHOLD = 0.3;
const IOS_SPRING_BEZIER = "cubic-bezier(0.32, 0.72, 0, 1)";
const SNAP_DURATION_MIN = 260;
const SNAP_DURATION_MAX = 500;

function computeSnapDuration(distance: number, velocity: number): number {
  const absVel = Math.abs(velocity);
  const base = Math.min(SNAP_DURATION_MAX, Math.max(SNAP_DURATION_MIN, distance * 0.8));
  const factor = absVel > 0.5 ? Math.max(0.4, 1 - absVel * 0.3) : 1;
  return Math.round(Math.min(SNAP_DURATION_MAX, Math.max(SNAP_DURATION_MIN, base * factor)));
}

function rubberBand(offset: number, dimension: number): number {
  return (1 - 1 / ((offset * 0.55) / dimension + 1)) * dimension;
}

function rubberClamp(value: number, min: number, max: number, dimension: number): number {
  if (value < min) return min - rubberBand(min - value, dimension);
  if (value > max) return max + rubberBand(value - max, dimension);
  return value;
}

function resolveSnapState(
  value: number,
  velocity: number,
  peekVal: number,
  halfVal: number,
  fullVal: number,
): SheetState {
  if (Math.abs(velocity) > FLING_VELOCITY_THRESHOLD) {
    if (velocity > 0) return value < halfVal ? "half" : "full";
    return value > halfVal ? "half" : "peek";
  }
  const dPeek = Math.abs(value - peekVal);
  const dHalf = Math.abs(value - halfVal);
  const dFull = Math.abs(value - fullVal);
  const min = Math.min(dPeek, dHalf, dFull);
  if (min === dPeek) return "peek";
  if (min === dHalf) return "half";
  return "full";
}

// ==================== Props / Emits ====================
interface Props {
  modelValue: boolean;
  /** All players in the lineup */
  players: FantasyFootballPlayer[];
  /** The player occupying the slot being swapped (null for empty slots) */
  targetPlayer: FantasyFootballPlayer | null;
  /** developer_name of the slot position, e.g. 'GOALKEEPER', 'DEFENDER', 'BENCH' */
  slotPosition: string;
  /** Whether the slot is a starter slot (true) or bench slot (false) */
  slotIsStarter: boolean;
  /** Whether the slot is a flex slot */
  slotIsFlex: boolean;
  leagueUuid: string;
  fantasyRoundUuid: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "lineup-updated": [];
}>();

const { isMobile } = useBreakpoints();
const { addToast } = useToast();

// ==================== Candidate players ====================
/**
 * Position label for the drawer header
 */
const positionLabel = computed(() => {
  const labels: Record<string, string> = {
    GOALKEEPER: "Goalkeeper",
    DEFENDER: "Defender",
    MIDFIELDER: "Midfielder",
    ATTACKER: "Forward",
    FLEX: "Flex",
    BENCH: "Bench",
  };
  return labels[props.slotPosition] ?? props.slotPosition;
});

/**
 * If the slot is a starter/flex — show bench players of same position to bring in.
 * If the slot is a bench slot — show starter/flex players of same position to send to bench.
 * FLEX slots accept any non-GK player.
 */
const candidatePlayers = computed<FantasyFootballPlayer[]>(() => {
  if (props.slotIsStarter || props.slotIsFlex) {
    // Looking for bench players to promote to starter
    return props.players.filter((p) => {
      if (p.in_play) return false;
      if (!p.is_starter && !p.is_flex) {
        // bench player — must match position or slot is FLEX
        if (props.slotIsFlex) return p.position.developer_name !== "GOALKEEPER";
        return p.position.developer_name === props.slotPosition;
      }
      return false;
    });
  } else {
    // bench player selected: show starters/flex of same position + flex players
    return props.players.filter((p) => {
      if (p.in_play) return false;
      if (props.targetPlayer && p.football_player.uuid === props.targetPlayer.football_player.uuid) return false;
      if (p.is_starter || p.is_flex) {
        // BENCH fallback: show all (e.g. empty bench slot with no position context)
        if (props.slotPosition === "BENCH") return true;
        // Show starters/flex that match the bench player's position, plus any flex player
        return p.position.developer_name === props.slotPosition || p.is_flex;
      }
      return false;
    });
  }
});

// ==================== Swap action ====================
const isUpdating = ref(false);

async function handleSwap(candidate: FantasyFootballPlayer) {
  if (isUpdating.value) return;
  isUpdating.value = true;

  try {
    // Build updated lineup: swap flags between targetPlayer and candidate
    const lineup = props.players.map((p) => {
      // The candidate takes the slot's role
      if (p.football_player.uuid === candidate.football_player.uuid) {
        return {
          football_player_uuid: p.football_player.uuid,
          is_starter: props.slotIsStarter,
          is_flex: props.slotIsFlex,
        };
      }
      // The target player (if any) takes the candidate's former role
      if (props.targetPlayer && p.football_player.uuid === props.targetPlayer.football_player.uuid) {
        return {
          football_player_uuid: p.football_player.uuid,
          is_starter: candidate.is_starter,
          is_flex: candidate.is_flex,
        };
      }
      // All other players stay unchanged
      return {
        football_player_uuid: p.football_player.uuid,
        is_starter: p.is_starter,
        is_flex: p.is_flex,
      };
    });

    await getUserService().updatePlayerLineup(props.leagueUuid, {
      fantasy_round_uuid: props.fantasyRoundUuid,
      lineup,
    });

    addToast({
      type: "success",
      title: "Lineup updated",
      message: `${candidate.football_player.display_name} has been moved successfully.`,
    });

    emit("lineup-updated");
    close();
  } catch {
    addToast({
      type: "error",
      title: "Error",
      message: "Could not update lineup. Please try again.",
    });
  } finally {
    isUpdating.value = false;
  }
}

// ==================== Sheet control ====================
function close() {
  emit("update:modelValue", false);
  desktopState.value = "half";
  desktopCurrentDragWidth.value = null;
  mobileState.value = "half";
  mobileTranslateY.value = null;
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      desktopState.value = "half";
      mobileState.value = "half";
    }
  },
);

// ==================== DESKTOP ====================
const desktopSheetRef = ref<HTMLElement | null>(null);
const desktopState = ref<SheetState>("half");
const isDesktopDragging = ref(false);
const desktopDragStartX = ref(0);
const desktopDragStartWidth = ref(0);
const desktopCurrentDragWidth = ref<number | null>(null);
const desktopSnapTransition = ref("");

function getDesktopWidthForState(state: SheetState): number {
  switch (state) {
    case "peek": return DESKTOP_PEEK_PX;
    case "half": return DESKTOP_HALF_PX;
    case "full": return DESKTOP_FULL_PX;
  }
}

const desktopSheetStyle = computed(() => {
  if (isMobile.value) return {};
  const width = desktopCurrentDragWidth.value === null
    ? getDesktopWidthForState(desktopState.value)
    : desktopCurrentDragWidth.value;
  const transition = isDesktopDragging.value ? "none" : desktopSnapTransition.value || `width 320ms ${IOS_SPRING_BEZIER}`;
  return { width: `${width}px`, transition };
});

function toggleDesktop() {
  if (isDesktopDragging.value) return;
  const states: SheetState[] = ["peek", "half", "full"];
  const idx = states.indexOf(desktopState.value);
  const next = states[(idx + 1) % states.length];
  const cur = getDesktopWidthForState(desktopState.value);
  const target = getDesktopWidthForState(next);
  const dur = computeSnapDuration(Math.abs(target - cur), 0);
  desktopSnapTransition.value = `width ${dur}ms ${IOS_SPRING_BEZIER}`;
  desktopState.value = next;
  desktopCurrentDragWidth.value = null;
}

let _desktopRafId: number | null = null;
let _desktopLastClientX = 0;
let _desktopLastTime = 0;
let _desktopVelocity = 0;

function onDesktopDragStart(e: MouseEvent) {
  isDesktopDragging.value = true;
  desktopDragStartX.value = e.clientX;
  desktopDragStartWidth.value = desktopCurrentDragWidth.value === null
    ? getDesktopWidthForState(desktopState.value)
    : desktopCurrentDragWidth.value;
  _desktopLastClientX = e.clientX;
  _desktopLastTime = performance.now();
  _desktopVelocity = 0;
  document.addEventListener("mousemove", onDesktopDragMove);
  document.addEventListener("mouseup", onDesktopDragEnd);
}

function onDesktopDragMove(e: MouseEvent) {
  if (!isDesktopDragging.value) return;
  const now = performance.now();
  const dt = now - _desktopLastTime || 1;
  _desktopVelocity = (e.clientX - _desktopLastClientX) / dt;
  _desktopLastClientX = e.clientX;
  _desktopLastTime = now;
  const delta = e.clientX - desktopDragStartX.value;
  const raw = desktopDragStartWidth.value + delta;
  if (_desktopRafId !== null) cancelAnimationFrame(_desktopRafId);
  _desktopRafId = requestAnimationFrame(() => {
    desktopCurrentDragWidth.value = rubberClamp(raw, DESKTOP_PEEK_PX, DESKTOP_FULL_PX, DESKTOP_FULL_PX);
  });
}

function onDesktopDragEnd() {
  isDesktopDragging.value = false;
  document.removeEventListener("mousemove", onDesktopDragMove);
  document.removeEventListener("mouseup", onDesktopDragEnd);
  const cur = desktopCurrentDragWidth.value === null ? getDesktopWidthForState(desktopState.value) : desktopCurrentDragWidth.value;
  const next = resolveSnapState(cur, _desktopVelocity, DESKTOP_PEEK_PX, DESKTOP_HALF_PX, DESKTOP_FULL_PX);
  const target = getDesktopWidthForState(next);
  const dur = computeSnapDuration(Math.abs(target - cur), _desktopVelocity);
  desktopSnapTransition.value = `width ${dur}ms ${IOS_SPRING_BEZIER}`;
  desktopState.value = next;
  desktopCurrentDragWidth.value = null;
}

// ==================== MOBILE ====================
const mobileSheetRef = ref<HTMLElement | null>(null);
const mobileContentRef = ref<HTMLElement | null>(null);
const mobileState = ref<SheetState>("half");
const isMobileDragging = ref(false);
const mobileTranslateY = ref<number | null>(null);
const mobileSnapTransition = ref("");

let _mobileRafId: number | null = null;
let _mobileLastY = 0;
let _mobileLastTime = 0;
let _mobileVelocity = 0;
let _mobileTouchStartY = 0;
let _mobileDragCommitted = false;
const MOBILE_DRAG_DEAD_ZONE = 4;

function getMobileHeightForState(state: SheetState): number {
  const vh = window.innerHeight;
  switch (state) {
    case "peek": return MOBILE_PEEK_PX;
    case "half": return (MOBILE_HALF_VH / 100) * vh;
    case "full": return (MOBILE_FULL_VH / 100) * vh;
  }
}

const mobileMaxHeight = computed(() => (MOBILE_FULL_VH / 100) * window.innerHeight);

const mobileSheetStyle = computed(() => {
  if (!isMobile.value) return {};
  const maxH = mobileMaxHeight.value;
  if (mobileTranslateY.value !== null) {
    const raw = getMobileHeightForState(mobileState.value) - mobileTranslateY.value;
    const height = rubberClamp(raw, MOBILE_PEEK_PX, maxH, maxH);
    return { height: `${height}px`, transition: "none", maxHeight: `${maxH}px` };
  }
  const height = getMobileHeightForState(mobileState.value);
  const transition = isMobileDragging.value ? "none" : mobileSnapTransition.value || `height 320ms ${IOS_SPRING_BEZIER}`;
  return { height: `${height}px`, transition, maxHeight: `${maxH}px` };
});

const MOBILE_TOGGLE_MAP: Record<SheetState, SheetState> = { peek: "half", half: "full", full: "peek" };

function toggleMobile() {
  const next = MOBILE_TOGGLE_MAP[mobileState.value];
  const cur = getMobileHeightForState(mobileState.value);
  const target = getMobileHeightForState(next);
  const dur = computeSnapDuration(Math.abs(target - cur), 0);
  mobileSnapTransition.value = `height ${dur}ms ${IOS_SPRING_BEZIER}`;
  mobileState.value = next;
  mobileTranslateY.value = null;
}

function onMobileTouchStart(e: TouchEvent) {
  const content = mobileContentRef.value;
  if (content && content.scrollTop > 0 && mobileState.value === "full") return;
  _mobileTouchStartY = e.touches[0].clientY;
  _mobileLastY = _mobileTouchStartY;
  _mobileLastTime = performance.now();
  _mobileVelocity = 0;
  _mobileDragCommitted = false;
  isMobileDragging.value = false;
}

function onMobileTouchMove(e: TouchEvent) {
  const dy = e.touches[0].clientY - _mobileTouchStartY;
  if (!_mobileDragCommitted) {
    if (Math.abs(dy) < MOBILE_DRAG_DEAD_ZONE) return;
    _mobileDragCommitted = true;
    isMobileDragging.value = true;
  }
  const now = performance.now();
  const dt = now - _mobileLastTime || 1;
  _mobileVelocity = (e.touches[0].clientY - _mobileLastY) / dt;
  _mobileLastY = e.touches[0].clientY;
  _mobileLastTime = now;
  if (_mobileRafId !== null) cancelAnimationFrame(_mobileRafId);
  _mobileRafId = requestAnimationFrame(() => {
    mobileTranslateY.value = e.touches[0].clientY - _mobileTouchStartY;
  });
}

function onMobileTouchEnd() {
  if (!_mobileDragCommitted) return;
  isMobileDragging.value = false;
  if (_mobileRafId !== null) cancelAnimationFrame(_mobileRafId);
  const cur = mobileTranslateY.value === null
    ? getMobileHeightForState(mobileState.value)
    : getMobileHeightForState(mobileState.value) - mobileTranslateY.value;
  const next = resolveSnapState(
    cur,
    -_mobileVelocity,
    MOBILE_PEEK_PX,
    getMobileHeightForState("half"),
    getMobileHeightForState("full"),
  );
  const target = getMobileHeightForState(next);
  const dur = computeSnapDuration(Math.abs(target - cur), _mobileVelocity);
  mobileSnapTransition.value = `height ${dur}ms ${IOS_SPRING_BEZIER}`;
  mobileState.value = next;
  mobileTranslateY.value = null;
}

onUnmounted(() => {
  document.removeEventListener("mousemove", onDesktopDragMove);
  document.removeEventListener("mouseup", onDesktopDragEnd);
  if (_desktopRafId !== null) cancelAnimationFrame(_desktopRafId);
  if (_mobileRafId !== null) cancelAnimationFrame(_mobileRafId);
});
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.mobile-sheet {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
