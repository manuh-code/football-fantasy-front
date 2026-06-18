<script lang="ts">
// Shared floating glassmorphism bottom navigation (FotMob / Apple Sports style).
// Reused across the app for the different bottom menus.
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
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: BottomNavItem[];
    /** Key of the active item (highlighted with its accent). */
    activeKey?: string;
    /** Whether the bar is rendered at all. */
    visible?: boolean;
    /** Stretch items to fill a wide pill (multi-item bars). When false the pill
     *  hugs its content — ideal for a single primary action. */
    fill?: boolean;
    ariaLabel?: string;
  }>(),
  {
    activeKey: "",
    visible: true,
    fill: false,
    ariaLabel: "Navigation",
  },
);

const emit = defineEmits<{ select: [key: string] }>();

// Static map so Tailwind keeps these classes during purge.
const ACCENT_ACTIVE: Record<BottomNavAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/15",
  orange: "text-orange-600 dark:text-orange-400 bg-orange-500/15 dark:bg-orange-400/15",
  red: "text-red-600 dark:text-red-400 bg-red-500/15 dark:bg-red-400/15",
  purple: "text-purple-600 dark:text-purple-400 bg-purple-500/15 dark:bg-purple-400/15",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-500/15 dark:bg-sky-400/15",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-400/15",
};

const isActive = (item: BottomNavItem): boolean =>
  !item.disabled && !!item.accent && props.activeKey === item.key;

const itemClasses = (item: BottomNavItem): string => {
  if (item.disabled) return "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50";
  if (isActive(item)) return ACCENT_ACTIVE[item.accent as BottomNavAccent];
  return "text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300";
};

const onSelect = (item: BottomNavItem): void => {
  if (item.disabled) return;
  emit("select", item.key);
};
</script>

<template>
  <!-- Teleport outside transform context so fixed positioning works -->
  <Teleport to="#app">
    <!-- Floating pill nav: the <nav> spans the row but is click-through; only the
         capsule is interactive. -->
    <nav
      v-if="visible"
      :aria-label="ariaLabel"
      class="fixed inset-x-0 bottom-0 z-[100] pointer-events-none"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
    >
      <div
        class="pointer-events-auto mx-auto flex items-center p-1.5 rounded-full bg-white/60 dark:bg-gray-900/55 backdrop-blur-2xl border border-white/50 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        :class="fill
          ? 'justify-between gap-0.5 w-[calc(100%-1.5rem)] min-w-[240px] max-w-md'
          : 'justify-center w-auto max-w-[calc(100%-1.5rem)]'"
      >
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          :disabled="item.disabled"
          @click="onSelect(item)"
          class="flex flex-col items-center justify-center gap-0.5 py-2 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          :class="[itemClasses(item), fill ? 'flex-1 px-1' : 'px-8']"
        >
          <v-icon
            :name="item.icon"
            class="w-6 h-6 transition-transform duration-200"
            :class="isActive(item) ? 'scale-110' : ''"
          />
          <span class="text-[10px] font-semibold tracking-tight leading-none">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
    transform: none !important;
  }
}
</style>
