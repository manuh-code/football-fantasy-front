import { ref, computed } from 'vue'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Global state for toasts - shared across all instances (max 1 active)
const globalToasts = ref<ToastMessage[]>([])
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>()

export function useToast() {
  const activeToasts = computed(() => globalToasts.value)

  function addToast(toast: Omit<ToastMessage, 'id'>) {
    // Clear all existing toasts and their timers to only show one at a time
    clearAllToasts()

    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast,
    }

    globalToasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
      activeTimers.set(id, timer)
    }

    return id
  }

  function removeToast(id: string) {
    // Clear the timer if it exists
    const timer = activeTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      activeTimers.delete(id)
    }

    const index = globalToasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      globalToasts.value.splice(index, 1)
    }
  }

  function clearAllToasts() {
    // Clear all active timers
    activeTimers.forEach((timer) => clearTimeout(timer))
    activeTimers.clear()
    globalToasts.value = []
  }

  // Convenience methods
  function success(title: string, message?: string, options?: Partial<ToastMessage>) {
    return addToast({ type: 'success', title, message, ...options })
  }

  function error(title: string, message?: string, options?: Partial<ToastMessage>) {
    return addToast({ type: 'error', title, message, ...options })
  }

  function warning(title: string, message?: string, options?: Partial<ToastMessage>) {
    return addToast({ type: 'warning', title, message, ...options })
  }

  function info(title: string, message?: string, options?: Partial<ToastMessage>) {
    return addToast({ type: 'info', title, message, ...options })
  }

  return {
    toasts: activeToasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  }
}
