
/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register'
import {
  _bindUpdateSW,
  _setNeedRefresh,
  _setOfflineReady,
} from '@/composables/usePwaUpdate'

// Backstop polling interval for a tab that stays open and visible for a long
// time. Detection is ALSO triggered immediately on registration, whenever the
// app returns to the foreground, and when the network reconnects — so this is
// just a safety net, not the primary mechanism.
const UPDATE_CHECK_INTERVAL_MS = 60 * 1000 // 60s

const updateSW = registerSW({
  onNeedRefresh() {
    // A new version is waiting to be activated. usePwaAutoUpdate applies it at a
    // safe moment (navigation / foreground, never during the live draft).
    _setNeedRefresh(true)
  },
  onOfflineReady() {
    // App precached and ready to work offline.
    _setOfflineReady(true)
  },
  onRegisteredSW(swUrl, registration) {
    console.log('PWA SW registered')
    if (!registration) return
    // Firebase Messaging SW is registered in the usePushNotifications composable
    // to avoid duplicate registrations that cause token issues on mobile/PWA.

    // Ask the browser to re-fetch the SW script and compare it byte-for-byte.
    // If it changed, the new SW installs into the "waiting" state and
    // onNeedRefresh fires — so the prompt shows within seconds of a deploy
    // instead of whenever the browser happens to re-check on its own (which in a
    // SPA, where navigation is client-side, can take hours or feel random).
    let checking = false
    const checkForUpdate = async () => {
      if (checking || registration.installing) return
      if ('connection' in navigator && !navigator.onLine) return
      checking = true
      try {
        // cache: 'no-store' bypasses the HTTP cache so a freshly deployed SW is
        // always seen even if the host serves sw.js with a long max-age. A 200
        // means it's reachable; registration.update() then does the real compare
        // + install that ultimately triggers onNeedRefresh.
        const resp = await fetch(swUrl, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        })
        if (resp?.status === 200) await registration.update()
      } catch (e) {
        console.warn('SW update check failed:', e)
      } finally {
        checking = false
      }
    }

    // 1) Check straight away (catches a version shipped since the last session).
    checkForUpdate()

    // 2) Backstop poll for long-lived, continuously-open tabs.
    setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)

    // 3) Check the moment the app is brought back to the foreground — the common
    //    case for an installed PWA the user reopens after a deploy.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })

    // 4) Check as soon as connectivity is restored.
    window.addEventListener('online', checkForUpdate)
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  },
})

// Wire the updater so the UI can trigger skipWaiting + reload.
_bindUpdateSW(updateSW)

export const updateServiceWorker = updateSW
