<template>
  <!-- Fantasy League Navigation -->
  <nav 
    aria-label="Fantasy League navigation" 
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm md:rounded-xl transition-colors duration-200 md:static fixed bottom-0 left-0 right-0 z-50 md:border-t-0 border-t"
  >
    <div class="flex items-center justify-around px-2 py-2 safe-area-bottom md:py-3">
      <!-- League Overview -->
      <button
        @click="handleTabChange('overview')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          activeTab === 'overview' 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="League Overview"
      >
        <v-icon name="hi-solid-information-circle" class="w-6 h-6" />
        <span class="text-xs font-medium">Overview</span>
      </button>

      <!-- Player Statistics -->
      <button
        @click="handleTabChange('statistics')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          activeTab === 'statistics' 
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Player Statistics"
      >
        <v-icon name="hi-solid-chart-bar" class="w-6 h-6" />
        <span class="text-xs font-medium">Statistics</span>
      </button>

      <!-- Management -->
      <button
        @click="handleTabChange('management')"
        :class="[
          'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
          activeTab === 'management' 
            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
            : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        aria-label="Management"
      >
        <v-icon name="hi-solid-cog" class="w-6 h-6" />
        <span class="text-xs font-medium">Management</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
}>()

// Handle tab change
function handleTabChange(tab: string) {
  emit('update:activeTab', tab)
}
</script>

<style scoped>
/* Safe area padding for devices with notch (iPhone X+, etc.) */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
