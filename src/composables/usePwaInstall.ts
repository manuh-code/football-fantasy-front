import { ref, computed } from 'vue'

/**
 * PWA install flow (singleton).
 *
 * Captures the browser's `beforeinstallprompt` event (Android/desktop Chromium)
 * so we can show our own install UI, and provides iOS-specific detection since
 * Safari/iOS does not support programmatic install — there we show manual
 * "Add to Home Screen" instructions instead.
 *
 * Window listeners are attached at module load (on first import) because
 * `beforeinstallprompt` can fire before the Vue app finishes mounting.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

const SNOOZE_KEY = 'pwa-install-snoozed-until'
const SNOOZE_DAYS = 7

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const canInstall = ref(false)
const isInstalled = ref(false)
const isSnoozed = ref(false)

// --- Environment detection (evaluated once) ---
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIOS =
  /iphone|ipad|ipod/i.test(ua) ||
  // iPadOS 13+ reports as Mac but is touch-capable
  (/macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)
const isIOSSafari = isIOS && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari legacy flag
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

const isStandalone = ref(detectStandalone())

function readSnoozed(): boolean {
  try {
    const until = localStorage.getItem(SNOOZE_KEY)
    return !!until && Date.now() < Number(until)
  } catch {
    return false
  }
}
isSnoozed.value = readSnoozed()

// --- Attach window listeners once (module side-effect) ---
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    canInstall.value = false
    isInstalled.value = true
    isStandalone.value = true
  })

  // Keep standalone state in sync if the display mode changes at runtime.
  window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', (e) => {
    isStandalone.value = e.matches
  })
}

export function usePwaInstall() {
  /**
   * Whether to surface our install banner: not already installed/standalone,
   * not snoozed, and either a native prompt is available (Android/desktop) or
   * we're on iOS Safari (manual instructions).
   */
  const shouldShowBanner = computed(
    () =>
      !isStandalone.value &&
      !isInstalled.value &&
      !isSnoozed.value &&
      (canInstall.value || isIOSSafari),
  )

  /** Trigger the native install prompt (Android/desktop). */
  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredPrompt.value) return 'unavailable'
    await deferredPrompt.value.prompt()
    const choice = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    canInstall.value = false
    if (choice.outcome === 'dismissed') snooze()
    return choice.outcome
  }

  /** Hide the banner for SNOOZE_DAYS days. */
  function snooze(): void {
    try {
      const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(SNOOZE_KEY, String(until))
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    isSnoozed.value = true
  }

  return {
    canInstall,
    isInstalled,
    isStandalone,
    isIOS,
    isIOSSafari,
    shouldShowBanner,
    promptInstall,
    snooze,
  }
}
