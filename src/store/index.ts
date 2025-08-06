import { createPinia } from 'pinia'

// Create and export the pinia instance
export const pinia = createPinia()

// Export stores for easy importing
export { useThemeStore } from './theme'
export { useUserStore } from './user'
