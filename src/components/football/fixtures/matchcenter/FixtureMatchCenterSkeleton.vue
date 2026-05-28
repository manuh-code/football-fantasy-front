<script setup lang="ts"></script>

<template>
  <div class="px-4 py-5 space-y-6">
    <!-- Scoreboard skeleton -->
    <div class="flex flex-col items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
      <div class="h-3 w-32 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full">
        <div class="flex flex-col items-center gap-2">
          <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-3 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div class="flex items-center gap-2">
          <div class="h-10 w-8 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-6 w-2 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-10 w-8 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-3 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
      <div class="h-4 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- Events skeleton -->
    <div class="space-y-3">
      <div class="h-3 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div v-for="i in 4" :key="`ev-${i}`" class="flex items-center gap-3">
        <div class="h-5 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div class="h-4 w-4 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-3/5 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-2 w-2/5 rounded bg-gray-50 dark:bg-gray-800/60 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Stats skeleton -->
    <div class="space-y-3 pt-2">
      <div class="h-3 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div v-for="i in 5" :key="`st-${i}`" class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="h-3 w-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div class="h-3 w-6 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
        <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  </div>
</template>
