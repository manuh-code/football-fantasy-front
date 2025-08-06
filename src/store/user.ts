import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id?: string
  email?: string
  name?: string
  // Add more user properties as needed
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const authToken = computed(() => token.value)

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    // Optional: Store token in localStorage for persistence
    localStorage.setItem('auth_token', newToken)
  }

  function setUser(userData: User) {
    user.value = userData
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  function loadTokenFromStorage() {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
    }
  }

  function getAuthorizationHeader(): string | undefined {
    return token.value ? `Bearer ${token.value}` : undefined
  }

  return {
    // State
    token: authToken,
    user: currentUser,
    
    // Getters
    isAuthenticated,
    
    // Actions
    setToken,
    setUser,
    clearAuth,
    loadTokenFromStorage,
    getAuthorizationHeader,
  }
})
