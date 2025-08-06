<script lang="ts" setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/store'
import MenuGlobal from '@/components/MenuGlobal.vue'
import { ToastContainer } from '@/components/ui'

const themeStore = useThemeStore()

onMounted(() => {
  // Initialize theme on app mount
  themeStore.initTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Global Menu -->
    <MenuGlobal />

    <main class="flex-1">
      <router-view />
    </main>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

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
html, body, #app {
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
