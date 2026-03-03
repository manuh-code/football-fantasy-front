import { ref } from 'vue'
import { isSupported } from 'firebase/messaging'
import { useNotificationsStore } from '@/store/notifications'

export type CheckStatus = 'ok' | 'error' | 'warning' | 'pending'

export interface DiagnosticCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
}

const isRunning = ref(false)
const checks = ref<DiagnosticCheck[]>([])

export function usePushDiagnostics() {
  const notificationsStore = useNotificationsStore()

  async function runDiagnostics(): Promise<DiagnosticCheck[]> {
    if (isRunning.value) return checks.value
    isRunning.value = true
    checks.value = []

    const results: DiagnosticCheck[] = []

    // 1. HTTPS / localhost
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    results.push({
      id: 'secure_context',
      label: 'Contexto seguro (HTTPS / localhost)',
      status: isSecure ? 'ok' : 'error',
      detail: isSecure
        ? `Protocolo actual: ${location.protocol}`
        : 'Las notificaciones push requieren HTTPS. En producción asegúrate de servir con HTTPS.',
    })

    // 2. Service Workers soportados
    const swSupported = 'serviceWorker' in navigator
    results.push({
      id: 'sw_support',
      label: 'Service Workers soportados',
      status: swSupported ? 'ok' : 'error',
      detail: swSupported
        ? 'El navegador soporta Service Workers.'
        : 'Este navegador no soporta Service Workers. Las notificaciones no funcionarán.',
    })

    // 3. API de Notifications soportada
    const notifSupported = 'Notification' in window
    results.push({
      id: 'notification_api',
      label: 'API Notification soportada',
      status: notifSupported ? 'ok' : 'error',
      detail: notifSupported
        ? 'La API de Notification está disponible.'
        : 'Este navegador no soporta la API de Notification.',
    })

    // 4. Permiso de notificaciones
    if (notifSupported) {
      const permission = Notification.permission
      results.push({
        id: 'notification_permission',
        label: 'Permiso de notificaciones',
        status: permission === 'granted' ? 'ok' : permission === 'denied' ? 'error' : 'warning',
        detail:
          permission === 'granted'
            ? 'Permisos concedidos por el usuario.'
            : permission === 'denied'
              ? 'Permisos BLOQUEADOS. El usuario debe desbloquearlos manualmente desde la configuración del navegador.'
              : 'Permiso aún no solicitado (default). Llama a requestPermissionAndRegister() para pedirlo.',
      })
    }

    // 5. Firebase Messaging soportado
    let firebaseMessagingSupported = false
    try {
      firebaseMessagingSupported = await isSupported()
    } catch {
      firebaseMessagingSupported = false
    }
    results.push({
      id: 'firebase_messaging',
      label: 'Firebase Messaging soportado',
      status: firebaseMessagingSupported ? 'ok' : 'error',
      detail: firebaseMessagingSupported
        ? 'Firebase Messaging está disponible en este navegador.'
        : 'Firebase Messaging NO está soportado (puede ser un navegador sin IndexedDB o en modo privado).',
    })

    // 6. VAPID Key configurada
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    results.push({
      id: 'vapid_key',
      label: 'VAPID Key configurada',
      status: vapidKey ? 'ok' : 'error',
      detail: vapidKey
        ? `VITE_FIREBASE_VAPID_KEY presente (${vapidKey.slice(0, 8)}...).`
        : 'VITE_FIREBASE_VAPID_KEY no está definida en las variables de entorno.',
    })

    // 7. Service Worker de Firebase registrado y activo
    if (swSupported) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        const firebaseSW = registrations.find((r) =>
          r.scope.includes('firebase-cloud-messaging-push-scope')
        )

        if (!firebaseSW) {
          results.push({
            id: 'firebase_sw',
            label: 'Service Worker de Firebase',
            status: 'warning',
            detail: 'El SW de Firebase no está registrado aún. Se registra automáticamente al llamar requestPermissionAndRegister().',
          })
        } else {
          const sw = firebaseSW.active || firebaseSW.installing || firebaseSW.waiting
          const state = firebaseSW.active ? 'activated' : sw?.state ?? 'unknown'
          results.push({
            id: 'firebase_sw',
            label: 'Service Worker de Firebase',
            status: firebaseSW.active ? 'ok' : 'warning',
            detail: `Scope: ${firebaseSW.scope} | Estado: ${state}`,
          })
        }

        // 8. SW de PWA (vite-plugin-pwa)
        const pwaSW = registrations.find(
          (r) => !r.scope.includes('firebase-cloud-messaging-push-scope')
        )
        results.push({
          id: 'pwa_sw',
          label: 'Service Worker de PWA',
          status: pwaSW?.active ? 'ok' : 'warning',
          detail: pwaSW
            ? `Scope: ${pwaSW.scope} | Estado: ${pwaSW.active ? 'activated' : 'pendiente'}`
            : 'SW de PWA no encontrado. Puede que la app no esté instalada o se esté ejecutando en modo dev.',
        })
      } catch (err) {
        results.push({
          id: 'firebase_sw',
          label: 'Service Workers registrados',
          status: 'error',
          detail: `Error al consultar registrations: ${err}`,
        })
      }
    }

    // 9. FCM Token en store
    const storedToken = notificationsStore.fcmToken
    const isRegistered = notificationsStore.isTokenRegistered
    results.push({
      id: 'fcm_token',
      label: 'FCM Token en store',
      status: storedToken && isRegistered ? 'ok' : 'warning',
      detail: storedToken
        ? `Token presente (${storedToken.slice(0, 12)}...) | Registrado en backend: ${isRegistered ? 'sí' : 'no'}`
        : 'No hay token guardado. El usuario aún no ha concedido permiso o no se ha llamado requestPermissionAndRegister().',
    })

    checks.value = results
    isRunning.value = false
    return results
  }

  /** Resumen rápido: true si todos los checks pasan como 'ok' o 'warning' */
  function canReceiveNotifications(): boolean {
    const critical = ['secure_context', 'sw_support', 'notification_api', 'firebase_messaging', 'vapid_key']
    return critical.every((id) => {
      const check = checks.value.find((c) => c.id === id)
      return check?.status === 'ok'
    }) && Notification.permission === 'granted'
  }

  return {
    checks,
    isRunning,
    runDiagnostics,
    canReceiveNotifications,
  }
}
