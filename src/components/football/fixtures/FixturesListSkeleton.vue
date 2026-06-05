<script setup lang="ts">
// Layout-accurate loading skeleton mirroring the fixture rows in FixturesList.
withDefaults(defineProps<{ rows?: number }>(), { rows: 6 });
</script>

<template>
  <div class="divide-y divide-gray-100 dark:divide-gray-700/50 animate-pulse">
    <div v-for="i in rows" :key="i" class="px-4 py-3">
      <!-- Date / time line -->
      <div class="flex justify-center mb-2">
        <div
          class="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800"
          :class="i % 2 === 0 ? 'w-28' : 'w-36'"
        />
      </div>

      <!-- Match row: home · score · away -->
      <div class="flex items-center gap-2">
        <!-- Home -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div
            class="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
            :class="i % 3 === 0 ? 'w-16' : 'w-24'"
          />
        </div>

        <!-- Score chip -->
        <div class="h-6 w-12 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />

        <!-- Away -->
        <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <div
            class="h-3 rounded-full bg-gray-200 dark:bg-gray-700"
            :class="i % 2 === 0 ? 'w-24' : 'w-16'"
          />
          <div class="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>
