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
  onRegistered() {
    // SW Registered
  },
  onRegisterError() {
    // SW registration error
  }
})

export const updateServiceWorker = updateSW
