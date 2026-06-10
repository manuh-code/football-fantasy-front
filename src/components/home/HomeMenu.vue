<template>
  <!-- Teleport outside transform context so fixed positioning works -->
  <Teleport to="#app">
    <!-- Floating glassmorphism pill nav — single centered primary action (Gaming).
         The <nav> spans the row but is click-through; only the capsule is interactive. -->
    <nav
      v-if="isVisible"
      aria-label="Home navigation"
      class="fixed inset-x-0 bottom-0 z-[100] pointer-events-none"
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem))"
    >
      <div
        class="pointer-events-auto mx-auto w-[70%] min-w-[240px] max-w-md flex items-center justify-center p-1.5 rounded-full bg-white/60 dark:bg-gray-900/55 backdrop-blur-2xl border border-white/50 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
      >
        <!-- Gaming — primary action -->
        <button
          @click="goToGaming"
          type="button"
          aria-label="Gaming"
          class="flex flex-col items-center justify-center gap-0.5 px-10 py-2 rounded-full text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <v-icon name="bi-trophy-fill" class="w-6 h-6" />
          <span class="text-[10px] font-semibold tracking-tight leading-none">Gaming</span>
        </button>
      </div>
    </nav>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'

const router = useRouter()
const footballLeagueStore = useFootballLeagueStore()

const isVisible = computed(() => footballLeagueStore.existLeague())

function goToGaming() {
  router.push({ name: 'gaming' })
}
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
    transform: none !important;
  }
}
</style>
