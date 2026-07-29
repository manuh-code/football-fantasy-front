<template>
  <div
    :data-player-uuid="uuid"
    :class="[
      highlighted ? 'player-highlight' : '',
      player.in_play ? 'in-play-locked' : '',
      swappable && !player.in_play ? 'swap-highlight cursor-pointer' : '',
    ]"
    @click="!player.in_play && swappable && emit('select')"
  >
    <div class="relative overflow-hidden">
      <!-- Swipe-revealed delete action -->
      <button
        v-if="canSwipe"
        :aria-label="$t('fantasy.lineup.removeAction')"
        class="absolute inset-y-0 right-0 w-[68px] bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
        :disabled="removing"
        @click="emit('remove')"
      >
        <v-icon v-if="removing" name="pr-spinner" class="w-4 h-4 text-white" animation="spin" />
        <v-icon v-else name="hi-solid-trash" class="w-4 h-4 text-white" />
      </button>

      <div
        class="relative flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 swipe-row"
        :style="canSwipe ? { transform: `translateX(${swipeOffset}px)`, transition: swipeTransition } : {}"
        @touchstart="canSwipe && onStart($event)"
        @touchmove="canSwipe && onMove($event)"
        @touchend="canSwipe && onEnd()"
        @mousedown="canSwipe && onStart($event)"
      >
        <span
          class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold shrink-0"
          :class="badgeClass"
        >
          {{ positionShort(player.position.developer_name) }}
        </span>

        <img
          :src="player.football_player.image_path || '/img/default-avatar.svg'"
          :alt="player.football_player.display_name"
          loading="lazy"
          class="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shrink-0"
        />

        <div class="flex-1 min-w-0" :class="canViewScore ? 'cursor-pointer' : ''" @click="onInfoClick">
          <div class="flex items-center gap-1.5">
            <p class="text-footnote font-medium text-gray-900 dark:text-white truncate">{{ player.football_player.display_name }}</p>
            <img v-if="player.team" :src="player.team.image_path" :alt="player.team.short_code" class="w-3.5 h-3.5 object-contain shrink-0" />
            <v-icon v-if="canViewScore" name="hi-solid-chevron-right" class="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <NationalityBadge class="mt-0.5" :country="player.football_player.country" />
            <NextFixtureBadge :fixture="player.next_fixture" />
          </div>
        </div>

        <span class="inline-flex items-baseline gap-0.5 shrink-0 px-2 py-1 rounded-lg" :class="pointsStyle.pill">
          <span class="text-sm font-black tabular-nums leading-none" :class="pointsStyle.num">{{ player.fantasy_points ?? 0 }}</span>
          <span class="text-2xs font-semibold leading-none" :class="pointsStyle.unit">{{ $t('fantasy.lineup.pts') }}</span>
        </span>

        <!-- Swap target hint while a draft-by-position is in progress -->
        <div v-if="swappable" class="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 swap-icon-pulse">
          <v-icon name="hi-solid-switch-horizontal" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        </div>

        <!-- Quick-swap button -->
        <button
          v-if="showSwapButton"
          :aria-label="$t('fantasy.lineup.swapAction')"
          class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500/50 dark:focus-visible:ring-offset-gray-800"
          :class="swapButtonClass"
          @click.stop="emit('openSwap')"
        >
          <v-icon name="hi-solid-switch-horizontal" class="w-3.5 h-3.5" :class="swapIconClass" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FantasyFootballPlayer } from "@/interfaces/user/fantasy/FantasyFootballPlayersResponse";
import NextFixtureBadge from "@/components/fantasy/lineup/NextFixtureBadge.vue";
import NationalityBadge from "@/components/football/ui/NationalityBadge.vue";
import { usePositionShortCode } from "@/composables/usePositionShortCode";
import { useSwipeToDelete } from "@/composables/useSwipeToDelete";
import {
  POSITION_BADGE,
  SWAP_BUTTON,
  SWAP_ICON,
  type LineupVariant,
} from "@/components/fantasy/lineup/lineupVariants";

interface Props {
  player: FantasyFootballPlayer;
  /** Color treatment for the row (drives the position chip & swap button). */
  variant: LineupVariant;
  /** developer_name of the position currently being drafted, or null. */
  addingPlayerPosition?: string | null;
  /** Whether tapping the info block opens the score drawer. */
  canViewScore?: boolean;
  /** Round context — the quick-swap button only shows when present. */
  fantasyRoundUuid?: string;
  /** Highlight animation (just-picked). */
  highlighted?: boolean;
  /** This row is a valid swap target for the in-progress draft-by-position. */
  swappable?: boolean;
  /** A removal request for this player is in flight. */
  removing?: boolean;
  /** Disables swipe-to-delete (e.g. draft mode). */
  disableRemove?: boolean;
  /** Round top score across the team — colors the points pill relative to it. */
  referenceScore?: number;
}

const props = withDefaults(defineProps<Props>(), {
  addingPlayerPosition: null,
  canViewScore: false,
  fantasyRoundUuid: "",
  highlighted: false,
  swappable: false,
  removing: false,
  disableRemove: false,
  referenceScore: 0,
});

const emit = defineEmits<{
  select: [];
  remove: [];
  openSwap: [];
  openScore: [];
}>();

const positionShort = usePositionShortCode();

const uuid = props.player.football_player.uuid;
const { swipeOffset, swipeTransition, open, onStart, onMove, onEnd } = useSwipeToDelete(uuid);

const canSwipe = computed(
  () => !props.addingPlayerPosition && !props.player.in_play && !props.disableRemove,
);
const showSwapButton = computed(
  () => !props.addingPlayerPosition && !props.player.in_play && !!props.fantasyRoundUuid,
);

const badgeClass = computed(() => POSITION_BADGE[props.variant]);
const swapButtonClass = computed(() => SWAP_BUTTON[props.variant]);
const swapIconClass = computed(() => SWAP_ICON[props.variant]);

/**
 * Points-pill color, relative to the team's top score this round:
 * emerald = standout (near the top), amber = solid, slate = quiet game,
 * muted gray = didn't score / didn't play. Falls back to amber when no team
 * reference is provided (so other callers keep the original look).
 */
const pointsStyle = computed(() => {
  const pts = Number(props.player.fantasy_points ?? 0);
  if (pts <= 0) {
    return {
      pill: "bg-gray-100 dark:bg-gray-700/40 ring-1 ring-gray-200/70 dark:ring-gray-600/40",
      num: "text-gray-400 dark:text-gray-500",
      unit: "text-gray-400/80 dark:text-gray-500/70",
    };
  }
  const ref = Number(props.referenceScore ?? 0);
  const ratio = ref > 0 ? pts / ref : 0.5;
  if (ratio >= 0.85) {
    return {
      pill: "bg-emerald-50 dark:bg-emerald-900/25 ring-1 ring-emerald-200/70 dark:ring-emerald-800/40",
      num: "text-emerald-600 dark:text-emerald-400",
      unit: "text-emerald-500/80 dark:text-emerald-400/70",
    };
  }
  if (ratio >= 0.45) {
    return {
      pill: "bg-amber-50 dark:bg-amber-900/25 ring-1 ring-amber-200/70 dark:ring-amber-800/40",
      num: "text-amber-600 dark:text-amber-400",
      unit: "text-amber-500/80 dark:text-amber-400/70",
    };
  }
  return {
    pill: "bg-slate-100 dark:bg-slate-700/40 ring-1 ring-slate-200/80 dark:ring-slate-600/40",
    num: "text-slate-500 dark:text-slate-300",
    unit: "text-slate-400 dark:text-slate-400/70",
  };
});

function onInfoClick() {
  if (!props.canViewScore) return;
  // Don't hijack a swipe that just revealed the delete action.
  if (open.value) return;
  emit("openScore");
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

.swap-highlight {
  background-color: rgba(251, 191, 36, 0.08);
  border-left: 3px solid rgba(251, 191, 36, 0.6);
}
.dark .swap-highlight {
  background-color: rgba(251, 191, 36, 0.05);
  border-left-color: rgba(251, 191, 36, 0.4);
}

@keyframes swap-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}
.swap-icon-pulse {
  animation: swap-pulse 1.8s ease-in-out infinite;
}

.in-play-locked {
  position: relative;
  background-color: rgba(156, 163, 175, 0.06);
}
.dark .in-play-locked {
  background-color: rgba(156, 163, 175, 0.04);
}
</style>
