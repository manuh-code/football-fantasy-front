<template>
  <div class="p-6 text-center">
    <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
      <v-icon :name="props.icon" class="w-10 h-10 text-gray-400 dark:text-gray-300" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ props.title }}</h3>
    <p v-if="props.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ props.description }}</p>

    <slot name="extra"></slot>

    <div v-if="props.buttonText" class="mt-2">
      <ButtonComponent :text="props.buttonText" variant="outline" size="md" @click="handleAction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { ButtonComponent } from '@/components/ui'

const props = defineProps({
  title: { type: String, default: 'No results found' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'hi-solid-search' },
  buttonText: { type: String, default: '' }
})

const emit = defineEmits(['action'])

const handleAction = () => emit('action')
</script>

<style scoped>
/* Keep visuals consistent with other cards */
</style>
