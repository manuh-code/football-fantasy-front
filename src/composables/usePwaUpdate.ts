import { ref } from 'vue'

/**
 * Reactive bridge between the service-worker registration (registerServiceWorker.ts)
 * and the auto-update controller (usePwaAutoUpdate.ts).
 *
 * Uses module-level singleton refs — the same pattern as usePushNotifications.ts —
 * so it works even though registerServiceWorker.ts is imported in main.ts BEFORE
 * Pinia is installed. The SW lifecycle callbacks fire asynchronously (after mount),
 * so by the time they update these refs the app is already reactive.
 */

const needRefresh = ref(false)
const offlineReady = ref(false)

// Bound by registerServiceWorker.ts. Calling updateSW(true) activates the waiting
// service worker (skipWaiting) and reloads the page with the new version.
let updateSWFn: ((reloadPage?: boolean) => Promise<void>) | null = null

/** Internal — called by registerServiceWorker.ts to wire up the updater. */
export function _bindUpdateSW(fn: (reloadPage?: boolean) => Promise<void>): void {
  updateSWFn = fn
}

/** Internal — a new version is waiting to be activated. */
export function _setNeedRefresh(value: boolean): void {
  needRefresh.value = value
}

/** Internal — the app has been precached and is ready to work offline. */
export function _setOfflineReady(value: boolean): void {
  offlineReady.value = value
}

export function usePwaUpdate() {
  /** Apply the pending update: activates the new SW and reloads the page. */
  async function applyUpdate(): Promise<void> {
    needRefresh.value = false
    await updateSWFn?.(true)
  }

  /** Dismiss the update prompt; it will reappear on the next load. */
  function dismiss(): void {
    needRefresh.value = false
  }

  /** Acknowledge the offline-ready toast so it is not shown again. */
  function clearOfflineReady(): void {
    offlineReady.value = false
  }

  return {
    needRefresh,
    offlineReady,
    applyUpdate,
    dismiss,
    clearOfflineReady,
  }
}
