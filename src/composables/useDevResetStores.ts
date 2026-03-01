import { getActivePinia, type Pinia, type Store } from 'pinia';
import { useToast } from '@/composables/useToast';

/**
 * Development utility to reset all Pinia stores and clear persisted data.
 * Useful when backend database is wiped and frontend holds stale cached state.
 *
 * Usage: call `useDevResetStores()` in App.vue — it registers Ctrl+Shift+R
 * keyboard shortcut (dev mode only) to nuke all stores + localStorage.
 */
export function useDevResetStores() {
  const { success } = useToast();

  /**
   * Resets all active Pinia stores to their initial state
   * and removes persisted data from localStorage.
   */
  function resetAllStores() {
    const pinia = getActivePinia() as Pinia & { _s: Map<string, Store> };

    if (!pinia) {
      console.warn('[DevReset] No active Pinia instance found');
      return;
    }

    // 1. Reset each registered store via $reset (Options API) or $patch
    pinia._s.forEach((store, id) => {
      try {
        store.$reset();
        console.log(`[DevReset] Store "${id}" reset via $reset()`);
      } catch {
        // Setup stores don't support $reset — clear state manually
        const keys = Object.keys(store.$state);
        const emptyState: Record<string, null> = {};
        keys.forEach((key) => { emptyState[key] = null; });
        store.$patch(emptyState);
        console.log(`[DevReset] Store "${id}" reset via $patch(null)`);
      }
    });

    // 2. Clear all pinia-persisted keys from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`[DevReset] Cleared ${keysToRemove.length} localStorage keys`);

    success('All stores & cache cleared');
  }

  /**
   * Registers Ctrl+Shift+K shortcut (dev mode only).
   * Returns the cleanup function to remove the listener.
   */
  function registerDevShortcut(): () => void {
    const handler = (e: KeyboardEvent) => {
      // Ctrl + Shift + K  (K = "Kill stores")
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        resetAllStores();
      }
    };

    globalThis.addEventListener('keydown', handler);
    console.log('[DevReset] Shortcut registered: Ctrl+Shift+K to reset all stores');

    return () => globalThis.removeEventListener('keydown', handler);
  }

  return {
    resetAllStores,
    registerDevShortcut,
  };
}
