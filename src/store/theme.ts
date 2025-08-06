import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark = ref(false)
  const isSystemTheme = ref(true)

  // Getters
  const currentTheme = computed(() => {
    if (isSystemTheme.value) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return isDark.value ? 'dark' : 'light'
  })

  // Actions
  function toggleTheme() {
    if (isSystemTheme.value) {
      isSystemTheme.value = false
      isDark.value = !window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = !isDark.value
    }
    applyTheme()
  }

  function setTheme(theme: 'light' | 'dark' | 'system') {
    if (theme === 'system') {
      isSystemTheme.value = true
      isDark.value = false
    } else {
      isSystemTheme.value = false
      isDark.value = theme === 'dark'
    }
    applyTheme()
  }

  function applyTheme() {
    const theme = currentTheme.value
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Save preference to localStorage
    if (isSystemTheme.value) {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', theme)
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      isSystemTheme.value = false
      isDark.value = savedTheme === 'dark'
    } else {
      isSystemTheme.value = true
      isDark.value = false
    }
    
    applyTheme()
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (isSystemTheme.value) {
        applyTheme()
      }
    })
  }

  return {
    // State
    isDark,
    isSystemTheme,
    // Getters
    currentTheme,
    // Actions
    toggleTheme,
    setTheme,
    initTheme,
    applyTheme,
  }
})
