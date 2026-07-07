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
    ? "tab-track flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-x-auto"
    : "tab-track flex items-stretch gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700/60",
);

// Per-button layout (independent of active state).
const btnBaseClass = computed(() =>
  isPills.value
    ? "shrink-0 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200"
    : "tab-btn relative shrink-0 flex items-center justify-center gap-1.5 px-3 pt-2 pb-2.5 text-[12px] font-semibold whitespace-nowrap transition-colors duration-200",
);

// Active / inactive styling per variant.
const btnStateClass = (activeTab: boolean): string => {
  if (isPills.value) {
    return activeTab
      ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
  }
  return activeTab
    ? "text-gray-900 dark:text-white shadow-[inset_0_-2px_0_0_#059669] dark:shadow-[inset_0_-2px_0_0_#34d399]"
    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
};

const active = defineModel<T>({ required: true });

const track = ref<HTMLElement | null>(null);
const btnRefs = ref<Record<string, HTMLElement>>({});

const setBtnRef = (key: T) => (el: Element | ComponentPublicInstance | null) => {
  if (el) btnRefs.value[key] = el as HTMLElement;
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

// Keep the active tab visible when it changes, then refresh the hints.
watch(
  active,
  async (key) => {
    await nextTick();
    const el = btnRefs.value[key];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setTimeout(updateHints, 250);
  },
  { immediate: true },
);

onMounted(async () => {
  await nextTick();
  updateHints();
  window.addEventListener("resize", updateHints);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateHints);
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
        <v-icon :name="tab.icon" class="w-3.5 h-3.5 shrink-0" />
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
</style>
