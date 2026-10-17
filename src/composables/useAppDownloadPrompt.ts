import { ref, computed } from 'vue'
import { detectMobilePlatform, isStandaloneWebApp, type MobilePlatform } from '@/utils/joinLink'

/**
 * Invita a quien entra al portal desde un teléfono a cambiarse a la app nativa
 * (mejor experiencia que la web/PWA). Solo aplica en iOS/Android: en
 * escritorio no hay tienda a la que mandar. Singleton como `usePwaInstall`,
 * mismo patrón de descarte con localStorage.
 */

const DISMISS_KEY = 'app-download-dismissed-until'
const SNOOZE_DAYS = 14

const platform = ref<MobilePlatform>(detectMobilePlatform())
const isStandalone = ref(isStandaloneWebApp())

function readDismissed(): boolean {
  try {
    const until = localStorage.getItem(DISMISS_KEY)
    return !!until && Date.now() < Number(until)
  } catch {
    return false
  }
}

const isDismissed = ref(readDismissed())

export function useAppDownloadPrompt() {
  /** Solo en iOS/Android, fuera de la PWA instalada, y no descartado recientemente. */
  const shouldShow = computed(
    () => platform.value !== null && !isStandalone.value && !isDismissed.value,
  )

  /** Oculta el banner por SNOOZE_DAYS días (al cerrarlo o al tocar la ficha de la tienda). */
  function dismiss(): void {
    try {
      const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
      localStorage.setItem(DISMISS_KEY, String(until))
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
    isDismissed.value = true
  }

  return {
    platform,
    shouldShow,
    dismiss,
  }
}
