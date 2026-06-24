<template>
  <div class="py-12 px-6 text-center">
    <v-icon :name="props.icon" class="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
    <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ props.title }}</h3>
    <p v-if="props.description" class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">{{ props.description }}</p>

    <slot name="extra"></slot>

    <div v-if="props.buttonText" class="mt-4">
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
