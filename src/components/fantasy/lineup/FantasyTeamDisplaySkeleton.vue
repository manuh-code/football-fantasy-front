<script setup lang="ts">
// Layout-accurate skeleton for the fantasy team display (starters + bench).
// Reused both inside FantasyTeamDisplay (while loading) and in the parent's
// initial load, so the loading state stays visually consistent end to end.
withDefaults(
  defineProps<{
    /** Number of starter rows to render. */
    starters?: number;
    /** Number of bench rows to render. */
    bench?: number;
  }>(),
  {
    starters: 6,
    bench: 3,
  },
);
</script>

<template>
  <div class="space-y-3">
    <!-- Starters skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-3.5 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <div v-for="i in starters" :key="i" class="flex items-center gap-3 px-4 py-3">
          <div class="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-2.5 w-16 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
          </div>
          <div class="h-4 w-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Bench skeleton -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40">
        <div class="h-3.5 w-14 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div class="divide-y divide-gray-50 dark:divide-gray-700/30">
        <div v-for="i in bench" :key="i" class="flex items-center gap-3 px-4 py-3">
          <div class="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
            <div class="h-2.5 w-16 bg-gray-50 dark:bg-gray-700/60 rounded animate-pulse" />
          </div>
          <div class="h-4 w-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
