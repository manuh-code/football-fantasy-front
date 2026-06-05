<script setup lang="ts">
// Layout-accurate loading skeleton for the standings table.
withDefaults(defineProps<{ rows?: number }>(), { rows: 12 });
</script>

<template>
  <div class="px-3 py-1 animate-pulse">
    <div
      v-for="i in rows"
      :key="i"
      class="flex items-center gap-3 py-2.5"
      :class="i < rows ? 'border-b border-gray-50 dark:border-gray-700/30' : ''"
    >
      <!-- Position -->
      <div class="w-4 h-3 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
      <!-- Logo -->
      <div class="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
      <!-- Team name -->
      <div
        class="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
        :class="i % 3 === 0 ? 'w-28' : i % 2 === 0 ? 'w-36' : 'w-24'"
      />
      <div class="flex-1" />
      <!-- Stat columns (hidden on very small screens, like the table) -->
      <div class="hidden sm:flex items-center gap-3 sm:gap-4">
        <div v-for="n in 5" :key="n" class="w-3.5 h-3 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
      <!-- Points -->
      <div class="w-8 h-5 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
    </div>
  </div>
</template>
