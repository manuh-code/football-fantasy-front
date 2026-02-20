<template>
  <div
    ref="toastRef"
    :class="[
      'w-full md:w-[380px] rounded-2xl pointer-events-auto transition-all duration-300 overflow-hidden',
      'shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
      toastClasses,
      { 'opacity-100 translate-y-0': show, 'opacity-0 translate-y-2': !show }
    ]"
    :style="swipeStyle"
    role="alert"
    :aria-live="props.toast.type === 'error' ? 'assertive' : 'polite'"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Main content -->
    <div class="flex items-center gap-3 px-4 py-3.5">
      <!-- Icon -->
      <div :class="['flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center', iconBgClass]">
        <v-icon :name="iconName" :class="['w-5 h-5', iconColorClass]" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p :class="['text-[15px] font-semibold leading-tight', titleColorClass]">
          {{ props.toast.title }}
        </p>
        <p v-if="props.toast.message" :class="['text-[13px] leading-snug mt-0.5', messageColorClass]">
          {{ props.toast.message }}
        </p>
      </div>

      <!-- Close Button -->
      <button
        @click="emit('close')"
        :class="[
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          'transition-all active:scale-90',
          closeButtonClass
        ]"
        aria-label="Cerrar notificación"
      >
        <v-icon name="hi-solid-x" class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Actions (if any) -->
    <div v-if="props.toast.actions && props.toast.actions.length" class="flex gap-2 px-4 pb-3 -mt-1">
      <button
        v-for="action in toast.actions"
        :key="action.label"
        @click="action.action"
        :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
          'active:scale-95',
          actionButtonClass
        ]"
      >
        {{ action.label }}
      </button>
    </div>

    <!-- Progress bar -->
    <div v-if="props.toast.duration" class="h-[3px] w-full bg-black/5 dark:bg-white/5">
      <div
        :class="['h-full rounded-full transition-none', progressBarClass]"
        :style="{ width: progressWidth + '%' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { ToastMessage } from '@/composables/useToast'

interface Props {
  toast: ToastMessage
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const show = ref(false)
const toastRef = ref<HTMLElement | null>(null)

// --- Progress bar ---
const progressWidth = ref(100)
let progressInterval: ReturnType<typeof setInterval> | null = null

// --- Swipe to dismiss ---
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchDeltaX = ref(0)
const isSwiping = ref(false)

const swipeStyle = computed(() => {
  if (!isSwiping.value || Math.abs(touchDeltaX.value) < 5) return {}
  return {
    transform: `translateX(${touchDeltaX.value}px)`,
    opacity: `${Math.max(0, 1 - Math.abs(touchDeltaX.value) / 200)}`,
    transition: 'none',
  }
})

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

function onTouchMove(e: TouchEvent) {
  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value

  // Only swipe horizontally
  if (!isSwiping.value && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isSwiping.value = true
  }

  if (isSwiping.value) {
    touchDeltaX.value = deltaX
    e.preventDefault()
  }
}

function onTouchEnd() {
  if (isSwiping.value && Math.abs(touchDeltaX.value) > 80) {
    emit('close')
  } else {
    touchDeltaX.value = 0
    isSwiping.value = false
  }
}

// --- Toast styling ---
const toastClasses = computed(() => {
  const classes = {
    success: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-green-200/60 dark:border-green-700/40',
    error: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-red-200/60 dark:border-red-700/40',
    warning: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-amber-200/60 dark:border-amber-700/40',
    info: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-blue-200/60 dark:border-blue-700/40',
  }
  return classes[props.toast.type]
})

const iconName = computed(() => {
  const icons = {
    success: 'hi-solid-check-circle',
    error: 'hi-solid-x-circle',
    warning: 'hi-solid-exclamation',
    info: 'hi-solid-information-circle',
  }
  return icons[props.toast.type]
})

const iconBgClass = computed(() => {
  const classes = {
    success: 'bg-green-100 dark:bg-green-500/20',
    error: 'bg-red-100 dark:bg-red-500/20',
    warning: 'bg-amber-100 dark:bg-amber-500/20',
    info: 'bg-blue-100 dark:bg-blue-500/20',
  }
  return classes[props.toast.type]
})

const iconColorClass = computed(() => {
  const classes = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  }
  return classes[props.toast.type]
})

const titleColorClass = computed(() => {
  return 'text-gray-900 dark:text-gray-100'
})

const messageColorClass = computed(() => {
  return 'text-gray-500 dark:text-gray-400'
})

const closeButtonClass = computed(() => {
  return 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
})

const actionButtonClass = computed(() => {
  const classes = {
    success: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
    error: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    warning: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
    info: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  }
  return classes[props.toast.type]
})

const progressBarClass = computed(() => {
  const classes = {
    success: 'bg-green-500 dark:bg-green-400',
    error: 'bg-red-500 dark:bg-red-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    info: 'bg-blue-500 dark:bg-blue-400',
  }
  return classes[props.toast.type]
})

onMounted(() => {
  // Trigger entrance animation
  setTimeout(() => {
    show.value = true
  }, 30)

  // Animate progress bar
  if (props.toast.duration && props.toast.duration > 0) {
    const totalDuration = props.toast.duration
    const intervalMs = 20
    const decrement = (100 / totalDuration) * intervalMs

    progressInterval = setInterval(() => {
      progressWidth.value = Math.max(0, progressWidth.value - decrement)
      if (progressWidth.value <= 0 && progressInterval) {
        clearInterval(progressInterval)
      }
    }, intervalMs)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>
