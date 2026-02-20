<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="bottomsheet-backdrop">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        @click="onBackdropClick"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="bottomsheet-content">
      <div
        v-if="isVisible"
        ref="sheetRef"
        :class="[
          'fixed z-50 bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2',
          'bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]',
          'flex flex-col overflow-hidden',
          sizeClass,
        ]"
        :style="sheetStyle"
        role="alertdialog"
        aria-modal="true"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Drag handle -->
        <div
          v-if="dismissible"
          class="flex-shrink-0 flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
          @mousedown="startMouseDrag"
        >
          <div class="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <!-- Header -->
        <div v-if="title || $slots.header" class="flex-shrink-0 px-5 pt-3 pb-2">
          <slot name="header">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  v-if="icon"
                  :class="['w-9 h-9 rounded-xl flex items-center justify-center', iconBgClass]"
                >
                  <v-icon :name="icon" :class="['w-4.5 h-4.5', iconColorClass]" />
                </div>
                <div>
                  <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h2>
                  <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle }}</p>
                </div>
              </div>
              <button
                v-if="dismissible"
                @click="close"
                class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
                aria-label="Close"
              >
                <v-icon name="hi-solid-x" class="w-4 h-4" />
              </button>
            </div>
          </slot>
        </div>

        <!-- Content (scrollable) -->
        <div class="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <slot name="footer" />
        </div>

        <!-- Safe area bottom padding on iOS -->
        <div class="flex-shrink-0 h-[env(safe-area-inset-bottom)]" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  isVisible: boolean
  title?: string
  subtitle?: string
  icon?: string
  iconVariant?: 'emerald' | 'blue' | 'red' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  dismissible?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  icon: '',
  iconVariant: 'emerald',
  size: 'md',
  dismissible: true,
  persistent: false,
})

const emit = defineEmits<{
  close: []
}>()

const sheetRef = ref<HTMLElement | null>(null)

// --- Swipe to dismiss ---
const touchStartY = ref(0)
const touchDeltaY = ref(0)
const isSwiping = ref(false)
const isDragging = ref(false)

const sheetStyle = computed(() => {
  if (!isSwiping.value && !isDragging.value) return {}
  const delta = Math.max(0, touchDeltaY.value) // Only allow downward drag
  if (delta < 5) return {}
  return {
    transform: `translateY(${delta}px)`,
    transition: 'none',
  }
})

function onTouchStart(e: TouchEvent) {
  if (!props.dismissible) return
  const target = e.target as HTMLElement
  // Don't intercept scroll inside content
  const scrollable = target.closest('.overflow-y-auto')
  if (scrollable && scrollable.scrollTop > 0) return

  touchStartY.value = e.touches[0].clientY
  touchDeltaY.value = 0
  isSwiping.value = false
}

function onTouchMove(e: TouchEvent) {
  if (!props.dismissible) return
  const deltaY = e.touches[0].clientY - touchStartY.value

  if (!isSwiping.value && deltaY > 10) {
    isSwiping.value = true
  }

  if (isSwiping.value && deltaY > 0) {
    touchDeltaY.value = deltaY
    e.preventDefault()
  }
}

function onTouchEnd() {
  if (isSwiping.value && touchDeltaY.value > 100) {
    close()
  }
  touchDeltaY.value = 0
  isSwiping.value = false
}

// --- Mouse drag (desktop) ---
function startMouseDrag(e: MouseEvent) {
  if (!props.dismissible) return
  isDragging.value = true
  touchStartY.value = e.clientY
  touchDeltaY.value = 0
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  const deltaY = e.clientY - touchStartY.value
  if (deltaY > 0) {
    touchDeltaY.value = deltaY
  }
}

function onMouseUp() {
  if (isDragging.value && touchDeltaY.value > 100) {
    close()
  }
  touchDeltaY.value = 0
  isDragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// --- Size classes ---
const sizeClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'max-h-[40vh] md:max-h-[50vh] md:w-[400px]',
    md: 'max-h-[60vh] md:max-h-[70vh] md:w-[480px]',
    lg: 'max-h-[75vh] md:max-h-[80vh] md:w-[560px]',
    xl: 'max-h-[85vh] md:max-h-[85vh] md:w-[640px]',
    auto: 'max-h-[85vh] md:max-h-[85vh] md:w-[480px]',
  }
  return sizes[props.size]
})

// --- Icon styling ---
const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
  }
  return classes[props.iconVariant]
})

const iconColorClass = computed(() => {
  const classes: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }
  return classes[props.iconVariant]
})

// --- Helpers ---
function close() {
  if (!props.persistent) {
    emit('close')
  }
}

function onBackdropClick() {
  if (props.dismissible && !props.persistent) {
    close()
  }
}

// Lock body scroll when open
watch(() => props.isVisible, (visible) => {
  document.body.style.overflow = visible ? 'hidden' : ''
})

// Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isVisible && props.dismissible && !props.persistent) {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Backdrop */
.bottomsheet-backdrop-enter-active {
  transition: opacity 0.25s ease;
}
.bottomsheet-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.bottomsheet-backdrop-enter-from,
.bottomsheet-backdrop-leave-to {
  opacity: 0;
}

/* Sheet content — mobile: slide from bottom, desktop: scale+fade */
.bottomsheet-content-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.bottomsheet-content-leave-active {
  transition: all 0.2s ease-in;
}

/* Mobile: bottom to top */
.bottomsheet-content-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.bottomsheet-content-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Desktop: scale + fade centered */
@media (min-width: 768px) {
  .bottomsheet-content-enter-from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  .bottomsheet-content-leave-to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  .bottomsheet-content-enter-to,
  .bottomsheet-content-leave-from {
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Accessibility: reduce motion */
@media (prefers-reduced-motion: reduce) {
  .bottomsheet-backdrop-enter-active,
  .bottomsheet-backdrop-leave-active,
  .bottomsheet-content-enter-active,
  .bottomsheet-content-leave-active {
    transition: none !important;
  }
}
</style>
