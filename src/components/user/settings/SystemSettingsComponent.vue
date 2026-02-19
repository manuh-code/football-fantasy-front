<template>
  <div class="space-y-6">
    <!-- Theme Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Appearance</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize how the app looks on your device</p>
      </div>

      <div class="p-5">
        <!-- Theme Toggle -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="themeStore.currentTheme === 'dark' ? 'bg-indigo-900/30' : 'bg-amber-50'">
              <v-icon 
                :name="themeStore.currentTheme === 'dark' ? 'hi-solid-moon' : 'hi-solid-sun'" 
                class="w-5 h-5"
                :class="themeStore.currentTheme === 'dark' ? 'text-indigo-400' : 'text-amber-500'"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ themeStore.currentTheme === 'dark' ? 'Dark mode is active' : 'Light mode is active' }}
              </p>
            </div>
          </div>

          <button
            @click="themeStore.toggleTheme()"
            :class="[
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              themeStore.currentTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            ]"
            :aria-label="`Switch to ${themeStore.currentTheme === 'dark' ? 'light' : 'dark'} mode`"
          >
            <span
              :class="[
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
                themeStore.currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- More settings placeholder -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
      <v-icon name="hi-solid-sparkles" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p class="text-sm font-medium text-gray-400 dark:text-gray-500">More settings coming soon</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
</script>
