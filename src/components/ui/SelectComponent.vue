<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <!-- Select Container -->
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        :class="selectClasses"
        :aria-describedby="error ? `${id}-error` : undefined"
      >
        <option disabled value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="String(option[valueKey])"
          :value="option[valueKey]"
        >
          {{ option[labelKey] }}
        </option>
      </select>
      
      <!-- Chevron Icon -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" :id="`${id}-error`" class="text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, defineProps, defineEmits } from 'vue'

interface Option {
  [key: string]: string | number | boolean | null | undefined
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  valueKey?: string
  labelKey?: string
  placeholder?: string
  label?: string
  id?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'id',
  labelKey: 'name',
  placeholder: 'Select an option',
  id: () => `select-${Math.random().toString(36).substr(2, 9)}`,
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'change': [value: string | number | null]
}>()

// Computed classes for the select element
const selectClasses = computed(() => [
  // Base styles
  'w-full appearance-none px-3 py-2 pr-10',
  'border border-gray-300 dark:border-gray-600 rounded-md shadow-sm',
  'bg-white dark:bg-gray-700',
  'text-gray-900 dark:text-white',
  'placeholder-gray-400 dark:placeholder-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
  'text-sm',
  
  // State-dependent styles
  ...(props.error ? [
    'border-red-300 dark:border-red-600',
    'focus:ring-red-500 focus:border-red-500'
  ] : []),
  
  // Disabled styles
  ...(props.disabled ? [
    'bg-gray-100 dark:bg-gray-800',
    'text-gray-500 dark:text-gray-400',
    'cursor-not-allowed'
  ] : [
    'cursor-pointer'
  ])
].join(' '))

// Methods
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
/* Custom styles for the select component */
select {
  background-image: none; /* Remove default arrow in some browsers */
}

/* Hide default arrow in IE */
select::-ms-expand {
  display: none;
}
</style>
