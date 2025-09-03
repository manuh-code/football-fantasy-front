<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Global Menu -->
    <MenuGlobal />

    <!-- Global Football League Selection Modal -->
    <FootballLeagueSelectionModal :isVisible="showLeagueModal" @close="showLeagueModal = false" />

    <main class="flex-1 pt-14 sm:pt-16">
      <router-view />
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'

import MenuGlobal from '@/components/MenuGlobal.vue'
import { ToastContainer } from '@/components/ui'
import FootballLeagueSelectionModal from '@/components/football/leagues/FootballLeagueSelectionModal.vue'
import { useThemeStore } from './store/theme'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import FootballFixtureService from "@/services/football/fixture/FootballFixtureService";

const themeStore = useThemeStore();
const store = useFootballLeagueStore()
const showLeagueModal = ref(false)

onMounted(() => {
  FootballFixtureService.getCurrentFixtures(); // Fetch current fixtures on app mount
  // Initialize theme on app mount
  themeStore.initTheme()
  // Show league selection modal when no league is selected
  if (!store.existLeague()) showLeagueModal.value = true
})

watch(
  () => store.getLeague,
  (newLeague) => {
    if (newLeague) showLeagueModal.value = false
  }
)
</script>


<style lang="scss">
// Import Inter font from Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

#app {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'rlig' 1, 'calt' 1;
}

// Ensure the app takes full height
html,
body,
#app {
  height: 100%;
}

// Custom scrollbar for webkit browsers
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-hover);
  border-radius: 4px;

  &:hover {
    background: var(--color-text-muted);
  }
}
</style>
