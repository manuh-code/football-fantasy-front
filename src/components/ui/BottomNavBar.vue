<script lang="ts">
// Shared floating bottom navigation (FotMob / Apple Sports style).
// Minimal glass pill that hugs its content. Reused across the app.
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export type BottomNavAccent =
  | "blue"
  | "emerald"
  | "orange"
  | "red"
  | "purple"
  | "sky"
  | "amber";

export interface BottomNavItem {
  key: string;
  label: string;
  icon: string;
  /** Accent color applied when this item is the active one. Omit for a neutral
   *  item that never highlights (e.g. a "navigate away" shortcut). */
  accent?: BottomNavAccent;
  disabled?: boolean;
}

// --- Single-pill guard (module-level, shared by every instance) --------------
// Several screens mount their own <BottomNavBar> (HomeMenu, MenuDraft, ...)
// and every instance teleports its floating pill into the
// same `#app`, all pinned to `fixed bottom-0 z-[100]`. During a route change the
// outgoing and incoming views overlap for a tick, so two pills can land on top
// of each other ("encimado", looking like the bar lost its style).
//
// This registry tracks every currently-visible instance and only lets the most
// recently shown one render, so there is never more than one floating pill
// regardless of how many instances are briefly alive. It MUST live in this
// module-level <script> block (not <script setup>, which runs per instance) so
// all instances share the same state.
let nextUid = 0;
const visibleStack = ref<number[]>([]);
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: BottomNavItem[];
    /** Key of the active item (highlighted with its accent). */
    activeKey?: string;
    /** Whether the bar is rendered at all. */
    visible?: boolean;
    ariaLabel?: string;
  }>(),
  {
    activeKey: "",
    visible: true,
    ariaLabel: "Navigation",
  },
);

const emit = defineEmits<{ select: [key: string] }>();

// This instance's slot in the shared single-pill registry (see <script> above).
const uid = nextUid++;

const claim = () => {
  visibleStack.value = [...visibleStack.value.filter((id) => id !== uid), uid];
};
const release = () => {
  visibleStack.value = visibleStack.value.filter((id) => id !== uid);
};

watch(
  () => props.visible,
  (isVisible) => (isVisible ? claim() : release()),
  { immediate: true },
);
onUnmounted(release);

// True only for the top-most (latest shown) visible instance.
const isTopMost = computed(
  () => visibleStack.value[visibleStack.value.length - 1] === uid,
);
const showBar = computed(() => props.visible && isTopMost.value);

// Static maps so Tailwind keeps these classes during purge.
const ACCENT_TEXT: Record<BottomNavAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  purple: "text-purple-600 dark:text-purple-400",
  sky: "text-sky-600 dark:text-sky-400",
  amber: "text-amber-600 dark:text-amber-400",
};
// Active-item chip: a stronger tint plus a crisp inset ring so the selected
// destination reads as a raised, clearly-selected key — not just a ghost tint.
const ACCENT_BG: Record<BottomNavAccent, string> = {
  blue: "bg-blue-500/15 ring-1 ring-inset ring-blue-500/30 dark:bg-blue-400/15 dark:ring-blue-400/30",
  emerald: "bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-400/15 dark:ring-emerald-400/30",
  orange: "bg-orange-500/15 ring-1 ring-inset ring-orange-500/30 dark:bg-orange-400/15 dark:ring-orange-400/30",
  red: "bg-red-500/15 ring-1 ring-inset ring-red-500/30 dark:bg-red-400/15 dark:ring-red-400/30",
  purple: "bg-purple-500/15 ring-1 ring-inset ring-purple-500/30 dark:bg-purple-400/15 dark:ring-purple-400/30",
  sky: "bg-sky-500/15 ring-1 ring-inset ring-sky-500/30 dark:bg-sky-400/15 dark:ring-sky-400/30",
  amber: "bg-amber-500/15 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-400/15 dark:ring-amber-400/30",
};

const isActive = (item: BottomNavItem): boolean =>
  !item.disabled && !!item.accent && props.activeKey === item.key;

// Buttons now carry only text color — the highlighted background lives in the
// single sliding indicator behind them (see below).
const itemClasses = (item: BottomNavItem): string => {
  if (item.disabled) return "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50";
  if (isActive(item)) return ACCENT_TEXT[item.accent as BottomNavAccent];
  return "text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300";
};

// Screens with every tab available (e.g. a fantasy league once "Home" is
// added to its member tabs) can reach 5-6 items; tighten the pill so it still
// fits one row instead of overflowing on narrow phones.
const isDense = computed(() => props.items.length > 4);
const itemSizeClass = computed(() =>
  isDense.value ? "px-3 py-2 min-w-[52px] gap-0.5" : "px-5 py-2.5 min-w-[68px] gap-1",
);
const itemLabelSizeClass = computed(() => (isDense.value ? "text-2xs" : "text-xs"));
const rowGapClass = computed(() => (isDense.value ? "gap-0.5" : "gap-1"));
// Slightly smaller glyphs in dense mode so 5–6 destinations stay on one row on
// the narrowest phones without crowding.
const iconSizeClass = computed(() => (isDense.value ? "w-5 h-5" : "w-6 h-6"));

const activeItem = computed(() => props.items.find((item) => isActive(item)) ?? null);
const indicatorColorClass = computed(() =>
  activeItem.value?.accent ? ACCENT_BG[activeItem.value.accent] : "",
);

const onClick = (item: BottomNavItem): void => {
  if (suppressClick) return;
  if (item.disabled) return;
  emit("select", item.key);
};

// --- Sliding indicator ---------------------------------------------------
// One pill glides beneath whichever item is active/previewed, instead of each
// button owning its own background. That single moving shape is what makes a
// tab change (or a drag preview) read as continuous motion rather than a cut.
const containerRef = ref<HTMLElement | null>(null);
const btnRefs = new Map<string, HTMLElement>();
const setBtnRef = (key: string, el: HTMLElement | null) => {
  if (el) btnRefs.set(key, el);
  else btnRefs.delete(key);
};

// Full box (not just width) so the pill always matches the button it's
// sitting under exactly — a couple of items wrapping to a taller/shorter
// label was what made the circle look "crooked" against the others.
type PillRect = { left: number; top: number; width: number; height: number };
const indicatorRect = ref<PillRect | null>(null);
const pressRect = ref<PillRect | null>(null);

// offsetLeft/Top/Width/Height (not getBoundingClientRect) so the position
// stays correct regardless of any scroll offset — pure layout coordinates.
const measure = (key: string | null): PillRect | null => {
  if (!key) return null;
  const btn = btnRefs.get(key);
  if (!btn) return null;
  return { left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight };
};

const updateIndicator = () => {
  indicatorRect.value = measure(activeItem.value?.key ?? null);
};
const updatePress = () => {
  const rect = measure(previewKey.value);
  pressRect.value = rect;
  if (rect && !isDragging.value) pressLeft.value = rect.left;
};

watch(() => [props.activeKey, props.items] as const, () => nextTick(updateIndicator), {
  flush: "post",
});
watch(showBar, (isVisible) => isVisible && nextTick(updateIndicator));

onMounted(() => {
  updateIndicator();
  window.addEventListener("resize", updateIndicator);
});
onUnmounted(() => window.removeEventListener("resize", updateIndicator));

// --- Drag-to-select (iOS-style) -------------------------------------------
// Dragging a finger across the bar previews whichever tab it's currently
// over — the neutral "press" pill tracks the finger 1:1, with zero transition
// lag, exactly like scrubbing through an iOS quick-action menu — and
// releasing commits that tab. A plain tap (no real movement) never engages
// any of this and goes straight through the button's own @click.
const isDragging = ref(false);
const previewKey = ref<string | null>(null);
// The preview pill's x position while a drag is live: follows the pointer
// directly rather than snapping between item slots, so the motion itself
// (not just the eventual selection) feels continuous.
const pressLeft = ref(0);
let barRects: { key: string; left: number; right: number }[] = [];
let dragStartX = 0;
let dragMoved = false;
let suppressClick = false;
let activePointer: number | null = null;

const updateLivePress = (clientX: number) => {
  if (!containerRef.value || !pressRect.value) return;
  const containerBox = containerRef.value.getBoundingClientRect();
  const width = pressRect.value.width;
  const raw = clientX - containerBox.left - width / 2;
  const max = containerRef.value.clientWidth - width;
  pressLeft.value = Math.max(0, Math.min(Math.max(max, 0), raw));
};

watch(previewKey, () => nextTick(updatePress));
// Once the parent echoes the committed key back as activeKey, hand off from
// the neutral preview pill to the colored indicator with no visible gap.
watch(
  () => props.activeKey,
  (key) => {
    if (key === previewKey.value) previewKey.value = null;
  },
);

const computeBarRects = () => {
  if (!containerRef.value) return [];
  const containerBox = containerRef.value.getBoundingClientRect();
  return props.items
    .filter((item) => !item.disabled)
    .map((item) => {
      const btn = btnRefs.get(item.key);
      const box = btn?.getBoundingClientRect();
      const left = box ? box.left : containerBox.left;
      const right = box ? box.right : containerBox.left;
      return { key: item.key, left, right };
    });
};

// Items are excluded from barRects when disabled, so a finger resting over a
// disabled tab simply finds nothing here — the preview stays put instead of
// jumping onto it.
const hitTest = (clientX: number) => {
  if (!barRects.length) return null;
  if (clientX <= barRects[0].left) return barRects[0];
  const last = barRects[barRects.length - 1];
  if (clientX >= last.right) return last;
  return barRects.find((rect) => clientX >= rect.left && clientX <= rect.right) ?? null;
};

const onBarPointerDown = (e: PointerEvent) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  barRects = computeBarRects();
  dragStartX = e.clientX;
  dragMoved = false;
  isDragging.value = true;
  activePointer = e.pointerId;
  // Pointer capture is deliberately NOT taken here. Capturing on every press
  // (even a plain tap) is what made tapping an icon directly stop working —
  // some browsers won't fire the button's native `click` once the ancestor
  // holds capture. It's taken lazily below, only once a real drag starts.
};

const onBarPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  if (!dragMoved) {
    if (Math.abs(e.clientX - dragStartX) <= 6) return;
    dragMoved = true;
    if (activePointer !== null) containerRef.value?.setPointerCapture(activePointer);
  }
  const hit = hitTest(e.clientX);
  if (hit) {
    previewKey.value = hit.key;
    // Measured synchronously (buttons are already rendered, nothing to wait
    // on) so the very first frame of a new preview has a size to follow —
    // no one-tick flash at the left edge before it "catches up".
    pressRect.value = measure(hit.key);
  }
  updateLivePress(e.clientX);
};

const endDrag = () => {
  isDragging.value = false;
  if (dragMoved && containerRef.value && activePointer !== null) {
    try {
      containerRef.value.releasePointerCapture(activePointer);
    } catch {
      /* pointer already released */
    }
  }
  activePointer = null;
};

const onBarPointerUp = () => {
  if (!isDragging.value) return;
  const committedKey = previewKey.value;
  endDrag();
  if (dragMoved && committedKey && committedKey !== props.activeKey) {
    // Suppress the click the browser may still fire on the origin button.
    suppressClick = true;
    emit("select", committedKey);
    setTimeout(() => (suppressClick = false), 0);
  } else {
    previewKey.value = null;
  }
  setTimeout(() => (dragMoved = false), 0);
};

const onBarPointerCancel = () => {
  if (!isDragging.value) return;
  endDrag();
  previewKey.value = null;
  dragMoved = false;
};
</script>

<template>
  <!-- Teleport outside transform context so fixed positioning works -->
  <Teleport to="#app">
    <!-- Floating pill nav: the <nav> spans the row but is click-through; only the
         capsule is interactive. The pill hugs its content and stays centered. -->
    <nav
      v-if="showBar"
      :aria-label="ariaLabel"
      class="fixed inset-x-0 bottom-0 z-[100] pointer-events-none flex justify-center"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
    >
      <div
        ref="containerRef"
        class="relative pointer-events-auto flex items-center p-1.5 rounded-full max-w-[calc(100%-1rem)] bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/40 select-none touch-none"
        :class="rowGapClass"
        @pointerdown="onBarPointerDown"
        @pointermove="onBarPointerMove"
        @pointerup="onBarPointerUp"
        @pointercancel="onBarPointerCancel"
      >
        <!-- Active indicator: the one moving shape the whole bar is built around.
             Positioned from the real measured box of its button (left/top/width/
             height) rather than an assumed uniform size, so it always matches
             that button exactly instead of looking skewed against it. -->
        <span
          v-if="indicatorRect"
          class="nav-indicator absolute top-0 left-0 rounded-full pointer-events-none"
          :class="indicatorColorClass"
          :style="{
            transform: `translate(${indicatorRect.left}px, ${indicatorRect.top}px)`,
            width: indicatorRect.width + 'px',
            height: indicatorRect.height + 'px',
          }"
        />
        <!-- Touch preview: neutral pill that tracks the finger 1:1 while dragging -->
        <span
          v-if="isDragging && pressRect && previewKey && previewKey !== activeKey"
          class="nav-press absolute top-0 left-0 rounded-full pointer-events-none bg-gray-900/[0.06] dark:bg-white/10"
          :style="{
            transform: `translate(${pressLeft}px, ${pressRect.top}px)`,
            width: pressRect.width + 'px',
            height: pressRect.height + 'px',
          }"
        />

        <button
          v-for="item in items"
          :key="item.key"
          :ref="(el) => setBtnRef(item.key, el as HTMLElement | null)"
          type="button"
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          :disabled="item.disabled"
          @click="onClick(item)"
          class="relative z-10 flex shrink-0 flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          :class="[itemSizeClass, itemClasses(item)]"
        >
          <v-icon
            :name="item.icon"
            class="shrink-0 transition-transform duration-200 ease-out"
            :class="[iconSizeClass, isActive(item) ? 'scale-110' : '']"
          />
          <span
            class="whitespace-nowrap tracking-tight leading-none"
            :class="[itemLabelSizeClass, isActive(item) ? 'font-bold' : 'font-semibold']"
          >{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<style scoped>
.nav-indicator {
  /* A touch of overshoot on the move itself (a real "settle", not just an
     ease-out) is the improved slide; width/height/color stay non-bouncy so
     they don't stretch oddly when jumping between differently sized tabs. */
  transition:
    transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    width 260ms cubic-bezier(0.22, 1, 0.36, 1),
    height 260ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 260ms ease;
  will-change: transform;
}
.nav-press {
  /* No transform transition on purpose: this pill tracks the raw pointer
     position every frame, so it must move with zero lag to feel attached
     to the finger. Only its size/fade animate. */
  transition:
    width 140ms ease-out,
    height 140ms ease-out,
    opacity 140ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .nav-indicator,
  .nav-press,
  button {
    transition: none !important;
  }
}
</style>
