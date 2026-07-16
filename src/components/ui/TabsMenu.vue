<script setup lang="ts" generic="T extends string = string">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import type { ComponentPublicInstance } from "vue";

// Standard linear tab menu used across the app.
// Horizontally swipeable pill with a Scroll Hint / Overflow Hint: edge fades +
// chevrons reveal that there's more to scroll when the tabs overflow.
interface Tab {
  key: T;
  label: string;
  icon: string;
}

const props = withDefaults(
  defineProps<{
    tabs: Tab[];
    ariaLabel?: string;
    /**
     * Visual style:
     *  - "underline" (default): active tab underlined with an emerald bar over a
     *    hairline baseline (match center).
     *  - "pills": segmented pill track — a rounded gray rail with a white active
     *    pill (mirrors the team-profile tab menu, used on Home).
     */
    variant?: "underline" | "pills";
  }>(),
  { ariaLabel: "Sections", variant: "underline" },
);

const isPills = computed(() => props.variant === "pills");

// Track (the horizontal rail) — a rounded gray container for pills, a hairline
// baseline for the underline variant.
const trackClass = computed(() =>
  isPills.value
    ? "tab-track relative flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-x-auto"
    : "tab-track relative flex items-stretch gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700/60",
);

// Per-button layout (independent of active state). z-10 keeps the label above
// the sliding indicator that sits behind the row.
const btnBaseClass = computed(() =>
  isPills.value
    ? "relative z-10 shrink-0 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs tracking-wide whitespace-nowrap transition-all duration-200"
    : "tab-btn relative z-10 shrink-0 flex items-center justify-center gap-1.5 px-3 pt-2 pb-2.5 text-[12px] whitespace-nowrap transition-colors duration-200",
);

// Active / inactive styling per variant. Buttons carry only text weight/color —
// the emerald highlight lives in the single sliding indicator behind them (same
// architecture as TopTabsBar), so the current section clearly stands out and the
// change reads as one continuous motion.
const btnStateClass = (activeTab: boolean): string => {
  if (activeTab) {
    return isPills.value
      ? "text-emerald-600 dark:text-emerald-400 font-bold"
      : "text-gray-900 dark:text-white font-bold";
  }
  return "text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-700 dark:hover:text-gray-300";
};

const active = defineModel<T>({ required: true });

const track = ref<HTMLElement | null>(null);
const btnRefs = ref<Record<string, HTMLElement>>({});

const setBtnRef = (key: T) => (el: Element | ComponentPublicInstance | null) => {
  if (el) btnRefs.value[key] = el as HTMLElement;
};

// ── Sliding accent indicator (same design as TopTabsBar) ──
// One shape glides beneath the active tab — an emerald chip for the pill
// variant, a thin bar for the underline variant. It lives inside the scrolling
// track and is positioned in layout coordinates (offsetLeft/Top), so it stays
// glued to its tab while the track scrolls — no scroll math needed.
type PillRect = { left: number; top: number; width: number; height: number };
const indicatorRect = ref<PillRect | null>(null);

const updateIndicator = (): void => {
  const btn = btnRefs.value[active.value as string];
  indicatorRect.value = btn
    ? { left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight }
    : null;
};

// ── Overflow hint state ──
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateHints = () => {
  const el = track.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
};

const select = (key: T) => {
  active.value = key;
};

const onResize = () => {
  updateHints();
  updateIndicator();
};

// Keep the active tab visible when it changes, then refresh hints + indicator.
watch(
  active,
  async (key) => {
    await nextTick();
    const el = btnRefs.value[key];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    updateIndicator();
    setTimeout(updateHints, 250);
  },
  { immediate: true },
);

// Re-measure when the tab set changes (labels/count affect widths).
watch(
  () => props.tabs,
  () => nextTick(updateIndicator),
  { flush: "post" },
);

onMounted(async () => {
  await nextTick();
  updateHints();
  updateIndicator();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<template>
  <div class="relative">
    <div
      ref="track"
      :class="trackClass"
      role="tablist"
      :aria-label="props.ariaLabel"
      @scroll="updateHints"
    >
      <!-- Sliding accent indicator: one moving shape measured from the active
           button's real box, so a tab change reads as continuous motion. -->
      <span
        v-if="indicatorRect && isPills"
        class="tab-indicator absolute top-0 left-0 rounded-full pointer-events-none bg-emerald-500/15 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-400/15 dark:ring-emerald-400/30"
        :style="{
          transform: `translate(${indicatorRect.left}px, ${indicatorRect.top}px)`,
          width: indicatorRect.width + 'px',
          height: indicatorRect.height + 'px',
        }"
      />
      <span
        v-else-if="indicatorRect"
        class="tab-indicator absolute left-0 rounded-full pointer-events-none bg-emerald-500 dark:bg-emerald-400"
        :style="{
          transform: `translate(${indicatorRect.left}px, ${indicatorRect.top + indicatorRect.height - 2}px)`,
          width: indicatorRect.width + 'px',
          height: '2px',
        }"
      />

      <button
        v-for="tab in props.tabs"
        :key="tab.key"
        :ref="setBtnRef(tab.key)"
        type="button"
        role="tab"
        :aria-selected="active === tab.key"
        @click="select(tab.key)"
        :class="[btnBaseClass, btnStateClass(active === tab.key)]"
      >
        <v-icon
          :name="tab.icon"
          class="w-3.5 h-3.5 shrink-0 transition-transform duration-200 ease-out"
          :class="active === tab.key ? 'scale-110' : ''"
        />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Overflow hints: only for the underline variant. The pill track's rounded
         rail (with a partly-visible pill at the edge) already signals scroll. -->
    <template v-if="!isPills">
      <!-- Left overflow hint -->
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-0.5 pr-5 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent transition-opacity duration-200"
        :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
      >
        <v-icon name="hi-solid-chevron-left" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </div>

      <!-- Right overflow hint -->
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end pr-0.5 pl-5 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent transition-opacity duration-200"
        :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
      >
        <v-icon name="hi-solid-chevron-right" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tab-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-padding: 0 0.5rem;
}
.tab-track::-webkit-scrollbar {
  display: none;
}

/* Same settle as TopTabsBar's indicator: a touch of overshoot on the slide,
   non-bouncy size/color so it doesn't stretch oddly between differently sized
   tabs. */
.tab-indicator {
  transition:
    transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1),
    width 240ms cubic-bezier(0.22, 1, 0.36, 1),
    height 240ms cubic-bezier(0.22, 1, 0.36, 1),
    background-color 240ms ease;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .tab-indicator,
  button {
    transition: none !important;
  }
}
</style>
