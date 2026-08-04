<script setup lang="ts">
// Secondary section tabs (pool / survivor): a compact glass pill pinned right
// under the fixed app header. Complements BottomNavBar — same glass-pill look
// and the same single sliding accent chip marking the active option, so a
// section keeps its identity whether its tabs live down there or up here.
// Items reuse the BottomNavItem shape (key/label/icon/accent).
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { BottomNavAccent, BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const props = withDefaults(
  defineProps<{
    items: BottomNavItem[];
    /** Key of the active tab (highlighted with its accent). */
    activeKey?: string;
    ariaLabel?: string;
    /**
     * `inline` — icono y texto en una línea. Cabe cómodo hasta 3 opciones.
     * `stacked` — icono sobre texto, como BottomNavBar. Cada opción baja de
     * ~105px a ~56px, que es lo que permite mostrar 5 sin scroll horizontal en
     * un móvil de 375px.
     */
    layout?: "inline" | "stacked";
  }>(),
  {
    activeKey: "",
    ariaLabel: "Section tabs",
    layout: "inline",
  },
);

const emit = defineEmits<{ select: [key: string] }>();

// Static maps so Tailwind keeps these classes during purge (same palette as
// BottomNavBar, so a section keeps its accent when its options move up here).
const ACCENT_TEXT: Record<BottomNavAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  purple: "text-purple-600 dark:text-purple-400",
  sky: "text-sky-600 dark:text-sky-400",
  amber: "text-amber-600 dark:text-amber-400",
};

// Active-tab chip: a stronger tint plus a crisp inset ring, matching
// BottomNavBar so the selected tab reads as a raised, clearly-selected key.
const ACCENT_INDICATOR: Record<BottomNavAccent, string> = {
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

const itemLayoutClass = computed(() =>
  props.layout === "stacked"
    ? "flex-col justify-center gap-0.5 px-2.5 py-1.5 min-w-[56px] text-2xs"
    : "gap-1.5 px-3.5 py-2 text-xs",
);
const iconSizeClass = computed(() =>
  props.layout === "stacked" ? "w-[18px] h-[18px]" : "w-4 h-4",
);

// Buttons carry only text weight/color — the highlighted background lives in the
// single sliding indicator behind them (same architecture as BottomNavBar).
const tabClasses = (item: BottomNavItem): string => {
  if (item.disabled) return "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50 font-semibold";
  if (isActive(item)) return `${ACCENT_TEXT[item.accent as BottomNavAccent]} font-bold`;
  return "text-gray-500 dark:text-gray-400 font-semibold active:text-gray-700 dark:active:text-gray-200";
};

const onClick = (item: BottomNavItem): void => {
  if (item.disabled) return;
  emit("select", item.key);
};

// The pill scrolls horizontally on narrow screens; keep the active tab visible
// instead of leaving it clipped past the edge (e.g. the last tab on load).
const scrollContainerRef = ref<HTMLElement | null>(null);
const buttonRefs = new Map<string, HTMLElement>();

const setButtonRef = (key: string, el: Element | null): void => {
  if (el instanceof HTMLElement) buttonRefs.set(key, el);
  else buttonRefs.delete(key);
};

// --- Sliding indicator ---------------------------------------------------
// One accent chip glides beneath the active tab. It lives inside the scrolling
// track and is positioned in layout coordinates (offsetLeft/Top), so it stays
// glued to its tab as the track scrolls — no scroll math needed.
type PillRect = { left: number; top: number; width: number; height: number };
const indicatorRect = ref<PillRect | null>(null);

const activeItem = computed(() => props.items.find((item) => isActive(item)) ?? null);
const indicatorColorClass = computed(() =>
  activeItem.value?.accent ? ACCENT_INDICATOR[activeItem.value.accent] : "",
);

const measure = (key: string | null): PillRect | null => {
  if (!key) return null;
  const btn = buttonRefs.get(key);
  if (!btn) return null;
  return { left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight };
};
const updateIndicator = (): void => {
  indicatorRect.value = measure(activeItem.value?.key ?? null);
};

// Only scroll as far as needed to bring the active tab fully into view, flush
// against whichever edge it was clipped by. Dead-centering it unconditionally
// (the previous approach) scrolled past tab 0 even when it already fit on
// screen — reading as truncated/broken text instead of "more to scroll".
const scrollActiveIntoView = (behavior: ScrollBehavior): void => {
  const container = scrollContainerRef.value;
  const activeButton = buttonRefs.get(props.activeKey);
  if (!container || !activeButton) return;

  const containerWidth = container.clientWidth;
  const visibleLeft = container.scrollLeft;
  const visibleRight = visibleLeft + containerWidth;
  const buttonLeft = activeButton.offsetLeft;
  const buttonRight = buttonLeft + activeButton.offsetWidth;

  let target: number;
  if (buttonLeft < visibleLeft) {
    target = Math.max(0, buttonLeft - 8);
  } else if (buttonRight > visibleRight) {
    target = buttonRight - containerWidth + 8;
  } else {
    return; // Already fully visible — leave the scroll position untouched.
  }

  const maxScrollLeft = container.scrollWidth - containerWidth;
  container.scrollTo({ left: Math.max(0, Math.min(target, maxScrollLeft)), behavior });
};

// Edge fade hint: shows a soft gradient over whichever side still has tabs
// scrolled out of view, so an overflowing bar reads as "swipe for more"
// instead of looking clipped/broken.
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const updateEdges = (): void => {
  const container = scrollContainerRef.value;
  if (!container) return;
  canScrollLeft.value = container.scrollLeft > 2;
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 2;
};

const onResize = (): void => {
  updateIndicator();
  updateEdges();
};

// Jump instantly on first render, then animate on subsequent tab changes.
onMounted(() => {
  nextTick(() => {
    scrollActiveIntoView("auto");
    updateIndicator();
    updateEdges();
  });
  window.addEventListener("resize", onResize);
});
onUnmounted(() => window.removeEventListener("resize", onResize));

watch(
  () => [props.activeKey, props.items] as const,
  () =>
    nextTick(() => {
      scrollActiveIntoView("smooth");
      updateIndicator();
      updateEdges();
    }),
  { flush: "post" },
);
</script>

<template>
  <!-- The <nav> spans the row but is click-through; only the pill is
       interactive, so content behind its edges stays reachable. -->
  <nav
    :aria-label="ariaLabel"
    class="tabs-sticky sticky z-40 pointer-events-none flex justify-center mb-4"
  >
    <!-- Fila: la píldora y, opcionalmente, una acción fija a su derecha. La
         acción va FUERA del carril que hace scroll para que no se pueda
         desplazar fuera de pantalla (es el caso del botón "Más"). -->
    <div class="flex items-center gap-1.5 max-w-full">
    <!-- Wrapper matches the pill's own box (not the scrolling content inside it)
         so the edge-fade overlays below stay pinned to its visual edges instead
         of scrolling away with the tabs. -->
    <div class="relative min-w-0 max-w-full">
      <div
        ref="scrollContainerRef"
        class="tabs-scroll relative pointer-events-auto flex items-center gap-1 p-1 rounded-full max-w-full overflow-x-auto overscroll-x-contain bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
        @scroll="updateEdges"
      >
        <!-- Active indicator: the one moving shape, measured from its real button
             box so it always matches exactly. Sits behind the buttons (z-10). -->
        <span
          v-if="indicatorRect"
          class="tab-indicator absolute top-0 left-0 rounded-full pointer-events-none"
          :class="indicatorColorClass"
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
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          :disabled="item.disabled"
          @click="onClick(item)"
          class="relative z-10 flex items-center shrink-0 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          :class="[itemLayoutClass, tabClasses(item)]"
        >
          <v-icon
            :name="item.icon"
            class="shrink-0 transition-transform duration-200 ease-out"
            :class="[iconSizeClass, isActive(item) ? 'scale-110' : '']"
          />
          <span class="leading-none tracking-tight">{{ item.label }}</span>
        </button>
      </div>

      <!-- Edge fades hinting there are more tabs to scroll to. -->
      <div
        class="tab-edge-fade left-0 rounded-l-full bg-gradient-to-r from-white/95 dark:from-gray-900/90"
        :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
      />
      <div
        class="tab-edge-fade right-0 rounded-r-full bg-gradient-to-l from-white/95 dark:from-gray-900/90"
        :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
      />
      </div>

      <!-- Acción fija junto a la píldora, fuera del carril con scroll (el botón
           "Más" de la liga fantasy). Lo que se monte aquí debe traer su propio
           `pointer-events-auto`: el <nav> es click-through. -->
      <slot name="trailing" />
    </div>
  </nav>
</template>

<style scoped>
/* Pin right below the fixed HeaderMenu — same offsets as .main-content-safe
   (header h-12/h-14 plus the iOS safe area), leaving a small breathing gap. */
.tabs-sticky {
  top: calc(3.5rem + env(safe-area-inset-top, 0px));
}
@media (min-width: 640px) {
  .tabs-sticky {
    top: calc(4rem + env(safe-area-inset-top, 0px));
  }
}

/* Tabs can overflow on narrow phones; scroll without showing a scrollbar. */
.tabs-scroll {
  scrollbar-width: none;
}
.tabs-scroll::-webkit-scrollbar {
  display: none;
}

/* Soft edge fade over the scrollable tab strip (see canScrollLeft/Right).
   z-20 sits above the buttons (z-10) but pointer-events-none so taps pass
   through to whichever tab is partially covered. */
.tab-edge-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.75rem;
  z-index: 20;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* Same settle as BottomNavBar's indicator: a touch of overshoot on the slide,
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
