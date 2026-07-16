import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePwaUpdate } from '@/composables/usePwaUpdate'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

/**
 * Controlador headless de auto-actualización de la PWA.
 *
 * Estrategia "invisible y segura": con registerType: 'prompt' el service worker
 * nuevo queda en estado waiting y aquí decidimos CUÁNDO aplicarlo, en vez de
 * mostrar un modal que los usuarios no ven. La actualización se aplica sola en un
 * momento seguro — al navegar o al volver la app al foreground — y NUNCA durante
 * el draft en vivo, precedida por un toast breve "Actualizando…".
 *
 * Mantener el SW en waiting hasta ese instante deja intactos los caches viejos, así
 * que una pestaña abierta con la versión anterior nunca se queda sin sus chunks.
 *
 * Se invoca una sola vez desde App.vue (setup, con el Router disponible).
 */

// Rutas donde una recarga sería disruptiva; la actualización se pospone hasta salir.
const CRITICAL_ROUTE_NAMES = new Set(['playersToDraft'])

// Margen para que el toast alcance a pintarse antes de recargar.
const APPLY_DELAY_MS = 1000

// Guard de instalación única (protege ante HMR / llamadas repetidas).
let installed = false

export function usePwaAutoUpdate(): void {
  const { needRefresh, applyUpdate, offlineReady, clearOfflineReady } = usePwaUpdate()
  const toast = useToast()
  const { t } = useI18n()

  if (installed) return
  installed = true

  const router = useRouter()

  // Toast único cuando la app queda cacheada para uso offline por primera vez.
  watch(offlineReady, (ready) => {
    if (ready) {
      toast.success(t('pwa.update.offlineTitle'), t('pwa.update.offlineMessage'))
      clearOfflineReady()
    }
  })

  let reloading = false

  const isSafeToReload = (routeName: unknown): boolean => {
    if (!needRefresh.value || reloading) return false
    // Solo con la pestaña visible: evita recargar en segundo plano.
    if (document.visibilityState !== 'visible') return false
    if (typeof routeName === 'string' && CRITICAL_ROUTE_NAMES.has(routeName)) return false
    return true
  }

  const maybeApply = async (routeName: unknown): Promise<void> => {
    if (!isSafeToReload(routeName)) return
    reloading = true
    // Aviso breve para que la recarga no se sienta inesperada.
    toast.info(t('pwa.update.applyingTitle'), t('pwa.update.applyingMessage'))
    await new Promise((resolve) => setTimeout(resolve, APPLY_DELAY_MS))
    // skipWaiting + reload a la versión nueva.
    await applyUpdate()
  }

  // Disparador 1: al terminar una navegación (el usuario cambió de pantalla).
  router.afterEach((to) => {
    void maybeApply(to.name)
  })

  // Disparador 2: al volver la app al foreground (PWA reabierta tras un deploy).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void maybeApply(router.currentRoute.value.name)
    }
  })
}
