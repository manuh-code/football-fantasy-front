<script setup lang="ts"></script>

<template>
  <div class="px-4 py-4">
    <!-- Tab menu placeholder -->
    <div class="flex items-center gap-1 p-0.5 rounded-full bg-gray-100 dark:bg-gray-800 mb-5">
      <div
        v-for="i in 5"
        :key="`tab-${i}`"
        class="h-8 flex-1 rounded-full bg-gray-200/70 dark:bg-gray-700/60 animate-pulse"
      />
    </div>

    <!-- Identity block -->
    <div class="flex flex-col items-center gap-2 pt-1 pb-5">
      <div class="w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div class="h-4 w-32 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div class="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>

    <!-- Quick-fact cards -->
    <div class="grid grid-cols-2 gap-2.5 mb-5">
      <div
        v-for="i in 4"
        :key="`card-${i}`"
        class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2"
      >
        <div class="h-2 w-12 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="h-3.5 w-20 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>

    <!-- List rows -->
    <div class="h-2.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse mb-2.5 ml-1" />
    <div class="space-y-1.5">
      <div
        v-for="i in 6"
        :key="`row-${i}`"
        class="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5"
      >
        <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3 w-2/5 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-2 w-1/4 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div class="h-5 w-9 rounded-md bg-gray-100 dark:bg-gray-700 animate-pulse shrink-0" />
      </div>
    </div>
  </div>
</template>
