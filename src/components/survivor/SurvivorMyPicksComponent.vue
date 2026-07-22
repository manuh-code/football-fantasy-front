<template>
  <div class="space-y-4">
    <!-- Header: title + compact W/D/L record -->
    <div class="px-1 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-callout font-semibold text-gray-900 dark:text-white leading-tight">
          {{ $t('survivor.mypicks.title') }}
        </h2>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {{ $t('survivor.mypicks.subtitle') }}
        </p>
      </div>

      <!-- Record summary chips (only once we have picks, hidden while selecting) -->
      <div v-if="!isLoading && !error && picks.length > 0 && !isSelectionMode" class="flex items-center gap-1.5 shrink-0">
        <span
          v-for="stat in record"
          :key="stat.key"
          class="inline-flex items-center gap-1 h-6 px-2 rounded-full text-2xs font-bold tabular-nums"
          :class="stat.classes"
          :title="stat.title"
        >
          <v-icon :name="stat.icon" class="w-3 h-3" />
          {{ stat.count }}
        </span>
      </div>
    </div>

    <!-- Selection toolbar: "Seleccionar" turns into Cancel / Delete once active -->
    <div
      v-if="!isLoading && !error && hasDeletablePicks"
      class="px-1 flex items-center gap-3"
      :class="isSelectionMode ? 'justify-between' : 'justify-end'"
    >
      <button
        v-if="isSelectionMode"
        type="button"
        @click="exitSelectionMode"
        class="text-xs font-semibold text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300"
      >
        {{ $t('common.actions.cancel') }}
      </button>
      <button
        type="button"
        :disabled="isSelectionMode && selectedCount === 0"
        @click="isSelectionMode ? requestBulkDelete() : enterSelectionMode()"
        class="text-xs font-semibold transition-colors"
        :class="!isSelectionMode
          ? 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
          : selectedCount === 0
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-red-500 dark:text-red-400 active:text-red-600'"
      >
        {{ isSelectionMode
          ? (selectedCount === 1 ? $t('survivor.mypicks.deleteSelectedOne') : $t('survivor.mypicks.deleteSelectedOther', { count: selectedCount }))
          : $t('common.actions.select') }}
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 space-y-5 animate-pulse"
    >
      <div v-for="n in 4" :key="`sk-${n}`" class="flex items-center gap-3">
        <div class="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div class="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        @click="load()"
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="picks.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center"
    >
      <v-icon name="hi-solid-clipboard-list" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">
        {{ $t('survivor.mypicks.emptyTitle') }}
      </h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
        {{ $t('survivor.mypicks.emptyBody') }}
      </p>
    </div>

    <!-- Board: timeline of rounds -->
    <div
      v-else
      class="picks-board bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 sm:p-5"
    >
      <ol class="space-y-0">
        <li
          v-for="(item, index) in picks"
          :key="item.uuid"
          :data-pick-uuid="item.uuid"
          class="flex gap-3"
        >
          <!-- Rail: a quiet lifeline through the survivor's rounds -->
          <div class="relative flex flex-col items-center pt-1.5">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
              :class="[dotClasses(item), item.is_current ? 'scale-125' : '']"
            />
            <span
              v-if="index < picks.length - 1"
              class="w-px flex-1 my-1 bg-gray-200 dark:bg-gray-700"
            />
          </div>

          <!-- Swipeable row: drag right-to-left to reveal delete -->
          <div class="relative flex-1 min-w-0 rounded-xl overflow-hidden">
            <!-- Delete action, revealed behind the row. Only mounted once the
                 row has actually slid open (rowOffset < 0) — at rest it sits
                 directly behind the row's right edge, and every tinted row
                 state (bg-rose-50/60 for the current round, bg-red-50/60 when
                 selected) is only 60% opaque, so its solid red bleeds through
                 and looks "open" without a swipe. Gating on the offset keeps it
                 out of the DOM until the swipe begins, removing the bleed. -->
            <div
              v-if="canDelete(item) && !isSelectionMode && rowOffset(item) < 0"
              class="absolute inset-y-0 right-0 flex"
              :style="{ width: DELETE_WIDTH + 'px' }"
            >
              <button
                type="button"
                :disabled="deletingUuid === item.uuid"
                @click="handleDelete(item)"
                class="flex-1 flex flex-col items-center justify-center gap-1 bg-red-500 text-white active:bg-red-600 transition-colors disabled:opacity-60"
                :aria-label="$t('survivor.mypicks.delete')"
              >
                <v-icon
                  :name="deletingUuid === item.uuid ? 'pr-spinner' : 'hi-solid-trash'"
                  :animation="deletingUuid === item.uuid ? 'spin' : undefined"
                  class="w-4 h-4"
                />
                <span class="text-2xs font-semibold">{{ $t('survivor.mypicks.delete') }}</span>
              </button>
            </div>

            <!-- Foreground content (tap to open the round's fixtures and pick) -->
            <button
              type="button"
              @click="onRowClick(item)"
              @pointerdown="onPointerDown($event, item)"
              @pointermove="onPointerMove($event, item)"
              @pointerup="onPointerUp(item)"
              @pointercancel="onPointerUp(item)"
              :aria-pressed="isSelectionMode && canDelete(item) ? isSelected(item) : undefined"
              class="relative w-full text-left px-2 py-3 flex items-center gap-3 select-none [-webkit-touch-callout:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 active:scale-[0.98]"
              :class="[
                isSelected(item)
                  ? 'bg-red-50/60 dark:bg-red-900/10'
                  : item.is_current ? 'bg-rose-50/60 dark:bg-rose-900/10' : 'bg-white dark:bg-gray-800',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                isSelectionMode && !canDelete(item) ? 'opacity-40' : '',
                // Once a paint-select drag is live, this row must stop passing
                // vertical touches through to page scroll (that's what let us
                // paint over it) — everywhere else, keep native scroll working.
                isPaintSelecting ? 'touch-none' : 'touch-pan-y',
                draggingUuid === item.uuid ? '' : 'transition-transform duration-200 ease-out',
              ]"
              :style="{ transform: `translateX(${rowOffset(item)}px)` }"
            >
              <!-- Leading: selection checkbox while picking picks to delete, else team crest / state icon.
                   The hold-to-select ring overlays whichever of these is showing. -->
              <div class="relative w-9 h-9 shrink-0">
                <span
                  v-if="isSelectionMode && canDelete(item)"
                  class="w-full h-full grid place-items-center rounded-full border-2 transition-colors"
                  :class="isSelected(item)
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-transparent'"
                >
                  <v-icon name="hi-solid-check" class="w-4 h-4" />
                </span>
                <img
                  v-else-if="item.pick?.team"
                  :src="item.pick.team.image_path || '/img/default-avatar.svg'"
                  :alt="item.pick.team.name"
                  class="w-full h-full object-contain transition-transform duration-150"
                  :class="[isSelectionMode ? 'grayscale' : '', pressingUuid === item.uuid ? 'scale-90' : '']"
                  @error="onLogoError"
                />
                <span
                  v-else-if="needsPick(item)"
                  class="w-full h-full grid place-items-center rounded-full bg-rose-50 dark:bg-rose-900/30 transition-transform duration-150"
                  :class="pressingUuid === item.uuid ? 'scale-90' : ''"
                >
                  <v-icon name="hi-solid-shield-check" class="w-4 h-4 text-rose-500" />
                </span>
                <span v-else class="w-full h-full grid place-items-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <v-icon name="hi-solid-minus" class="w-4 h-4 text-gray-300 dark:text-gray-600" />
                </span>

                <!-- Hold-to-select ring: fills over the press duration, inviting you to keep holding -->
                <svg
                  v-if="pressingUuid === item.uuid"
                  class="absolute inset-0 -rotate-90 text-red-500 dark:text-red-400"
                  viewBox="0 0 36 36"
                >
                  <circle
                    class="press-ring"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    :style="{ animationDuration: PRESS_HOLD_MS + 'ms' }"
                  />
                </svg>
              </div>

              <!-- Round + team / state -->
              <div class="min-w-0 flex-1">
                <p class="text-2xs font-medium text-gray-400 dark:text-gray-500 truncate">
                  {{ $t('football.rounds.round', { name: item.name }) }}
                  <span v-if="item.is_current" class="text-rose-500 dark:text-rose-400 font-semibold">
                    · {{ $t('survivor.mypicks.current') }}
                  </span>
                </p>
                <p
                  class="text-callout font-semibold truncate"
                  :class="item.pick?.team
                    ? 'text-gray-900 dark:text-white'
                    : needsPick(item)
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-400 dark:text-gray-500 font-medium'"
                >
                  {{ item.pick?.team?.name || (needsPick(item) ? $t('survivor.mypicks.choose') : $t('survivor.mypicks.noPick')) }}
                </p>
              </div>

              <!-- Trailing: final result, or the round's date while it's still open -->
              <span
                v-if="item.pick && (item.pick.is_win || item.pick.is_loss || item.pick.is_draw)"
                class="text-xs font-semibold shrink-0"
                :class="outcome(item.pick).text"
              >
                {{ outcome(item.pick).label }}
              </span>
              <span
                v-else-if="item.pick || needsPick(item)"
                class="text-2xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0"
              >
                {{ formatDate(item.starting_at) }}
              </span>

              <v-icon
                v-if="!isSelectionMode"
                name="hi-solid-chevron-right"
                class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
              />
            </button>
          </div>
        </li>
      </ol>
    </div>

    <!-- Round pick drawer: loads the selected round's fixtures to make a pick -->
    <SurvivorRoundPickDrawer
      :is-open="isDrawerOpen"
      :survivor-uuid="props.survivorUuid"
      :round-uuid="selectedRound?.uuid || ''"
      :round-name="selectedRound ? $t('football.rounds.round', { name: selectedRound.name }) : ''"
      @close="closeDrawer"
      @picked="onPicked"
    />

    <!-- Bulk delete confirmation -->
    <BottomSheet
      :is-visible="showBulkConfirm"
      :title="selectedCount === 1 ? $t('survivor.mypicks.bulkConfirmTitleOne') : $t('survivor.mypicks.bulkConfirmTitleOther', { count: selectedCount })"
      :subtitle="$t('survivor.mypicks.bulkConfirmBody')"
      icon="hi-solid-trash"
      icon-variant="red"
      size="sm"
      :persistent="isBulkDeleting"
      @close="showBulkConfirm = false"
    >
      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="isBulkDeleting"
            @click="showBulkConfirm = false"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:bg-gray-200 dark:active:bg-gray-700 transition-colors disabled:opacity-60"
          >
            {{ $t('common.actions.cancel') }}
          </button>
          <button
            type="button"
            :disabled="isBulkDeleting"
            @click="confirmBulkDelete"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-500 text-white active:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <v-icon v-if="isBulkDeleting" name="pr-spinner" animation="spin" class="w-4 h-4" />
            {{ $t('common.actions.delete') }}
          </button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/composables/useToast";
import { survivorService } from "@/services/survivor/SurvivorServive";
import SurvivorRoundPickDrawer from "@/components/survivor/SurvivorRoundPickDrawer.vue";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import type {
  SurvivorUserPick,
  SurvivorUserPickResponse,
} from "@/interfaces/survivor/SurvivorUserPickResponse";

const props = defineProps<{ survivorUuid: string }>();

const { t, locale } = useI18n();
const { success } = useToast();

const picks = ref<SurvivorUserPickResponse[]>([]);
const isLoading = ref(false);
const error = ref("");

// --- Round pick drawer ---
// The selected round carries the uuid we already have from the picks list, so
// the drawer loads its fixtures directly without a round selector.
const selectedRound = ref<SurvivorUserPickResponse | null>(null);
const isDrawerOpen = ref(false);
// Set when a pick is saved inside the drawer; drives a silent refresh on close.
const pendingRefresh = ref(false);

const openRound = (item: SurvivorUserPickResponse) => {
  selectedRound.value = item;
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
  if (pendingRefresh.value) {
    pendingRefresh.value = false;
    // Silent so the timeline updates without flashing skeletons behind the sheet.
    load(true);
  }
};

const onPicked = () => {
  pendingRefresh.value = true;
};

// Resolve the outcome styling for a pick. Mirrors SurvivorDetailComponent's
// pick badge so the two screens speak the same visual language.
type Outcome = { label: string; text: string; dot: string };
const outcome = (pick: SurvivorUserPick | null): Outcome => {
  if (pick?.is_win)
    return {
      label: t("survivor.detail.result.win"),
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    };
  if (pick?.is_loss)
    return {
      label: t("survivor.detail.result.loss"),
      text: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    };
  if (pick?.is_draw)
    return {
      label: t("survivor.detail.result.draw"),
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    };
  // No pick yet, or the round hasn't been resolved.
  return {
    label: t("survivor.detail.result.pending"),
    text: "text-gray-400 dark:text-gray-500",
    dot: "bg-gray-300 dark:bg-gray-600",
  };
};

// True when a round is still open (not finished) and the user hasn't picked yet —
// the state that needs the user's attention.
const needsPick = (item: SurvivorUserPickResponse): boolean => !item.pick && !item.finished;

// Rail node color: outcome color when resolved, rose when actionable, gray when missed.
const dotClasses = (item: SurvivorUserPickResponse): string => {
  if (item.pick) return outcome(item.pick).dot;
  if (needsPick(item)) return "bg-rose-400 dark:bg-rose-500";
  return "bg-gray-300 dark:bg-gray-600";
};

// Won / drawn / lost tallies for the header record chips.
const record = computed(() => {
  const wins = picks.value.filter((p) => p.pick?.is_win).length;
  const draws = picks.value.filter((p) => p.pick?.is_draw).length;
  const losses = picks.value.filter((p) => p.pick?.is_loss).length;
  return [
    {
      key: "wins",
      count: wins,
      icon: "hi-solid-check",
      title: t("survivor.mypicks.record.wins"),
      classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "draws",
      count: draws,
      icon: "hi-solid-minus",
      title: t("survivor.mypicks.record.draws"),
      classes: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    {
      key: "losses",
      count: losses,
      icon: "hi-solid-x",
      title: t("survivor.mypicks.record.losses"),
      classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
  ];
});

const formatDate = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale.value, { month: "short", day: "numeric" });
};

const onLogoError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/img/default-avatar.svg";
};

// --- Swipe-to-delete ---
// Only a pick on a round that hasn't been played yet can be withdrawn.
const DELETE_WIDTH = 76;
const canDelete = (item: SurvivorUserPickResponse): boolean => !!item.pick && !item.finished;

// uuid of the row currently revealed open (delete button showing), if any.
const openSwipeUuid = ref<string | null>(null);
// uuid of the row being actively dragged right now, if any.
const draggingUuid = ref<string | null>(null);
const dragX = ref(0);
const deletingUuid = ref<string | null>(null);

let startX = 0;
let startY = 0;
let baseX = 0;
let axisLocked: "x" | "y" | null = null;
// True right after a real drag ends, to swallow the click it would otherwise trigger.
let justDragged = false;

const rowOffset = (item: SurvivorUserPickResponse): number => {
  if (draggingUuid.value === item.uuid) return dragX.value;
  return openSwipeUuid.value === item.uuid ? -DELETE_WIDTH : 0;
};

// --- Long-press + drag to multi-select ---
// Holding a row (no swipe, no scroll) enters selection mode with that row
// already checked; dragging from there — or from any row once already
// selecting — keeps adding whichever row the finger passes over, like the
// drag-to-select gesture in iOS Photos/Files.
const PRESS_HOLD_MS = 450;
const PAINT_MOVE_THRESHOLD = 6;
const isPaintSelecting = ref(false);
// uuid of the row currently mid-hold — drives the filling ring that invites
// the user to keep pressing until selection mode kicks in.
const pressingUuid = ref<string | null>(null);
let pressTimer: ReturnType<typeof setTimeout> | null = null;
let paintPointerId: number | null = null;
let paintTarget: HTMLElement | null = null;

const clearPressTimer = () => {
  if (pressTimer !== null) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
  pressingUuid.value = null;
};

// Whatever is under (x, y) — resolved by DOM position, not by which row's
// handler happens to be firing, since a captured pointer keeps reporting
// events on the row where the gesture started.
const selectFromPoint = (x: number, y: number) => {
  const el = document.elementFromPoint(x, y);
  const uuid = el?.closest<HTMLElement>("[data-pick-uuid]")?.dataset.pickUuid;
  if (!uuid || selectedUuids.value.has(uuid)) return;
  const target = picks.value.find((p) => p.uuid === uuid);
  if (!target || !canDelete(target)) return;
  const next = new Set(selectedUuids.value);
  next.add(uuid);
  selectedUuids.value = next;
};

const beginPaintSelect = (e: PointerEvent) => {
  isPaintSelecting.value = true;
  justDragged = true;
  paintPointerId = e.pointerId;
  paintTarget = e.currentTarget as HTMLElement;
  try {
    paintTarget.setPointerCapture(e.pointerId);
  } catch {
    /* pointer already captured elsewhere */
  }
  selectFromPoint(e.clientX, e.clientY);
};

const endPaintSelect = () => {
  isPaintSelecting.value = false;
  if (paintTarget && paintPointerId !== null) {
    try {
      paintTarget.releasePointerCapture(paintPointerId);
    } catch {
      /* pointer already released */
    }
  }
  paintTarget = null;
  paintPointerId = null;
  setTimeout(() => (justDragged = false), 0);
};

const onPointerDown = (e: PointerEvent, item: SurvivorUserPickResponse) => {
  startX = e.clientX;
  startY = e.clientY;
  axisLocked = null;

  if (isSelectionMode.value) {
    // A drag from here (any direction) starts painting more rows into the
    // selection — see onPointerMove. A plain tap still toggles just this
    // row through the button's own @click.
    return;
  }

  if (!canDelete(item)) return;

  // Tentatively arm the horizontal swipe-to-delete drag...
  draggingUuid.value = item.uuid;
  baseX = openSwipeUuid.value === item.uuid ? -DELETE_WIDTH : 0;
  dragX.value = baseX;

  // ...and a long-press: holding still (no swipe, no scroll) enters
  // multi-select instead, with this row already checked. Pointer capture is
  // NOT taken yet in either case — only once a real gesture (swipe or
  // paint-select) is confirmed — so a plain tap still opens the round via
  // the button's native click.
  clearPressTimer();
  pressingUuid.value = item.uuid;
  pressTimer = setTimeout(() => {
    pressTimer = null;
    pressingUuid.value = null;
    if (axisLocked !== null) return; // it already became a swipe or a scroll
    draggingUuid.value = null;
    enterSelectionMode();
    toggleSelected(item);
    beginPaintSelect(e);
  }, PRESS_HOLD_MS);
};

// Movement past the threshold, while already selecting, starts painting —
// checking this row first, then handing off to the same drag-across logic.
const maybeStartPaintFromSelectionMode = (e: PointerEvent, item: SurvivorUserPickResponse) => {
  if (!canDelete(item)) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.abs(dx) < PAINT_MOVE_THRESHOLD && Math.abs(dy) < PAINT_MOVE_THRESHOLD) return;
  if (!selectedUuids.value.has(item.uuid)) toggleSelected(item);
  beginPaintSelect(e);
};

const handleSwipeMove = (e: PointerEvent, item: SurvivorUserPickResponse) => {
  if (draggingUuid.value !== item.uuid) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (axisLocked === null) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    // Lock to whichever axis the gesture committed to first — a vertical
    // intent releases the row so the page keeps scrolling normally (and
    // cancels the long-press: this was a scroll, not a hold).
    clearPressTimer();
    axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (axisLocked === "y") {
      draggingUuid.value = null;
      return;
    }
  }
  if (axisLocked !== "x") return;
  justDragged = true;
  // Clamp: never drag past closed (0) or much beyond the reveal width (small rubber-band).
  dragX.value = Math.min(0, Math.max(-DELETE_WIDTH - 16, baseX + dx));
};

const onPointerMove = (e: PointerEvent, item: SurvivorUserPickResponse) => {
  if (isPaintSelecting.value) {
    selectFromPoint(e.clientX, e.clientY);
    return;
  }
  if (isSelectionMode.value) {
    maybeStartPaintFromSelectionMode(e, item);
    return;
  }
  handleSwipeMove(e, item);
};

const onPointerUp = (item: SurvivorUserPickResponse) => {
  clearPressTimer();
  if (isPaintSelecting.value) {
    endPaintSelect();
    return;
  }
  if (draggingUuid.value !== item.uuid) return;
  draggingUuid.value = null;
  if (axisLocked === "x") {
    openSwipeUuid.value = dragX.value <= -DELETE_WIDTH / 2 ? item.uuid : null;
  }
  // Reset after the (suppressed) click has had a chance to fire.
  setTimeout(() => (justDragged = false), 0);
};

const onRowClick = (item: SurvivorUserPickResponse) => {
  if (justDragged) return;
  if (isSelectionMode.value) {
    toggleSelected(item);
    return;
  }
  if (openSwipeUuid.value === item.uuid) {
    openSwipeUuid.value = null;
    return;
  }
  openRound(item);
};

const handleDelete = async (item: SurvivorUserPickResponse) => {
  if (!item.pick || deletingUuid.value) return;
  const pickId = item.pick.id;
  deletingUuid.value = item.uuid;
  try {
    await survivorService.deletePickById(pickId);
    // The round stays in the timeline — it just goes back to "needs a pick".
    item.pick = null;
    openSwipeUuid.value = null;
    success(t("survivor.mypicks.deleteSuccessTitle"), t("survivor.mypicks.deleteSuccessBody"));
  } catch (e) {
    console.error("Error deleting survivor pick:", e);
  } finally {
    deletingUuid.value = null;
  }
};

// --- Bulk selection & delete ---
// A quiet "Seleccionar" link turns the leading crest of every eligible round
// into a checkbox; tapping rows toggles them and a single red action commits
// the whole batch through deleteAllPickById in one request.
const isSelectionMode = ref(false);
const selectedUuids = ref<Set<string>>(new Set());
const showBulkConfirm = ref(false);
const isBulkDeleting = ref(false);

const hasDeletablePicks = computed(() => picks.value.some(canDelete));
const selectedCount = computed(() => selectedUuids.value.size);
const isSelected = (item: SurvivorUserPickResponse): boolean => selectedUuids.value.has(item.uuid);

const enterSelectionMode = () => {
  isSelectionMode.value = true;
  selectedUuids.value = new Set();
  openSwipeUuid.value = null;
};

const exitSelectionMode = () => {
  isSelectionMode.value = false;
  selectedUuids.value = new Set();
};

const toggleSelected = (item: SurvivorUserPickResponse) => {
  if (!canDelete(item)) return;
  const next = new Set(selectedUuids.value);
  if (next.has(item.uuid)) next.delete(item.uuid);
  else next.add(item.uuid);
  selectedUuids.value = next;
};

const requestBulkDelete = () => {
  if (selectedCount.value === 0) return;
  showBulkConfirm.value = true;
};

const confirmBulkDelete = async () => {
  const targets = picks.value.filter((p) => selectedUuids.value.has(p.uuid) && p.pick);
  const pickIds = targets.map((p) => p.pick!.id);
  if (pickIds.length === 0) {
    showBulkConfirm.value = false;
    return;
  }
  isBulkDeleting.value = true;
  try {
    await survivorService.deleteAllPickById(pickIds);
    // Same as a single delete: rounds stay in the timeline, just back to "needs a pick".
    targets.forEach((p) => {
      p.pick = null;
    });
    showBulkConfirm.value = false;
    exitSelectionMode();
    success(
      t("survivor.mypicks.bulkDeleteSuccessTitle"),
      pickIds.length === 1
        ? t("survivor.mypicks.bulkDeleteSuccessBodyOne")
        : t("survivor.mypicks.bulkDeleteSuccessBodyOther"),
    );
  } catch (e) {
    console.error("Error bulk deleting survivor picks:", e);
  } finally {
    isBulkDeleting.value = false;
  }
};

const load = async (silent = false) => {
  if (!props.survivorUuid) return;
  if (!silent) isLoading.value = true;
  error.value = "";
  try {
    // HTTP-silent: on a not-found/stale survivor uuid we show the in-component
    // error card (with retry) instead of the global "resource not found" toast.
    picks.value = await survivorService.getMyPicksBySurvivorUuid(props.survivorUuid, true);
  } catch (e) {
    console.error("Error loading survivor picks:", e);
    if (!silent) error.value = t("survivor.mypicks.loadError");
  } finally {
    if (!silent) isLoading.value = false;
  }
};

// React to the survivor uuid: fires on mount and again if the user navigates
// straight from one survivor to another (the parent view instance is reused,
// so this component isn't remounted and onMounted alone would keep stale picks).
watch(() => props.survivorUuid, () => load(), { immediate: true });
</script>

<style scoped>
/* The picks timeline is a gesture surface (tap to open, swipe to delete,
   hold to multi-select) — not copyable text. Without this, a long-press or a
   drag across rows on iOS starts a native text selection + callout
   ("Copiar / Traducir") over the rounds. user-select and -webkit-touch-callout
   inherit, so setting them on the board disables selection for every row.
   Declared as real CSS (not a Tailwind arbitrary class) so the vendor-prefixed
   properties iOS needs are guaranteed to ship. */
.picks-board {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Hold-to-select ring: circumference of r=16 is 2*pi*16 ≈ 100.53. Starts
   fully hidden and draws in over the same duration as the long-press timer
   (bound inline as --duration via animationDuration), so it finishes exactly
   as selection mode kicks in — the ring IS the countdown. */
.press-ring {
  stroke-dasharray: 100.53;
  stroke-dashoffset: 100.53;
  animation-name: press-ring-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes press-ring-fill {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
