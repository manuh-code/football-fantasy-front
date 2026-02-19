<template>
  <!-- Teleported to body to avoid transform context issues (swipe navigation) -->
  <Teleport to="body">
    <!-- Mobile: bottom (above footer nav), Desktop: top-right -->
    <div class="toast-container fixed left-4 right-4 z-[9999] pointer-events-none md:left-auto md:right-6 md:top-6 toast-position">
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
  </Teleport>
</template>

<script lang="ts" setup>
import { useToast } from '@/composables/useToast'
import ToastComponent from './ToastComponent.vue'

const { toasts, removeToast } = useToast()
</script>

<style>
/* Toast container positioning - unscoped because of Teleport */

/* Mobile: above the footer nav bar */
.toast-position {
  bottom: calc(5rem + env(safe-area-inset-bottom));
}

/* Desktop: top-right corner */
@media (min-width: 768px) {
  .toast-position {
    bottom: auto;
  }
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile: slide from bottom */
@media (max-width: 767px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateY(100%) scale(0.95);
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateY(100%) scale(0.95);
  }
}

/* Desktop: slide from right */
@media (min-width: 768px) {
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
