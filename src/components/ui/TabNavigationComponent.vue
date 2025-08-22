<template>
  <div class="mb-6">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Desktop Navigation (hidden on mobile) -->
      <nav class="hidden md:flex" aria-label="Tab Navigation">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="setActiveTab(tab.key)"
          :disabled="tab.disabled"
          :class="[
            'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
            activeTab === tab.key
              ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-300 border-b-2 border-${tab.color}-500`
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700',
            tab.disabled ? 'cursor-not-allowed opacity-50' : ''
          ]"
        >
          <div class="flex items-center justify-center gap-2">
            <v-icon :name="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
            <span
              v-if="tab.badge"
              class="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
            >
              {{ tab.badge }}
            </span>
          </div>
        </button>
      </nav>

      <!-- Mobile Navigation (visible only on mobile) -->
      <nav class="md:hidden" aria-label="Tab Navigation">
        <!-- Active tabs section -->
        <div :class="getMobileGridClass()">
          <button
            v-for="tab in activeTabs"
            :key="tab.key"
            @click="setActiveTab(tab.key)"
            :class="[
              'px-3 py-4 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
              activeTab === tab.key
                ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-300 border-b-2 border-${tab.color}-500`
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            <div class="flex flex-col items-center gap-1">
              <v-icon :name="tab.icon" class="w-5 h-5" />
              <span class="text-xs leading-tight">{{ tab.label }}</span>
            </div>
          </button>
        </div>

        <!-- Coming Soon tabs section -->
        <div v-if="disabledTabs.length > 0" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div :class="getMobileGridClass(disabledTabs.length)">
            <button
              v-for="tab in disabledTabs"
              :key="tab.key"
              disabled
              class="px-3 py-3 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              <div class="flex flex-col items-center gap-1">
                <div class="relative">
                  <v-icon :name="tab.icon" class="w-4 h-4" />
                </div>
                <span class="text-xs leading-tight">{{ tab.label }}</span>
                <span
                  v-if="tab.badge"
                  class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded"
                >
                  {{ tab.badge }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'

interface Tab {
  key: string
  label: string
  icon?: string
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'yellow' | 'indigo' | 'pink' | 'gray'
  disabled?: boolean
  badge?: string
}

export type { Tab }

interface Props {
  tabs: Tab[]
  activeTab: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

// Computed properties
const activeTabs = computed(() => props.tabs.filter(tab => !tab.disabled))
const disabledTabs = computed(() => props.tabs.filter(tab => tab.disabled))

// Methods
const setActiveTab = (tab: string) => {
  emit('update:activeTab', tab)
}

const getMobileGridClass = (count?: number) => {
  const tabCount = count || activeTabs.value.length
  if (tabCount <= 2) return 'grid grid-cols-2 gap-0'
  if (tabCount <= 3) return 'grid grid-cols-3 gap-0'
  return 'grid grid-cols-2 gap-0' // Fallback to 2 columns for more than 3 tabs
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
