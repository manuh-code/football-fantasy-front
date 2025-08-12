<template>
  <div class="relative">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
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
      
      <!-- Custom chevron icon -->
      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <v-icon name="hi-solid-chevron-down" class="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-sm text-red-600 dark:text-red-400">
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
const selectClasses = computed(() => {
  const baseClasses = [
    'w-full',
    'appearance-none',
    'bg-white',
    'dark:bg-gray-800',
    'border',
    'rounded-lg',
    'px-3',
    'py-2',
    'pr-10',
    'text-sm',
    'text-gray-900',
    'dark:text-white',
    'placeholder-gray-500',
    'dark:placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'dark:focus:ring-offset-gray-800',
    'transition-colors',
    'duration-200'
  ]

  if (props.error) {
    baseClasses.push(
      'border-red-300',
      'dark:border-red-600',
      'focus:border-red-500',
      'focus:ring-red-500'
    )
  } else {
    baseClasses.push(
      'border-gray-300',
      'dark:border-gray-600',
      'focus:border-emerald-500',
      'focus:ring-emerald-500'
    )
  }

  if (props.disabled) {
    baseClasses.push(
      'opacity-50',
      'cursor-not-allowed',
      'bg-gray-50',
      'dark:bg-gray-700'
    )
  }

  return baseClasses.join(' ')
})

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
