import { ref } from 'vue'
import { detectMobilePlatform, type MobilePlatform } from '@/utils/joinLink'

/**
 * Qué ficha de tienda mostrarle a quien entra al portal (`AppDownloadBanner`,
 * siempre visible — sin estado de descarte: no es un aviso que se cierra).
 * En escritorio (`platform === null`) se mandan las dos.
 */
export function useAppDownloadPrompt() {
  const platform = ref<MobilePlatform>(detectMobilePlatform())

  return { platform }
}
