<script setup lang="ts" generic="T extends string = string">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
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
  }>(),
  { ariaLabel: "Sections" },
);

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
      class="tab-track flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-x-auto"
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
        class="shrink-0 flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-semibold tracking-wide whitespace-nowrap transition-all duration-200"
        :class="
          active === tab.key
            ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        "
      >
        <v-icon :name="tab.icon" class="w-3.5 h-3.5 shrink-0" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Left overflow hint -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 pr-4 rounded-l-full bg-gradient-to-r from-gray-100 dark:from-gray-800 to-transparent transition-opacity duration-200"
      :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
    >
      <v-icon name="hi-solid-chevron-left" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
    </div>

    <!-- Right overflow hint -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-end pr-1 pl-4 rounded-r-full bg-gradient-to-l from-gray-100 dark:from-gray-800 to-transparent transition-opacity duration-200"
      :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
    >
      <v-icon name="hi-solid-chevron-right" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
    </div>
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
