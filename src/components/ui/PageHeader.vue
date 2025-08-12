<template>
  <div class="mb-4 md:mb-6">
    <!-- Compact Navigation Bar -->
    <div class="flex items-center justify-between mb-3">
      <!-- Breadcrumb -->
      <nav class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <router-link 
          :to="breadcrumbTo" 
          class="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
        >
          {{ breadcrumbText }}
        </router-link>
        <v-icon name="hi-solid-chevron-right" class="w-3 h-3 mx-1 text-gray-400" />
        <span class="text-gray-700 dark:text-gray-300 font-medium">{{ currentPageText }}</span>
      </nav>
      
      <!-- Back Button -->
      <button
        @click="handleGoBack"
        class="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200"
      >
        <v-icon name="hi-solid-arrow-left" class="w-3 h-3" />
        <span class="font-medium">{{ backText }}</span>
      </button>
    </div>

    <!-- Compact Title Section -->
    <div>
      <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ title }}</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  title: string
  description: string
  backText?: string
  breadcrumbTo?: string
  breadcrumbText?: string
  currentPageText?: string
}

withDefaults(defineProps<Props>(), {
  backText: 'Back',
  breadcrumbTo: '/dashboard',
  breadcrumbText: 'Dashboard',
  currentPageText: 'Current Page'
})

const router = useRouter()

const handleGoBack = () => {
  router.back()
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
