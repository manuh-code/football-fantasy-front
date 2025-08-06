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

// Global state for toasts - shared across all instances
const globalToasts = ref<ToastMessage[]>([])

export function useToast() {
  const activeToasts = computed(() => globalToasts.value)

  function addToast(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast,
    }

    console.log('useToast: Adding toast to global state', { type: newToast.type, title: newToast.title, id })
    globalToasts.value.push(newToast)
    console.log('useToast: Current toasts count:', globalToasts.value.length)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = globalToasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      console.log('useToast: Removing toast with id:', id)
      globalToasts.value.splice(index, 1)
    }
  }

  function clearAllToasts() {
    console.log('useToast: Clearing all toasts')
    globalToasts.value = []
  }

  // Convenience methods
  function success(title: string, message?: string, options?: Partial<ToastMessage>) {
    console.log('useToast: Adding success toast', { title, message, options })
    return addToast({ type: 'success', title, message, ...options })
  }

  function error(title: string, message?: string, options?: Partial<ToastMessage>) {
    console.log('useToast: Adding error toast', { title, message, options })
    return addToast({ type: 'error', title, message, ...options })
  }

  function warning(title: string, message?: string, options?: Partial<ToastMessage>) {
    console.log('useToast: Adding warning toast', { title, message, options })
    return addToast({ type: 'warning', title, message, ...options })
  }

  function info(title: string, message?: string, options?: Partial<ToastMessage>) {
    console.log('useToast: Adding info toast', { title, message, options })
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
