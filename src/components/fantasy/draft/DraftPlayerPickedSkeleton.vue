<template>
  <!-- Layout-accurate skeleton for the draft board grid. Mirrors the table:
       a sticky header row of participants, then rounds as rows of pick cells. -->
  <div class="w-full">
    <div class="overflow-x-auto scrollbar-hide rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800">
      <table class="w-full border-collapse min-w-max animate-pulse">
        <!-- Header: Participants -->
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="`h-${col}`"
              class="px-1.5 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': col < columns }"
            >
              <div class="flex flex-col items-center gap-1 min-w-[72px] sm:min-w-[80px]">
                <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800" />
                <div class="h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-600" />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body: Rounds as rows, pick cells -->
        <tbody>
          <tr v-for="row in rows" :key="`r-${row}`">
            <td
              v-for="col in columns"
              :key="`c-${row}-${col}`"
              class="px-1 py-1.5 align-top border-b border-gray-50 dark:border-gray-700/30"
              :class="{ 'border-r border-gray-100 dark:border-gray-700/40': col < columns }"
            >
              <div class="flex flex-col items-center gap-0.5 min-w-[72px] sm:min-w-[80px]">
                <!-- Pick label -->
                <div class="h-2.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <!-- Player photo -->
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600/60" />
                <!-- Player name -->
                <div class="h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <!-- Position badge -->
                <div class="h-2 w-6 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    /** Number of participant columns to render. */
    columns?: number;
    /** Number of round rows to render. */
    rows?: number;
  }>(),
  {
    columns: 4,
    rows: 5,
  },
);
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
