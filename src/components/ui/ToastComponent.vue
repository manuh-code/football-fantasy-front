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
  // Small delay to trigger the animation
  setTimeout(() => {
    show.value = true
  }, 50)
})
</script>

<style scoped>
.toast {
  max-width: 24rem;
  width: 100%;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  pointer-events: auto;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.toast--show {
  transform: translateX(0);
  opacity: 1;
}

.toast--success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}

.toast--success .toast__title {
  color: #166534;
}

.toast--success .toast__message {
  color: #15803d;
}

.toast--error {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.toast--error .toast__title {
  color: #991b1b;
}

.toast--error .toast__message {
  color: #dc2626;
}

.toast--warning {
  background-color: #fffbeb;
  border-color: #fed7aa;
}

.toast--warning .toast__title {
  color: #92400e;
}

.toast--warning .toast__message {
  color: #d97706;
}

.toast--info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.toast--info .toast__title {
  color: #1e40af;
}

.toast--info .toast__message {
  color: #2563eb;
}

.toast__content {
  padding: 1rem;
}

.toast__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.toast__title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.toast__close {
  margin-left: 1rem;
  margin-left: -0.375rem;
  margin-top: -0.375rem;
  margin-right: -0.375rem;
  margin-bottom: -0.375rem;
  border-radius: 0.375rem;
  padding: 0.375rem;
  color: #9ca3af;
  transition: colors 0.2s;
}

.toast__close:hover {
  color: #6b7280;
}

.toast__close:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6366f1;
  box-shadow: 0 0 0 2px #6366f1, 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.toast__message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.toast__actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.toast__action {
  background-color: white;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
}

.toast__action:hover {
  background-color: #f9fafb;
}

.toast__action:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6366f1;
  box-shadow: 0 0 0 2px #6366f1, 0 0 0 4px rgba(99, 102, 241, 0.1);
}
</style>
