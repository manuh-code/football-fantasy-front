<template>
  <!-- Teleported to body to avoid transform context issues (swipe navigation) -->
  <Teleport to="body">
    <!-- Mobile: bottom (above footer nav), Desktop: top-center -->
    <div class="toast-container fixed left-4 right-4 z-[9999] pointer-events-none md:left-1/2 md:-translate-x-1/2 md:right-auto md:top-6 md:w-[400px] toast-position">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3 items-center"
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

/* Desktop: top-center */
@media (min-width: 768px) {
  .toast-position {
    bottom: auto;
  }
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}

.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.06, 0.71, 0.55, 1);
}

/* Mobile: slide from bottom */
@media (max-width: 767px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
}

/* Desktop: slide from top */
@media (min-width: 768px) {
  .toast-enter-from {
    opacity: 0;
    transform: translateY(-16px) scale(0.96);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateY(-16px) scale(0.96);
  }
}

.toast-move {
  transition: transform 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
</style>
