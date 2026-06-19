<script lang="ts">
// Shared floating bottom navigation (FotMob / Apple Sports style).
// Minimal glass pill that hugs its content. Reused across the app.
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
    ariaLabel?: string;
  }>(),
  {
    activeKey: "",
    visible: true,
    ariaLabel: "Navigation",
  },
);

const emit = defineEmits<{ select: [key: string] }>();

// Static map so Tailwind keeps these classes during purge.
const ACCENT_ACTIVE: Record<BottomNavAccent, string> = {
  blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10",
  orange: "text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-400/10",
  red: "text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-400/10",
  purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-400/10",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-400/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10",
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
         capsule is interactive. The pill hugs its content and stays centered. -->
    <nav
      v-if="visible"
      :aria-label="ariaLabel"
      class="fixed inset-x-0 bottom-0 z-[100] pointer-events-none flex justify-center"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
    >
      <div
        class="pointer-events-auto flex items-center gap-0.5 p-1 rounded-full max-w-[calc(100%-1rem)] bg-white/75 dark:bg-gray-900/65 backdrop-blur-xl border border-black/[0.04] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/30"
      >
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          :disabled="item.disabled"
          @click="onSelect(item)"
          class="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          :class="itemClasses(item)"
        >
          <v-icon :name="item.icon" class="w-5 h-5" />
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
