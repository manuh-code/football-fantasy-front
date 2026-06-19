/* eslint-disable no-console */

/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register'
import {
  _bindUpdateSW,
  _setNeedRefresh,
  _setOfflineReady,
} from '@/composables/usePwaUpdate'

const updateSW = registerSW({
  onNeedRefresh() {
    // A new version is waiting. Surface it via PwaUpdateModal.vue.
    _setNeedRefresh(true)
  },
  onOfflineReady() {
    // App precached and ready to work offline.
    _setOfflineReady(true)
  },
  onRegistered() {
    console.log('PWA SW registered')
    // Firebase Messaging SW is registered in usePushNotifications composable
    // to avoid duplicate registrations that cause token issues on mobile/PWA
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  },
})

// Wire the updater so the UI can trigger skipWaiting + reload.
_bindUpdateSW(updateSW)

export const updateServiceWorker = updateSW
