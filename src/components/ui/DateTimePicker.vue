<template>
  <div class="space-y-2">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>

    <!-- DatePicker Input -->
    <div class="relative">
      <input
        :id="id"
        v-model="displayValue"
        type="text"
        readonly
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @click="showPicker = !showPicker"
      />
      
      <!-- Calendar Icon -->
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- DatePicker Popup -->
      <div
        v-if="showPicker && !disabled"
        class="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
      >
        <VCalendar
          v-model="selectedDate"
          :min-date="minDateObj"
          :is-dark="isDarkMode"
          color="emerald"
          is-expanded
          @dayclick="handleDateSelect"
        />
        
        <!-- Time Selection -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div class="grid grid-cols-2 gap-3">
            <select v-model="selectedHour" class="input-select">
              <option v-for="hour in 24" :key="hour - 1" :value="hour - 1">
                {{ String(hour - 1).padStart(2, '0') }}:00
              </option>
            </select>
            <select v-model="selectedMinute" class="input-select">
              <option v-for="minute in [0, 15, 30, 45]" :key="minute" :value="minute">
                :{{ String(minute).padStart(2, '0') }}
              </option>
            </select>
          </div>
          
          <!-- Apply Button -->
          <button
            @click="applySelection"
            class="w-full mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    
    <!-- Help Text -->
    <p v-if="helpText && !error" class="text-sm text-gray-500 dark:text-gray-400">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, defineProps, defineEmits, withDefaults } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  helpText?: string
  disabled?: boolean
  min?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select date and time',
  id: () => `datetime-picker-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// State
const showPicker = ref(false)
const selectedDate = ref<Date | null>(null)
const selectedHour = ref(9)
const selectedMinute = ref(0)
const isDarkMode = ref(false)

// Computed
const minDateObj = computed(() => {
  return props.min ? new Date(props.min) : new Date()
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  try {
    const date = new Date(props.modelValue)
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return props.modelValue
  }
})

const inputClasses = computed(() => [
  'w-full pl-10 pr-4 py-3 border rounded-xl transition-all cursor-pointer',
  'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none',
  'dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
  props.error
    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-300 dark:border-gray-600 bg-white hover:border-emerald-300',
  props.disabled
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
    : 'cursor-pointer'
])

// Methods
const handleDateSelect = (day: { date: Date }) => {
  selectedDate.value = day.date
}

const applySelection = () => {
  if (!selectedDate.value) return
  
  const date = new Date(selectedDate.value)
  date.setHours(selectedHour.value)
  date.setMinutes(selectedMinute.value)
  date.setSeconds(0)
  
  emit('update:modelValue', date.toISOString().slice(0, 16))
  showPicker.value = false
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  const picker = document.getElementById(props.id)?.closest('.relative')
  
  if (picker && !picker.contains(target)) {
    showPicker.value = false
  }
}

// Detect dark mode
const updateDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Initialize dark mode detection
  updateDarkMode()
  
  // Watch for dark mode changes
  const observer = new MutationObserver(updateDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  
  // Initialize with current value
  if (props.modelValue) {
    const date = new Date(props.modelValue)
    selectedDate.value = date
    selectedHour.value = date.getHours()
    selectedMinute.value = date.getMinutes()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    selectedDate.value = date
    selectedHour.value = date.getHours()
    selectedMinute.value = date.getMinutes()
  }
})
</script>

<style>
.input-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
  color: #374151;
  transition: all 0.15s ease;
}

.input-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* Dark mode styles */
.dark .input-select {
  background-color: #374151;
  border-color: #4b5563;
  color: white;
}

.dark .input-select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* V-Calendar dark mode compatibility */
.vc-container {
  border-radius: 0.75rem;
}

/* Light mode calendar styles */
.vc-day-content:hover {
  background-color: #d1fae5 !important;
  color: #047857 !important;
}

.vc-day.is-today .vc-day-content {
  background-color: #10b981 !important;
  color: white !important;
}

.vc-day.is-selected .vc-day-content {
  background-color: #10b981 !important;
  color: white !important;
}

/* Dark mode calendar styles */
.dark .vc-container {
  background-color: #1f2937;
  color: #f9fafb;
}

.dark .vc-header {
  color: #f9fafb;
}

.dark .vc-title {
  color: #f9fafb !important;
}

.dark .vc-weekday {
  color: #9ca3af !important;
}

.dark .vc-day-content {
  color: #f9fafb !important;
}

.dark .vc-day-content:hover {
  background-color: #064e3b !important;
  color: #6ee7b7 !important;
}

.dark .vc-day.is-today .vc-day-content {
  background-color: #059669 !important;
  color: white !important;
}

.dark .vc-day.is-selected .vc-day-content {
  background-color: #059669 !important;
  color: white !important;
}

.dark .vc-arrow {
  color: #9ca3af !important;
}

.dark .vc-arrow:hover {
  background-color: #374151 !important;
  color: #f9fafb !important;
}

/* Ensure popup background works in dark mode */
.dark .vc-popover-content {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
}
</style>
