<template>
  <div class="toast" :class="[`toast--${props.toast.type}`, { 'toast--show': show }]">
    <div class="toast__content">
      <div class="toast__header">
        <h4 class="toast__title">{{ props.toast.title }}</h4>
        <button @click="emit('close')" class="toast__close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>
      <p v-if="props.toast.message" class="toast__message">{{ toast.message }}</p>
      
      <!-- Actions -->
      <div v-if="props.toast.actions && props.toast.actions.length" class="toast__actions">
        <button
          v-for="action in toast.actions"
          :key="action.label"
          @click="action.action"
          class="toast__action"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue'
import type { ToastMessage } from '@/composables/useToast'

interface Props {
  toast: ToastMessage
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const show = ref(false)

onMounted(() => {
  console.log('ToastComponent: Mounted with toast:', props.toast)
  // Small delay to trigger the animation
  setTimeout(() => {
    show.value = true
    console.log('ToastComponent: Show animation triggered')
  }, 50)
})
</script>

<style lang="scss" scoped>
.toast {
  @apply max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5;
  margin-bottom: 1rem;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;

  &--show {
    transform: translateX(0);
    opacity: 1;
  }

  &--success {
    @apply bg-green-50 ring-green-200;
    
    .toast__title {
      @apply text-green-800;
    }
    
    .toast__message {
      @apply text-green-700;
    }
  }

  &--error {
    @apply bg-red-50 ring-red-200;
    
    .toast__title {
      @apply text-red-800;
    }
    
    .toast__message {
      @apply text-red-700;
    }
  }

  &--warning {
    @apply bg-yellow-50 ring-yellow-200;
    
    .toast__title {
      @apply text-yellow-800;
    }
    
    .toast__message {
      @apply text-yellow-700;
    }
  }

  &--info {
    @apply bg-blue-50 ring-blue-200;
    
    .toast__title {
      @apply text-blue-800;
    }
    
    .toast__message {
      @apply text-blue-700;
    }
  }
}

.toast__content {
  @apply p-4;
}

.toast__header {
  @apply flex items-start justify-between;
}

.toast__title {
  @apply text-sm font-medium;
  margin: 0;
}

.toast__close {
  @apply ml-4 -mx-1.5 -my-1.5 rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
  transition: colors 0.2s;
}

.toast__message {
  @apply mt-1 text-sm;
  margin: 0.5rem 0 0 0;
}

.toast__actions {
  @apply mt-3 flex space-x-2;
}

.toast__action {
  @apply bg-white rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
  transition: all 0.2s;
}
</style>
