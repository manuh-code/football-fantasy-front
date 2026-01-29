import { ref, computed } from 'vue'

export interface LoadingState {
  [key: string]: boolean
}

export function useLoading() {
  const loadingStates = ref<LoadingState>({})

  const isLoading = computed(() => (key?: string) => {
    if (key) {
      return loadingStates.value[key] || false
    }
    return Object.values(loadingStates.value).some(state => state)
  })

  function setLoading(key: string, loading: boolean) {
    loadingStates.value[key] = loading
  }

  function startLoading(key: string) {
    setLoading(key, true)
  }

  function stopLoading(key: string) {
    setLoading(key, false)
  }

  function clearLoading(key?: string) {
    if (key) {
      delete loadingStates.value[key]
    } else {
      loadingStates.value = {}
    }
  }

  // Utility function for async operations
  async function withLoading<T>(key: string, operation: () => Promise<T>): Promise<T> {
    try {
      startLoading(key)
      return await operation()
    } finally {
      stopLoading(key)
    }
  }

  return {
    loadingStates,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearLoading,
    withLoading,
  }
}
