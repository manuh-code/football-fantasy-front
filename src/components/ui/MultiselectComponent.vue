<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <!-- Multiselect Container -->
    <div class="relative">
      <Multiselect
        :id="id"
        :model-value="modelValue"
        :options="options"
        :multiple="multiple"
        :close-on-select="closeOnSelect"
        :preserve-search="preserveSearch"
        :placeholder="placeholder"
        :label="labelKey"
        :track-by="valueKey"
        :disabled="disabled"
        :loading="loading"
        :class="multiselectClasses"
        @update:model-value="handleUpdate"
        @change="handleChange"
        @open="$emit('open')"
        @close="$emit('close')"
        @search-change="$emit('search-change', $event)"
      >
        <!-- No Result Template -->
        <template #noResult>
          <slot name="noResult">
            {{ noResultText }}
          </slot>
        </template>
        
        <!-- No Options Template -->
        <template #noOptions>
          <slot name="noOptions">
            {{ noOptionsText }}
          </slot>
        </template>
        
        <!-- Option Template -->
        <template #option="{ option }">
          <slot name="option" :option="option">
            {{ option[labelKey] }}
          </slot>
        </template>
        
        <!-- Tag Template -->
        <template #tag="{ option, remove }">
          <slot name="tag" :option="option" :remove="remove">
            <span class="multiselect__tag">
              <span>{{ option[labelKey] }}</span>
              <i class="multiselect__tag-icon" @click="remove(option)"></i>
            </span>
          </slot>
        </template>
      </Multiselect>
      
      <!-- Loading indicator (when not using internal loading) -->
      <div v-if="loading && !internalLoading" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
    
    <!-- Error message -->
    <p v-if="error" :id="`${id}-error`" class="text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>
    
    <!-- Help text -->
    <p v-if="helpText && !error" class="text-sm text-gray-500 dark:text-gray-400">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults, defineProps, defineEmits } from 'vue'
import Multiselect from 'vue-multiselect'

interface Option extends Record<string, unknown> {
  [key: string]: unknown
}

interface Props {
  modelValue: Option | Option[] | null
  options: Option[]
  valueKey?: string
  labelKey?: string
  placeholder?: string
  label?: string
  id?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  error?: string
  helpText?: string
  multiple?: boolean
  closeOnSelect?: boolean
  preserveSearch?: boolean
  noResultText?: string
  noOptionsText?: string
  internalLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  valueKey: 'id',
  labelKey: 'name',
  placeholder: 'Select options',
  id: () => `multiselect-${Math.random().toString(36).substr(2, 9)}`,
  required: false,
  disabled: false,
  loading: false,
  multiple: true,
  closeOnSelect: false,
  preserveSearch: true,
  noResultText: 'No results found.',
  noOptionsText: 'No options available.',
  internalLoading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Option | Option[] | null]
  'change': [value: Option | Option[] | null]
  'open': []
  'close': []
  'search-change': [query: string]
}>()

// Computed classes for the multiselect wrapper
const multiselectClasses = computed(() => [
  'multiselect-custom',
  ...(props.error ? ['multiselect-custom--error'] : []),
  ...(props.disabled ? ['multiselect-custom--disabled'] : [])
].join(' '))

// Methods
const handleUpdate = (value: Option | Option[] | null) => {
  emit('update:modelValue', value)
}

const handleChange = (value: Option | Option[] | null) => {
  emit('change', value)
}
</script>

<style scoped>
/* Vue Multiselect Styles - Matching SelectComponent */
:deep(.multiselect-custom) {
  min-height: 42px;
}

:deep(.multiselect-custom .multiselect__tags) {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 0.375rem; /* rounded-md like SelectComponent */
  min-height: 42px;
  padding: 0.5rem 0.75rem; /* py-2 px-3 like SelectComponent */
  box-shadow: var(--shadow-sm);
  font-size: 0.875rem; /* text-sm */
  transition: var(--transition-colors);
}

:deep(.multiselect-custom:focus-within .multiselect__tags) {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.1);
}

/* Error state */
:deep(.multiselect-custom--error .multiselect__tags) {
  border-color: var(--color-danger) !important;
}

:deep(.multiselect-custom--error:focus-within .multiselect__tags) {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
}

/* Disabled state */
:deep(.multiselect-custom--disabled .multiselect__tags) {
  background: var(--color-bg-secondary) !important;
  color: var(--color-text-muted) !important;
  cursor: not-allowed;
}

/* Placeholder styling */
:deep(.multiselect-custom .multiselect__placeholder) {
  color: var(--color-text-muted);
  padding-top: 0;
  margin-bottom: 0;
  line-height: 1.5;
}

/* Single selected value */
:deep(.multiselect-custom .multiselect__single) {
  color: var(--color-text);
  padding-top: 0;
  margin-bottom: 0;
  line-height: 1.5;
  font-size: 0.875rem; /* text-sm */
}

/* Input field */
:deep(.multiselect-custom .multiselect__input) {
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem; /* text-sm */
  line-height: 1.5;
  padding: 0;
  margin: 0;
}

/* Dropdown content */
:deep(.multiselect-custom .multiselect__content-wrapper) {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  border-radius: 0.375rem; /* rounded-md */
  box-shadow: var(--shadow-lg);
  margin-top: 0.25rem; /* mt-1 */
  z-index: 50;
}

/* Dropdown options */
:deep(.multiselect-custom .multiselect__option) {
  color: var(--color-text);
  padding: 0.5rem 0.75rem; /* py-2 px-3 */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

/* Highlighted option (hover) */
:deep(.multiselect-custom .multiselect__option--highlight) {
  background: var(--color-primary) !important;
  color: white !important;
}

/* Selected option */
:deep(.multiselect-custom .multiselect__option--selected) {
  background: var(--color-primary-light) !important;
  color: var(--color-primary-dark) !important;
  font-weight: 500;
}

/* Selected option when highlighted */
:deep(.multiselect-custom .multiselect__option--selected.multiselect__option--highlight) {
  background: var(--color-primary-hover) !important;
  color: white !important;
}

/* Tags (selected items in multiple mode) */
:deep(.multiselect-custom .multiselect__tag) {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  border-radius: 0.375rem; /* rounded-md */
  padding: 0.25rem 0.5rem; /* py-1 px-2 */
  margin: 0.125rem 0.25rem 0.125rem 0; /* m-0.5 mr-1 */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  line-height: 1.25;
  border: 1px solid var(--color-primary);
}

/* Tag close icon */
:deep(.multiselect-custom .multiselect__tag-icon) {
  cursor: pointer;
  margin-left: 0.25rem; /* ml-1 */
  border-radius: 0.25rem; /* rounded */
  padding: 0.125rem; /* p-0.5 */
  transition: background-color 0.15s ease-in-out;
  position: relative;
  width: 1rem; /* w-4 */
  height: 1rem; /* h-4 */
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.multiselect-custom .multiselect__tag-icon:hover) {
  background: var(--color-bg-hover);
}

:deep(.multiselect-custom .multiselect__tag-icon:after) {
  content: "×";
  color: inherit;
  font-size: 0.875rem; /* text-sm para mejor visibilidad */
  font-weight: 600; /* font-semibold para mejor contraste */
  line-height: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Arrow/Select icon */
:deep(.multiselect-custom .multiselect__select) {
  width: 2.5rem; /* w-10 */
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  padding: 0.25rem; /* p-1 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

:deep(.multiselect-custom .multiselect__select:before) {
  border-style: solid;
  border-width: 4px 4px 0 4px; /* Reducido para mejor proporción */
  border-color: var(--color-text-muted) transparent transparent transparent;
  content: "";
  position: relative;
  top: 1px; /* Pequeño ajuste vertical */
}

/* Spinner for loading states */
:deep(.multiselect-custom .multiselect__spinner) {
  position: absolute;
  right: 0.5rem; /* right-2 */
  top: 50%;
  transform: translateY(-50%);
  width: 1rem; /* w-4 */
  height: 1rem; /* h-4 */
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Remove default outline on focus */
:deep(.multiselect-custom *) {
  outline: none !important;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Accessibility: Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  :deep(.multiselect-custom .multiselect__spinner),
  .animate-spin {
    animation: none !important;
  }
}
</style>
