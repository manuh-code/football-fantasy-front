<script setup lang="ts">
// Secondary section tabs (pool / survivor): a compact glass pill pinned right
// under the fixed app header. Complements BottomNavBar — the bottom nav keeps
// the four global destinations while these tabs carry each section's own
// options. Items reuse the BottomNavItem shape (key/label/icon/accent).
import type { BottomNavAccent, BottomNavItem } from "@/components/ui/BottomNavBar.vue";

const props = withDefaults(
  defineProps<{
    items: BottomNavItem[];
    /** Key of the active tab (highlighted with its accent). */
    activeKey?: string;
    ariaLabel?: string;
  }>(),
  {
    activeKey: "",
    ariaLabel: "Section tabs",
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
const ACCENT_BG: Record<BottomNavAccent, string> = {
  blue: "bg-blue-500/10 dark:bg-blue-400/10",
  emerald: "bg-emerald-500/10 dark:bg-emerald-400/10",
  orange: "bg-orange-500/10 dark:bg-orange-400/10",
  red: "bg-red-500/10 dark:bg-red-400/10",
  purple: "bg-purple-500/10 dark:bg-purple-400/10",
  sky: "bg-sky-500/10 dark:bg-sky-400/10",
  amber: "bg-amber-500/10 dark:bg-amber-400/10",
};

const isActive = (item: BottomNavItem): boolean =>
  !item.disabled && !!item.accent && props.activeKey === item.key;

const tabClasses = (item: BottomNavItem): string => {
  if (item.disabled) return "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50";
  if (isActive(item)) {
    const accent = item.accent as BottomNavAccent;
    return `${ACCENT_TEXT[accent]} ${ACCENT_BG[accent]}`;
  }
  return "text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-200";
};

const onClick = (item: BottomNavItem): void => {
  if (item.disabled) return;
  emit("select", item.key);
};
</script>

<template>
  <!-- The <nav> spans the row but is click-through; only the pill is
       interactive, so content behind its edges stays reachable. -->
  <nav
    :aria-label="ariaLabel"
    class="tabs-sticky sticky z-40 pointer-events-none flex justify-center mb-4"
  >
    <div
      class="tabs-scroll pointer-events-auto flex items-center gap-1 p-1 rounded-full max-w-full overflow-x-auto bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
    >
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        :aria-label="item.label"
        :aria-current="isActive(item) ? 'page' : undefined"
        :disabled="item.disabled"
        @click="onClick(item)"
        class="flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        :class="tabClasses(item)"
      >
        <v-icon :name="item.icon" class="w-4 h-4 shrink-0" />
        <span>{{ item.label }}</span>
      </button>
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

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
  }
}
</style>
