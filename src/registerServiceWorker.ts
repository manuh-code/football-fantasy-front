/* eslint-disable no-console */

/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // New content available, please refresh.
  },
  onOfflineReady() {
    // App ready to work offline.

  },
  onRegistered(registration) {
    console.log('PWA SW registered')
    // Firebase Messaging SW is registered in usePushNotifications composable
    // to avoid duplicate registrations that cause token issues on mobile/PWA
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  }
})

export const updateServiceWorker = updateSW
