<script setup lang="ts">
// Segmented tab menu for the Home league sections. Presentational only — the
// parent owns the active tab (v-model) and the slide-direction logic.
interface Tab {
  key: string;
  label: string;
  icon: string;
}

defineProps<{
  tabs: Tab[];
}>();

const active = defineModel<string>({ required: true });
</script>

<template>
  <div
    class="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 shadow-inner"
    role="tablist"
    aria-label="League sections"
  >
    <!-- Expanding-pill tabs: the active tab grows to show its label while the
         rest stay compact (icon only), so the bar fits any number of tabs on a
         narrow mobile width without overflowing. -->
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="active === tab.key"
      :aria-label="tab.label"
      :title="tab.label"
      @click="active = tab.key"
      class="flex items-center justify-center gap-1.5 h-9 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-300 overflow-hidden"
      :class="active === tab.key
        ? 'flex-1 px-3 bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
        : 'flex-none px-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
    >
      <v-icon :name="tab.icon" class="w-3.5 h-3.5 shrink-0" />
      <span v-if="active === tab.key" class="truncate">{{ tab.label }}</span>
    </button>
  </div>
</template>
