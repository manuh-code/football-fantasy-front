<script setup lang="ts" generic="K extends string = string">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BottomSheet from "@/components/ui/BottomSheet.vue";
import { useMediaQuery } from "@/composables/useMediaQuery";
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
    /**
     * Options moved behind the "More" button, chosen by meaning rather than by
     * how many fit — what a fantasy league does with its admin screens. Takes
     * precedence over `maxVisible`.
     */
    overflow?: NavItem<K>[];
    /**
     * How many options stay in the strip on a phone; the rest fall behind
     * "More". Unset means every option stays in the strip.
     *
     * A strip past five options stops being readable — you can't see how many
     * there are, and the ones off the edge may as well not exist
     * (`bottom-nav-limit`). Scrolling sideways doesn't fix that: it hides the
     * count too.
     */
    maxVisible?: number;
    /** Same, from 768px up, where the row has real estate. Unset means all. */
    maxVisibleWide?: number;
    /** Label of the overflow button while no option inside it is active. */
    overflowLabel?: string;
    /** Heading of the sheet the overflow button opens. */
    overflowTitle?: string;
    /**
     * Stacking order of the overflow sheet. Raise it above whatever surface the
     * strip lives on — a strip inside a drawer needs to clear that drawer.
     */
    overflowZIndex?: number;
  }>(),
  {
    activeKey: "",
    modelValue: undefined,
    ariaLabel: "Sections",
    variant: "floating",
    layout: "inline",
    defaultAccent: undefined,
    role: "navigation",
    overflow: undefined,
    maxVisible: undefined,
    maxVisibleWide: undefined,
    overflowLabel: "",
    overflowTitle: "",
    overflowZIndex: undefined,
  },
);

const emit = defineEmits<{
  select: [key: K];
  "update:modelValue": [key: K];
}>();

const { t } = useI18n();

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

// ── Overflow ─────────────────────────────────────────────────────────────────
// Either the caller says which options belong behind "More", or the strip keeps
// the first `maxVisible` and moves the tail there itself.
const isWide = useMediaQuery("(min-width: 768px)");

const limit = computed(() => {
  const max = isWide.value ? props.maxVisibleWide : props.maxVisible;
  return max && max > 0 ? max : props.items.length;
});

const hasExplicitOverflow = computed(() => (props.overflow?.length ?? 0) > 0);

const strip = computed<NavItem<K>[]>(() =>
  hasExplicitOverflow.value ? props.items : props.items.slice(0, limit.value),
);

const overflowItems = computed<NavItem<K>[]>(() =>
  hasExplicitOverflow.value ? (props.overflow as NavItem<K>[]) : props.items.slice(limit.value),
);

const isOverflowOpen = ref(false);

// When the open panel lives in the sheet, the button takes its name and its
// highlight: otherwise nothing on the bar tells the user where they are.
const activeOverflowItem = computed(() => overflowItems.value.find(isActive) ?? null);
const overflowIcon = computed(() => activeOverflowItem.value?.icon ?? "hi-solid-dots-horizontal");
const overflowText = computed(
  () => activeOverflowItem.value?.label ?? (props.overflowLabel || t("ui.tabs.more")),
);
const overflowSheetTitle = computed(() => props.overflowTitle || t("ui.tabs.moreTitle"));

const overflowButtonClass = computed(() => {
  const item = activeOverflowItem.value;
  if (!item) return "text-gray-500 dark:text-gray-400 font-semibold";
  const accent = accentOf(item) as NavAccent;
  return `${ACCENT_TEXT[accent]} font-bold ${ACCENT_CHIP[accent]}`;
});

const selectOverflow = (item: NavItem<K>): void => {
  if (item.disabled) return;
  isOverflowOpen.value = false;
  onClick(item);
};

// Un cambio de panel desde fuera (atrás del navegador, enlace compartido) debe
// cerrar la hoja: si no, se queda abierta encima del panel nuevo.
watch(active, () => (isOverflowOpen.value = false));

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

// The overflow button sits outside the scrolling track, in its own copy of the
// track's shell, so both blocks measure exactly the same height.
const trailingWrapClass = computed(() =>
  isFloating.value
    ? "p-1 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
    : "p-0.5 bg-gray-100 dark:bg-gray-800",
);

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

// Only an option still in the strip can carry the chip; when the active one
// lives in the sheet, the overflow button wears the highlight instead.
const activeItem = computed(() => strip.value.find((item) => isActive(item)) ?? null);
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

// `strip`, not `items`: the breakpoint can move options in and out of it
// without `items` ever changing.
watch(
  () => [active.value, strip.value] as const,
  () => nextTick(() => refresh("smooth")),
  { flush: "post" },
);
</script>

<template>
  <!-- Floating: the wrapper spans the row but is click-through, so only the
       pill takes taps and the content behind its edges stays reachable. -->
  <!-- El rol `tablist` va en la pista, no aquí: el botón "Más" es un
       `aria-haspopup`, no una pestaña, y dentro de un tablist no pinta nada. -->
  <component
    :is="isTablist ? 'div' : 'nav'"
    :aria-label="isTablist ? undefined : ariaLabel"
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
          :role="isTablist ? 'tablist' : undefined"
          :aria-label="isTablist ? ariaLabel : undefined"
          class="tabs-track relative pointer-events-auto flex items-center rounded-full max-w-full overflow-x-auto overscroll-x-contain"
          :class="trackClass"
          @scroll="updateEdges"
        >
          <!-- The one moving shape, measured from the real button box so it
               always matches it exactly. Sits behind the options (z-10). -->
          <span
            v-if="indicatorRect"
            aria-hidden="true"
            class="tabs-indicator absolute top-0 left-0 rounded-full pointer-events-none"
            :class="indicatorClass"
            :style="{
              transform: `translate(${indicatorRect.left}px, ${indicatorRect.top}px)`,
              width: indicatorRect.width + 'px',
              height: indicatorRect.height + 'px',
            }"
          />

          <button
            v-for="item in strip"
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

      <!-- "More": the rest of the options, parked beside the strip and outside
           the scrolling track so it can never be scrolled off. -->
      <div
        v-if="overflowItems.length"
        class="pointer-events-auto shrink-0 rounded-full"
        :class="trailingWrapClass"
      >
        <button
          type="button"
          aria-haspopup="dialog"
          :aria-expanded="isOverflowOpen"
          :aria-label="overflowText"
          @click="isOverflowOpen = true"
          class="flex items-center shrink-0 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          :class="[itemLayoutClass, overflowButtonClass]"
        >
          <v-icon :name="overflowIcon" class="shrink-0" :class="iconSizeClass" />
          <span class="leading-none tracking-tight">{{ overflowText }}</span>
        </button>
      </div>

      <!-- Extra action beside the strip. Whatever goes here brings its own
           `pointer-events-auto`: the floating wrapper is click-through. -->
      <slot name="trailing" />
    </div>

    <!-- The overflow options, named and reachable in one tap instead of hidden
         past the edge of a sideways scroll. -->
    <BottomSheet
      v-if="overflowItems.length"
      :is-visible="isOverflowOpen"
      :title="overflowSheetTitle"
      size="auto"
      role="dialog"
      :z-index="overflowZIndex"
      @close="isOverflowOpen = false"
    >
      <nav
        :aria-label="overflowSheetTitle"
        class="pb-2 divide-y divide-gray-100 dark:divide-gray-800"
      >
        <button
          v-for="item in overflowItems"
          :key="item.key"
          type="button"
          :disabled="item.disabled"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="selectOverflow(item)"
          class="w-full flex items-center gap-3 min-h-[44px] px-1 py-3 text-left cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div
            class="w-9 h-9 rounded-xl grid place-items-center shrink-0"
            :class="isActive(item)
              ? ACCENT_CHIP[accentOf(item) as NavAccent]
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'"
          >
            <v-icon
              :name="item.icon"
              class="w-[18px] h-[18px]"
              :class="isActive(item) ? ACCENT_TEXT[accentOf(item) as NavAccent] : ''"
            />
          </div>
          <span
            class="flex-1 min-w-0 truncate text-callout"
            :class="isActive(item)
              ? `font-bold ${ACCENT_TEXT[accentOf(item) as NavAccent]}`
              : 'font-semibold text-gray-900 dark:text-white'"
          >
            {{ item.label }}
          </span>
          <v-icon
            name="hi-solid-chevron-right"
            class="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0"
          />
        </button>
      </nav>
    </BottomSheet>
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
