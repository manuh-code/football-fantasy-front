<template>
  <div
    class="rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 dark:from-emerald-600 dark:via-green-600 dark:to-teal-600"
  >
    <div class="px-5 py-6 flex flex-col items-center text-center gap-3">
      <!-- Trophy icon -->
      <div
        class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-9 h-9 text-yellow-200"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M5 3h14c.55 0 1 .45 1 1v2c0 2.55-1.16 4.83-3 6.32V18h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1h1v-5.68C5.16 10.83 4 8.55 4 6V4c0-.55.45-1 1-1zm2 2v1c0 1.87.83 3.54 2.14 4.68L12 12.87l2.86-2.19A5.98 5.98 0 0017 6V5H7zm5 10.32L9 11.5V17h6v-5.5l-3 1.82z"
          />
        </svg>
      </div>

      <div>
        <p class="text-lg font-extrabold text-white leading-tight">
          Draft Completed!
        </p>
        <p class="text-sm text-white/70 mt-1">
          All picks have been made. Check your roster!
        </p>
      </div>

      <!-- Confetti dots decoration -->
      <div class="flex gap-1.5 mt-1">
        <span
          class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
          style="animation-delay: 0ms; animation-duration: 1.4s"
        />
        <span
          class="w-2 h-2 rounded-full bg-white/50 animate-bounce"
          style="animation-delay: 200ms; animation-duration: 1.4s"
        />
        <span
          class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
          style="animation-delay: 400ms; animation-duration: 1.4s"
        />
        <span
          class="w-2 h-2 rounded-full bg-white/50 animate-bounce"
          style="animation-delay: 600ms; animation-duration: 1.4s"
        />
        <span
          class="w-2 h-2 rounded-full bg-yellow-300/60 animate-bounce"
          style="animation-delay: 800ms; animation-duration: 1.4s"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
