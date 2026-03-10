<template>
  <!-- Teleport outside transform context so fixed positioning works -->
  <Teleport to="#app">
    <!-- Bottom Tab Bar — iOS / Fotmob style -->
    <nav
      v-if="isVisible"
      aria-label="Home navigation"
      class="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]"
    >
      <div
        class="flex items-center justify-around max-w-lg mx-auto px-2 pt-2 pb-2"
        style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0.5rem))"
      >
        <!-- Gaming -->
        <button
          @click="goToGaming"
          class="group flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1 rounded-2xl transition-all duration-200 active:scale-95 text-blue-500 dark:text-blue-400"
          aria-label="Gaming"
        >
          <div class="relative">
            <div class="absolute -inset-1.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 scale-0 group-active:scale-100 transition-transform duration-200" />
            <v-icon name="bi-trophy-fill" class="w-6 h-6 relative" />
          </div>
          <span class="text-[10px] font-semibold tracking-tight leading-none mt-0.5">Gaming</span>
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
