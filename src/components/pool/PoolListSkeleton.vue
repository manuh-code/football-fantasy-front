<script setup lang="ts">
// Layout-accurate loading skeleton mirroring the pool list grid in PoolComponent.
withDefaults(defineProps<{ count?: number }>(), { count: 4 });
</script>

<template>
  <div class="space-y-4 animate-pulse">
    <!-- Section Header -->
    <div class="px-1 space-y-1.5">
      <div class="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div class="h-3 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <div
        v-for="n in count"
        :key="`pool-skeleton-${n}`"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
      >
        <div class="p-4">
          <!-- Header: icon + name + badge -->
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="h-4 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div class="h-4 w-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              </div>
              <div class="mt-2 space-y-1.5">
                <div class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                <div class="h-3 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          <!-- Footer: participants + stage name -->
          <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/40">
            <div class="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
