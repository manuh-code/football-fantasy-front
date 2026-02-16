<template>
  <div 
    :class="[
      'w-full md:w-96 rounded-xl shadow-2xl border-2 pointer-events-auto backdrop-blur-sm transition-all duration-300',
      'transform hover:scale-[1.02] active:scale-[0.98]',
      toastClasses,
      { 'opacity-100': show, 'opacity-0': !show }
    ]"
    role="alert"
    :aria-live="props.toast.type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start gap-3 p-4">
      <!-- Icon -->
      <div :class="['flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center', iconBgClass]">
        <v-icon :name="iconName" :class="['w-6 h-6 md:w-5 md:h-5', iconColorClass]" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0 pt-0.5">
        <h4 :class="['text-sm md:text-base font-semibold mb-1', titleColorClass]">
          {{ props.toast.title }}
        </h4>
        <p v-if="props.toast.message" :class="['text-sm', messageColorClass]">
          {{ props.toast.message }}
        </p>
        
        <!-- Actions -->
        <div v-if="props.toast.actions && props.toast.actions.length" class="flex flex-wrap gap-2 mt-3">
          <button
            v-for="action in toast.actions"
            :key="action.label"
            @click="action.action"
            :class="[
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
              'hover:scale-105 active:scale-95',
              actionButtonClass
            ]"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Close Button -->
      <button 
        @click="emit('close')" 
        :class="[
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          'transition-all hover:scale-110 active:scale-90',
          closeButtonClass
        ]"
        aria-label="Close notification"
      >
        <v-icon name="hi-solid-x" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import type { ToastMessage } from '@/composables/useToast'

interface Props {
  toast: ToastMessage
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const show = ref(false)

const toastClasses = computed(() => {
  const classes = {
    success: 'bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800'
  }
  return classes[props.toast.type]
})

const iconName = computed(() => {
  const icons = {
    success: 'hi-solid-check-circle',
    error: 'hi-solid-x-circle',
    warning: 'hi-solid-exclamation',
    info: 'hi-solid-information-circle'
  }
  return icons[props.toast.type]
})

const iconBgClass = computed(() => {
  const classes = {
    success: 'bg-green-100 dark:bg-green-900/50',
    error: 'bg-red-100 dark:bg-red-900/50',
    warning: 'bg-amber-100 dark:bg-amber-900/50',
    info: 'bg-blue-100 dark:bg-blue-900/50'
  }
  return classes[props.toast.type]
})

const iconColorClass = computed(() => {
  const classes = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400'
  }
  return classes[props.toast.type]
})

const titleColorClass = computed(() => {
  const classes = {
    success: 'text-green-900 dark:text-green-100',
    error: 'text-red-900 dark:text-red-100',
    warning: 'text-amber-900 dark:text-amber-100',
    info: 'text-blue-900 dark:text-blue-100'
  }
  return classes[props.toast.type]
})

const messageColorClass = computed(() => {
  const classes = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-amber-700 dark:text-amber-300',
    info: 'text-blue-700 dark:text-blue-300'
  }
  return classes[props.toast.type]
})

const closeButtonClass = computed(() => {
  const classes = {
    success: 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50',
    error: 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    info: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
  }
  return classes[props.toast.type]
})

const actionButtonClass = computed(() => {
  const classes = {
    success: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900',
    error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900',
    warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900',
    info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900'
  }
  return classes[props.toast.type]
})

onMounted(() => {
  // Small delay to trigger the animation
  setTimeout(() => {
    show.value = true
  }, 50)
})
</script>
