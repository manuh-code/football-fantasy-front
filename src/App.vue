<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Swipe Navigation Indicator -->
    <transition name="swipe-indicator">
      <div
        v-if="swipeNav.isActive.value"
        class="swipe-indicator"
        :style="{
          opacity: swipeNav.getOpacity(),
        }"
      >
        <div class="swipe-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </transition>

    <!-- Main Content with Swipe Transform -->
    <div
      class="app-content"
      :style="{
        transform: swipeNav.isActive.value ? `translateX(${swipeNav.getTransform()}px)` : 'translateX(0)',
        transition: swipeNav.isActive.value ? 'none' : 'transform 0.3s ease-out',
      }"
    >
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import MenuGlobal from '@/components/MenuGlobal.vue'
import { ToastContainer } from '@/components/ui'
import FootballLeagueSelectionModal from '@/components/football/leagues/FootballLeagueSelectionModal.vue'
import { useThemeStore } from './store/theme'
import { useFootballLeagueStore } from '@/store/football/league/useFootballLeagueStore'
import { useSwipeNavigation } from '@/composables'
import FootballFixtureService from "@/services/football/fixture/FootballFixtureService";




const themeStore = useThemeStore();
const store = useFootballLeagueStore()
const router = useRouter()
const showLeagueModal = ref(false)

// Initialize swipe navigation
const swipeNav = useSwipeNavigation()

// Función para verificar y mostrar modal si no hay liga seleccionada
const checkLeagueSelection = () => {
  if (!store.existLeague()) {
    showLeagueModal.value = true
  }
}

onMounted(() => {
  FootballFixtureService.getCurrentFixtures(); // Fetch current fixtures on app mount
  // Initialize theme on app mount
  themeStore.initTheme()
  // Show league selection modal when no league is selected
  checkLeagueSelection()
})

// Watcher para cuando se selecciona una liga
watch(
  () => store.getLeague,
  (newLeague) => {
    if (newLeague) showLeagueModal.value = false
  }
)

// Watcher para cambios de ruta - verificar liga seleccionada
watch(
  () => router.currentRoute.value.path,
  () => {
    // Verificar si hay liga seleccionada cada vez que cambie de ruta
    checkLeagueSelection()
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
  position: relative;
  overflow-x: hidden;
}

// Ensure the app takes full height
html,
body,
#app {
  height: 100%;
}

// App content wrapper
.app-content {
  min-height: 100vh;
  will-change: transform;
}

// Swipe navigation indicator
.swipe-indicator {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 9999;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent);
  
  .swipe-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.9);
    border-radius: 50%;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
}

// Swipe indicator transitions
.swipe-indicator-enter-active,
.swipe-indicator-leave-active {
  transition: opacity 0.2s ease;
}

.swipe-indicator-enter-from,
.swipe-indicator-leave-to {
  opacity: 0;
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
