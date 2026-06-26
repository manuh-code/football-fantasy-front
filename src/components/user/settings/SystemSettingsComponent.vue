<template>
  <div class="space-y-6">
    <!-- Theme Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.appearance.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.appearance.subtitle') }}</p>
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
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.appearance.darkMode') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ themeStore.currentTheme === 'dark' ? $t('user.settings.appearance.darkActive') : $t('user.settings.appearance.lightActive') }}
              </p>
            </div>
          </div>

          <button
            @click="themeStore.toggleTheme()"
            :class="[
              'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              themeStore.currentTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            ]"
            :aria-label="themeStore.currentTheme === 'dark' ? $t('user.settings.appearance.switchToLight') : $t('user.settings.appearance.switchToDark')"
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

    <!-- Language Setting -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('user.settings.language.title') }}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('user.settings.language.subtitle') }}</p>
      </div>

      <div class="p-5">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
              <v-icon name="hi-solid-globe-alt" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ $t('user.settings.language.label') }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ localeStore.locale === 'es' ? $t('user.settings.language.es') : $t('user.settings.language.en') }}
              </p>
            </div>
          </div>

          <!-- Segmented language toggle -->
          <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 flex-shrink-0">
            <button
              v-for="lang in (['es', 'en'] as const)"
              :key="lang"
              @click="localeStore.setLocale(lang)"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150',
                localeStore.locale === lang
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              ]"
              :aria-pressed="localeStore.locale === lang"
            >
              {{ lang.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/store/theme'
import { useLocaleStore } from '@/store/locale'

const themeStore = useThemeStore()
const localeStore = useLocaleStore()
</script>
