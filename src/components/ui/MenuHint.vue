<template>
  <!-- Menu Hint - Solo visible en móvil cuando el menú está oculto -->
  <transition name="hint-fade">
    <div
      v-if="showHint && !scrollState.isVisible.value"
      @click="handleShowMenu"
      class="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 md:hidden"
    >
      <button
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg text-sm font-medium transition-all duration-200 animate-bounce-subtle"
        aria-label="Show menu"
      >
        <v-icon name="hi-solid-chevron-up" class="w-4 h-4" />
        <span>Menu</span>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useScrollDirection } from '@/composables'

// Props
interface Props {
  /** Whether to show the hint indicator */
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
})

// State
const showHint = ref(false)
const scrollState = useScrollDirection({ threshold: 5 })

// Show hint after a delay when menu is hidden
let hintTimeout: number | null = null

watch(
  () => scrollState.isVisible.value,
  (isVisible) => {
    if (!props.enabled) return

    // Clear any existing timeout
    if (hintTimeout) {
      clearTimeout(hintTimeout)
      hintTimeout = null
    }

    if (!isVisible) {
      // Show hint after 2 seconds of menu being hidden
      hintTimeout = window.setTimeout(() => {
        showHint.value = true
      }, 2000)
    } else {
      // Hide hint immediately when menu is visible
      showHint.value = false
    }
  }
)

// Handle click to show menu
const handleShowMenu = () => {
  scrollState.show()
  showHint.value = false
  
  // Scroll down a bit to trigger the "scroll up" detection
  window.scrollBy({ top: 1, behavior: 'smooth' })
}

// Initialize
onMounted(() => {
  if (props.enabled && !scrollState.isVisible.value) {
    hintTimeout = window.setTimeout(() => {
      showHint.value = true
    }, 3000)
  }
})
</script>

<style scoped>
/* Hint fade transition */
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: all 0.3s ease;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Subtle bounce animation */
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}
</style>
