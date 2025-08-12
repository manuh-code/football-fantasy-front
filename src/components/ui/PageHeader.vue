<template>
  <div class="mb-6 md:mb-8">
    <nav class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      <router-link 
        :to="breadcrumbTo" 
        class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        {{ breadcrumbText }}
      </router-link>
      <span class="mx-2">/</span>
      <span class="text-gray-900 dark:text-white font-medium">{{ currentPageText }}</span>
    </nav>
    
    <button
      @click="handleGoBack"
      class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 mb-4"
    >
      <v-icon name="hi-solid-arrow-left" class="w-5 h-5" />
      <span class="text-sm font-medium">{{ backText }}</span>
    </button>

    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h1>
    <p class="text-gray-600 dark:text-gray-400 text-base md:text-lg">
      {{ description }}
    </p>
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
