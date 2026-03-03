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

    // Registrar el SW de Firebase Messaging
    if (registration && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
      }).then((firebaseRegistration) => {
        console.log('Firebase Messaging SW registered')
      }).catch((error) => {
        console.error('Firebase Messaging SW registration failed:', error)
      })
    }
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  }
})

export const updateServiceWorker = updateSW
