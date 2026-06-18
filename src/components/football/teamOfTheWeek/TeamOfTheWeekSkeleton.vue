<script setup lang="ts">
// Layout-accurate loading skeleton mirroring the TOTW pitch in TeamOfTheWeek.
// Rows follow a default 4-3-3 shown forwards-first (GK at the bottom).
const lines = [3, 3, 4, 1];
</script>

<template>
  <div class="animate-pulse">
    <!-- Header (star + "Team of the Week" + formation) -->
    <div class="flex items-center justify-between mb-2 px-1">
      <div class="flex items-center gap-1.5">
        <div class="w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div class="h-3 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>

    <!-- Field -->
    <div
      class="relative rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-500/70 to-emerald-700/70 dark:from-emerald-800/60 dark:to-emerald-950/60 min-h-[520px] sm:min-h-[560px]"
    >
      <!-- Markings -->
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="absolute inset-2 sm:inset-3 border border-white/15 rounded-lg" />
        <div class="absolute left-2 right-2 sm:left-3 sm:right-3 top-1/2 h-px bg-white/15" />
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/15" />
        <div class="absolute left-1/2 -translate-x-1/2 top-2 sm:top-3 w-36 h-14 border border-white/15 border-t-0 rounded-b-lg" />
        <div class="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-3 w-36 h-14 border border-white/15 border-b-0 rounded-t-lg" />
      </div>

      <!-- Player placeholders -->
      <div class="relative flex flex-col h-full min-h-[520px] sm:min-h-[560px] py-3">
        <div
          v-for="(count, li) in lines"
          :key="`line-${li}`"
          class="flex-1 flex items-center justify-evenly px-2"
        >
          <div
            v-for="n in count"
            :key="`p-${li}-${n}`"
            class="flex flex-col items-center gap-1 w-[18%] max-w-[72px]"
          >
            <div class="w-9 h-9 rounded-full bg-white/40 ring-2 ring-white/30 shadow" />
            <div class="h-2 w-10 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
