<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <ToastComponent
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from '@/composables/useToast'
import ToastComponent from './ToastComponent.vue'
import { watch } from 'vue'

const { toasts, removeToast } = useToast()

// Debug: Watch for toast changes
watch(toasts, (newToasts) => {
  console.log('ToastContainer: Toasts updated, count:', newToasts.length, 'toasts:', newToasts)
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
