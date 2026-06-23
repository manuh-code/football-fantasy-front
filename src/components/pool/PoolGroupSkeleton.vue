<script setup lang="ts">
// Layout-accurate loading skeleton mirroring the PoolGroupComponent info layout.
</script>

<template>
  <div class="space-y-4 animate-pulse">
    <!-- Header card -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5">
      <div class="flex items-start gap-3">
        <div class="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="h-5 w-40 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          </div>
          <div class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-2/3 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>

    <!-- Detail rows -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40">
      <div v-for="n in 3" :key="`row-${n}`" class="flex items-center justify-between gap-3 px-4 py-3.5">
        <div class="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>

    <!-- Members -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 space-y-3">
      <div class="h-3 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div v-for="n in 3" :key="`member-${n}`" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div class="h-2.5 w-40 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
</template>
