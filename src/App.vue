<script lang="ts" setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/store'

const themeStore = useThemeStore()

onMounted(() => {
  // Initialize theme on app mount
  themeStore.initTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Theme Toggle Button (temporary for testing) -->
    <div class="fixed top-4 right-4 z-50">
      <button
        @click="themeStore.toggleTheme"
        class="btn btn-ghost p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md"
        aria-label="Toggle theme"
      >
        <VIcon
          :name="themeStore.currentTheme === 'dark' ? 'hi-solid-sun' : 'hi-solid-moon'"
          class="w-5 h-5 text-gray-600 dark:text-gray-300"
        />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Football Fantasy
              </h1>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <router-link
                  to="/"
                  class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                >
                  <VIcon name="hi-solid-home" class="w-4 h-4 inline mr-2" />
                  Home
                </router-link>
                <router-link
                  to="/about"
                  class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                >
                  <VIcon name="hi-solid-information-circle" class="w-4 h-4 inline mr-2" />
                  About
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              type="button"
              class="bg-white dark:bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <VIcon name="hi-solid-menu" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>
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
