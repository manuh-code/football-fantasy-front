<template>
  <div class="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 z-[9999] pointer-events-none">
    <TransitionGroup 
      name="toast" 
      tag="div" 
      class="flex flex-col gap-3 items-center md:items-end"
    >
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

const { toasts, removeToast } = useToast()
</script>

<style scoped>
/* Toast animations - Mobile: slide from top, Desktop: slide from right */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile: slide from top */
@media (max-width: 768px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateY(-100%) scale(0.95);
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateY(-50%) scale(0.95);
  }
}

/* Desktop: slide from right */
@media (min-width: 769px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}

.toast-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
