<script setup lang="ts">
// Statistics tab — placeholder until the feature is implemented.
defineProps<{ stageUuid: string; seasonUuid: string }>();
</script>

<template>
  <div
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden"
  >
    <!-- Card header -->
    <div class="px-4 py-3 flex items-center gap-2">
      <v-icon
        name="hi-solid-chart-bar"
        class="w-[18px] h-[18px] text-emerald-500 dark:text-emerald-400 shrink-0"
      />
      <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">Statistics</h2>
    </div>

    <!-- Pending content -->
    <div class="flex flex-col items-center text-center px-6 py-14">
      <div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/40 flex items-center justify-center mb-4">
        <v-icon name="hi-solid-chart-bar" class="w-7 h-7 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 class="text-[15px] font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Coming soon
      </h3>
      <p class="text-[13px] text-gray-400 dark:text-gray-500 max-w-xs">
        League statistics will be available here shortly.
      </p>
    </div>
  </div>
</template>
