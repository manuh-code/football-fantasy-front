<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="bottomsheet-backdrop">
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        :style="{ zIndex }"
        @click="onBackdropClick"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="bottomsheet-content">
      <div
        v-if="isVisible"
        ref="sheetRef"
        :class="[
          'fixed bottom-0 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2',
          'bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]',
          'flex flex-col overflow-hidden',
          sizeClass,
        ]"
        :style="sheetStyle"
        :role="role"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="!title ? ariaLabel || undefined : undefined"
        tabindex="-1"
      >
        <!-- Draggable region: only the handle + header dismiss on swipe/drag,
             so a form's own scroll/interaction in the content below is never
             mistaken for a close gesture. -->
        <div
          class="flex-shrink-0"
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
                    <h2 :id="titleId" class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h2>
                    <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ subtitle }}</p>
                  </div>
                </div>
                <button
                  v-if="dismissible"
                  @click="close"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all"
                  :aria-label="$t('common.actions.close')"
                >
                  <v-icon name="hi-solid-x" class="w-4 h-4" />
                </button>
              </div>
            </slot>
          </div>
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
import { ref, computed, watch, nextTick, useId, onMounted, onUnmounted } from 'vue'

interface Props {
  isVisible: boolean
  title?: string
  subtitle?: string
  icon?: string
  iconVariant?: 'emerald' | 'blue' | 'red' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  dismissible?: boolean
  persistent?: boolean
  // `alertdialog` is right for a confirmation, but a sheet that holds a form
  // should announce as a plain dialog so its fields are read normally.
  role?: 'dialog' | 'alertdialog'
  // Names the sheet when it carries no visible title (a sheet whose own content
  // is the heading, for instance).
  ariaLabel?: string
  // Moves focus into the sheet on open so keyboard and screen-reader users land
  // inside it. Opt-in: sheets that open under a still-focused trigger elsewhere
  // in the app should keep their current behaviour.
  autofocus?: boolean
  // Stacking order for the backdrop + sheet. Defaults to the app-wide sheet
  // layer (120); raise it for a sheet that opens ON TOP of another overlay
  // (e.g. a notifications sheet launched from the team-profile drawer).
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  icon: '',
  iconVariant: 'emerald',
  size: 'md',
  dismissible: true,
  persistent: false,
  role: 'alertdialog',
  ariaLabel: '',
  autofocus: false,
  zIndex: 120,
})

// Ties the sheet to its heading for assistive tech; ids are document-global, so
// each instance mints its own.
const titleId = useId()

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
  const base: Record<string, string | number> = { zIndex: props.zIndex }
  if (isSwiping.value || isDragging.value) {
    const delta = Math.max(0, touchDeltaY.value) // Only allow downward drag
    if (delta >= 5) {
      base.transform = `translateY(${delta}px)`
      base.transition = 'none'
    }
  }
  return base
})

function onTouchStart(e: TouchEvent) {
  if (!props.dismissible) return
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

// Lock body scroll when open and restore exact position when closed.
// The position: fixed + top trick prevents the browser from jumping to top
// (or staying at bottom after the virtual keyboard closes) when overflow
// is toggled. We save scrollY before locking and restore it on unlock.
let lockedScrollY = 0
let previouslyFocused: HTMLElement | null = null

watch(() => props.isVisible, async (visible) => {
  if (visible) {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${lockedScrollY}px`
    document.body.style.width = '100%'

    if (props.autofocus) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      // preventScroll keeps the sheet from being yanked around while it is still
      // sliding in.
      sheetRef.value?.focus({ preventScroll: true })
    }
  } else {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    window.scrollTo({ top: lockedScrollY, behavior: 'instant' })

    previouslyFocused?.focus({ preventScroll: true })
    previouslyFocused = null
  }
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
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
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

/* Sheet content — mobile: slide from bottom, desktop: scale+fade.
   Enter uses the iOS "sheet" decel curve (smooth, no bounce); exit resolves
   faster (asymmetric) so dismissing feels snappy. Only transform/opacity are
   animated to keep it off the main thread. */
.bottomsheet-content-enter-active {
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.34s ease-out;
  will-change: transform, opacity;
}
.bottomsheet-content-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.22s ease-in;
  will-change: transform, opacity;
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
