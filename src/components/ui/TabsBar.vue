<script setup lang="ts" generic="K extends string = string">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ACCENT_CHIP, ACCENT_TEXT, type NavAccent, type NavItem } from "@/components/ui/navAccents";

/**
 * The app's section tabs, in the two shapes they actually take.
 *
 * `floating` is the glass pill pinned under the header — the one a section uses
 * to move between its own panels (a fantasy league, a pool, a survivor).
 * `rail` is the grey track that sits inside the content, for tabs that belong to
 * a card rather than to the screen (the league sections on Home, the match
 * centre). They were two components; the difference between them was never more
 * than the container, and keeping them apart is how the indicator ended up with
 * two settle timings and the scroll behaviour with two implementations.
 *
 * Selection is fully controlled — this never holds its own idea of what is
 * active. Bind `v-model`, or `:active-key` + `@select` when the truth lives
 * somewhere the component cannot write to, like the route.
 */
const props = withDefaults(
  defineProps<{
    items: NavItem<K>[];
    /** Active option. Ignored when `v-model` is bound. */
    activeKey?: K | "";
    modelValue?: K;
    ariaLabel?: string;
    /**
     * `floating` — glass pill, pinned under the app header, floating over the
     * content it scrolls with.
     * `rail` — grey track, sitting in the content flow.
     */
    variant?: "floating" | "rail";
    /**
     * `inline` — glyph beside the label. Comfortable up to about four options.
     * `stacked` — glyph over the label. Each option drops from ~105px to ~56px,
     * which is what lets five fit on a 375px phone without scrolling.
     */
    layout?: "inline" | "stacked";
    /**
     * Accent for options that don't name one. Left unset, an option without an
     * `accent` never highlights — the neutral "back out of here" shortcut pools
     * and survivor put first in their strip. Strips where every option should
     * highlight set this once instead of repeating a colour per item.
     */
    defaultAccent?: NavAccent;
    /**
     * `navigation` — the options lead somewhere (the strip mirrors the route).
     * `tablist` — the options swap panels in place, without navigating.
     */
    role?: "navigation" | "tablist";
  }>(),
  {
    activeKey: "",
    modelValue: undefined,
    ariaLabel: "Sections",
    variant: "floating",
    layout: "inline",
    defaultAccent: undefined,
    role: "navigation",
  },
);

const emit = defineEmits<{
  select: [key: K];
  "update:modelValue": [key: K];
}>();

const active = computed<string>(() => props.modelValue ?? props.activeKey ?? "");
const isFloating = computed(() => props.variant === "floating");
const isTablist = computed(() => props.role === "tablist");

const accentOf = (item: NavItem<K>): NavAccent | undefined => item.accent ?? props.defaultAccent;

const isActive = (item: NavItem<K>): boolean =>
  !item.disabled && !!accentOf(item) && active.value === item.key;

const onClick = (item: NavItem<K>): void => {
  if (item.disabled) return;
  emit("select", item.key);
  emit("update:modelValue", item.key);
};

// ── Presentation ─────────────────────────────────────────────────────────────
const trackClass = computed(() =>
  isFloating.value
    ? "gap-1 p-1 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
    : "gap-1 p-0.5 bg-gray-100 dark:bg-gray-800",
);

// The fade has to be painted in the track's own colour or it reads as a smudge
// rather than as content passing under an edge.
const fadeFromClass = computed(() =>
  isFloating.value
    ? "from-white/95 dark:from-gray-900/90"
    : "from-gray-100 dark:from-gray-800",
);

const itemLayoutClass = computed(() =>
  props.layout === "stacked"
    ? "flex-col justify-center gap-0.5 px-2.5 py-1.5 min-w-[56px] text-2xs"
    : "gap-1.5 px-3.5 py-2 text-xs",
);
const iconSizeClass = computed(() => (props.layout === "stacked" ? "w-[18px] h-[18px]" : "w-4 h-4"));

// Options carry only weight and colour; the highlight itself is the one chip
// gliding behind them.
const itemClass = (item: NavItem<K>): string => {
  if (item.disabled) {
    return "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50 font-semibold";
  }
  if (isActive(item)) {
    return `${ACCENT_TEXT[accentOf(item) as NavAccent]} font-bold`;
  }
  return "text-gray-500 dark:text-gray-400 font-semibold active:text-gray-700 dark:active:text-gray-200";
};

// ── Sliding indicator ────────────────────────────────────────────────────────
// One chip glides beneath the active option. It lives inside the scrolling
// track and is placed in layout coordinates (offsetLeft/Top), so it stays glued
// to its option as the track scrolls — no scroll maths involved.
type Rect = { left: number; top: number; width: number; height: number };

const trackRef = ref<HTMLElement | null>(null);
const buttonRefs = new Map<string, HTMLElement>();
const indicatorRect = ref<Rect | null>(null);

const setButtonRef = (key: string, el: Element | null): void => {
  if (el instanceof HTMLElement) buttonRefs.set(key, el);
  else buttonRefs.delete(key);
};

const activeItem = computed(() => props.items.find((item) => isActive(item)) ?? null);
const indicatorClass = computed(() => {
  const accent = activeItem.value ? accentOf(activeItem.value) : undefined;
  return accent ? ACCENT_CHIP[accent] : "";
});

const updateIndicator = (): void => {
  const button = activeItem.value ? buttonRefs.get(activeItem.value.key) : undefined;
  if (!button) {
    indicatorRect.value = null;
    return;
  }

  // Position comes from offsetLeft/Top — layout coordinates, immune to however
  // far the track happens to be scrolled. Size comes from the fractional box
  // instead: offsetWidth rounds to whole pixels against the element's current
  // sub-pixel x, so measuring mid-scroll could leave the chip a pixel narrower
  // than the option it belongs to.
  const box = button.getBoundingClientRect();
  indicatorRect.value = {
    left: button.offsetLeft,
    top: button.offsetTop,
    width: box.width,
    height: box.height,
  };
};

// ── Scroll ───────────────────────────────────────────────────────────────────
// Scroll only as far as needed to bring the active option fully into view,
// flush against whichever edge clipped it. Dead-centring it unconditionally
// scrolls past option 0 even when it already fits, which reads as truncated
// text rather than as "there is more this way".
const scrollActiveIntoView = (behavior: ScrollBehavior): void => {
  const track = trackRef.value;
  const button = buttonRefs.get(active.value);
  if (!track || !button) return;

  const visibleLeft = track.scrollLeft;
  const visibleRight = visibleLeft + track.clientWidth;
  const buttonRight = button.offsetLeft + button.offsetWidth;

  let target: number;
  if (button.offsetLeft < visibleLeft) {
    target = Math.max(0, button.offsetLeft - 8);
  } else if (buttonRight > visibleRight) {
    target = buttonRight - track.clientWidth + 8;
  } else {
    return; // Already fully visible — leave the scroll position alone.
  }

  const maxScrollLeft = track.scrollWidth - track.clientWidth;
  track.scrollTo({ left: Math.max(0, Math.min(target, maxScrollLeft)), behavior });
};

const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const updateEdges = (): void => {
  const track = trackRef.value;
  if (!track) return;
  canScrollLeft.value = track.scrollLeft > 2;
  canScrollRight.value = track.scrollLeft < track.scrollWidth - track.clientWidth - 2;
};

const refresh = (behavior: ScrollBehavior): void => {
  scrollActiveIntoView(behavior);
  updateIndicator();
  updateEdges();
};

const onResize = (): void => {
  updateIndicator();
  updateEdges();
};

// The panel a tab opens mounts after the chip has been measured, and its content
// can reflow the strip by a pixel or two — a scrollbar appearing is enough. The
// window never resizes, so watching the track itself is what keeps the chip on
// its option instead of a hair beside it until something else forces a redraw.
let trackObserver: ResizeObserver | null = null;

// Jump straight there on first paint, animate on every change after that.
onMounted(() => {
  nextTick(() => refresh("auto"));
  window.addEventListener("resize", onResize);

  if (typeof ResizeObserver !== "undefined" && trackRef.value) {
    trackObserver = new ResizeObserver(onResize);
    trackObserver.observe(trackRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  trackObserver?.disconnect();
});

watch(
  () => [active.value, props.items] as const,
  () => nextTick(() => refresh("smooth")),
  { flush: "post" },
);
</script>

<template>
  <!-- Floating: the wrapper spans the row but is click-through, so only the
       pill takes taps and the content behind its edges stays reachable. -->
  <component
    :is="isTablist ? 'div' : 'nav'"
    :aria-label="ariaLabel"
    :role="isTablist ? 'tablist' : undefined"
    class="flex"
    :class="isFloating ? 'tabs-sticky sticky z-40 pointer-events-none justify-center mb-4' : 'relative'"
  >
    <!-- Row: the strip and, optionally, an action fixed to its right. The action
         sits OUTSIDE the scrolling track so it can never be scrolled off. -->
    <div class="flex items-center gap-1.5 max-w-full" :class="isFloating ? '' : 'w-full'">
      <!-- Wrapper matches the track's own box (not the content scrolling inside
           it) so the edge fades stay pinned to its visual edges. -->
      <div class="relative min-w-0 max-w-full" :class="isFloating ? '' : 'flex-1'">
        <div
          ref="trackRef"
          class="tabs-track relative pointer-events-auto flex items-center rounded-full max-w-full overflow-x-auto overscroll-x-contain"
          :class="trackClass"
          @scroll="updateEdges"
        >
          <!-- The one moving shape, measured from the real button box so it
               always matches it exactly. Sits behind the options (z-10). -->
          <span
            v-if="indicatorRect"
            class="tabs-indicator absolute top-0 left-0 rounded-full pointer-events-none"
            :class="indicatorClass"
            :style="{
              transform: `translate(${indicatorRect.left}px, ${indicatorRect.top}px)`,
              width: indicatorRect.width + 'px',
              height: indicatorRect.height + 'px',
            }"
          />

          <button
            v-for="item in items"
            :key="item.key"
            :ref="(el) => setButtonRef(item.key, el as Element | null)"
            type="button"
            :role="isTablist ? 'tab' : undefined"
            :aria-selected="isTablist ? isActive(item) : undefined"
            :aria-current="!isTablist && isActive(item) ? 'page' : undefined"
            :aria-label="item.label"
            :disabled="item.disabled"
            class="relative z-10 flex items-center shrink-0 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed"
            :class="[itemLayoutClass, itemClass(item)]"
            @click="onClick(item)"
          >
            <v-icon
              :name="item.icon"
              class="shrink-0 transition-transform duration-200 ease-out"
              :class="[iconSizeClass, isActive(item) ? 'scale-110' : '']"
            />
            <span class="leading-none tracking-tight">{{ item.label }}</span>
          </button>
        </div>

        <!-- Hints that there are more options past the edge. -->
        <div
          class="tabs-edge-fade left-0 rounded-l-full bg-gradient-to-r"
          :class="[fadeFromClass, canScrollLeft ? 'opacity-100' : 'opacity-0']"
          aria-hidden="true"
        />
        <div
          class="tabs-edge-fade right-0 rounded-r-full bg-gradient-to-l"
          :class="[fadeFromClass, canScrollRight ? 'opacity-100' : 'opacity-0']"
          aria-hidden="true"
        />
      </div>

      <!-- Action parked beside the strip, outside the scrolling track (the
           fantasy league's "More" button). Whatever goes here brings its own
           `pointer-events-auto`: the floating wrapper is click-through. -->
      <slot name="trailing" />
    </div>
  </component>
</template>

<style scoped>
/* Pinned right below the fixed HeaderMenu — same offsets as .main-content-safe
   (header h-12/h-14 plus the iOS safe area), leaving a small breathing gap. */
.tabs-sticky {
  top: calc(3.5rem + env(safe-area-inset-top, 0px));
}
@media (min-width: 640px) {
  .tabs-sticky {
    top: calc(4rem + env(safe-area-inset-top, 0px));
  }
}

/* The strip scrolls sideways on narrow phones; its scrollbar would be chrome,
   not information. */
.tabs-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tabs-track::-webkit-scrollbar {
  display: none;
}

/* z-20 sits above the options (z-10), but click-through so a tap still reaches
   whichever option the fade partly covers. */
.tabs-edge-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.75rem;
  z-index: 20;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* A touch of overshoot on the slide itself is the settle; size and colour stay
   non-bouncy so the chip doesn't stretch oddly between differently sized
   options. Same curves as BottomNavBar, which is the same control one level up. */
.tabs-indicator {
  transition:
    transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1),
    width 240ms cubic-bezier(0.22, 1, 0.36, 1),
    height 240ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 240ms ease;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .tabs-indicator,
  button {
    transition: none !important;
  }
}
</style>
