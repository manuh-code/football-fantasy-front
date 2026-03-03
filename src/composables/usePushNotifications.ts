import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/firebase/config'
import { useApiFantasy } from '@/composables/useApiFantasy'
import { getDeviceUuid } from '@/utils/deviceUuid'
import { useNotificationsStore } from '@/store/notifications'

const isPermissionGranted = ref(false)
const isRegistering = ref(false)

export function usePushNotifications() {
  const { apiFantasyInstance } = useApiFantasy()
  const notificationsStore = useNotificationsStore()
  const { fcmToken } = storeToRefs(notificationsStore)

  /**
   * Solicita permiso de notificaciones y registra el token en el backend.
   * Funciona tanto para usuarios anónimos como autenticados.
   */
  async function requestPermissionAndRegister(): Promise<string | null> {

    if (isRegistering.value) return notificationsStore.fcmToken
    isRegistering.value = true

    // Si ya existe un token registrado en el store, evitar llamar al backend de nuevo
    if (notificationsStore.isTokenRegistered && notificationsStore.fcmToken) {
      isPermissionGranted.value = true
      isRegistering.value = false
      return notificationsStore.fcmToken
    }

    try {
      // 1. Verificar que la API de Notification está disponible
      //    En algunos navegadores móviles (Safari iOS PWA) puede no existir
      if (!('Notification' in globalThis)) {
        console.warn('Notification API not available in this browser/context')
        return null
      }

      // 2. Solicitar permiso al usuario
      let permission: NotificationPermission
      try {
        permission = await Notification.requestPermission()
      } catch {
        // Fallback: algunos navegadores no soportan la versión Promise
        permission = Notification.permission
      }

      console.log('Notification permission:', permission)

      if (permission !== 'granted') {
        console.warn('Push notification permission denied')
        isPermissionGranted.value = false
        return null
      }

      isPermissionGranted.value = true

      // 3. Obtener instancia de Firebase Messaging
      const messaging = await getFirebaseMessaging()

      if (!messaging) {
        console.error('Firebase Messaging is not available')
        return null
      }

      // 4. Registrar el Service Worker de Firebase explícitamente
      //    Reutiliza el registro existente si ya fue registrado por el PWA SW
      let swRegistration: ServiceWorkerRegistration
      try {
        swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/firebase-cloud-messaging-push-scope' }
        )
      } catch (swError) {
        console.error('Failed to register Firebase SW:', swError)
        return null
      }

      console.log('Service Worker registration successful with scope:', swRegistration.scope)

      // Wait for the specific registration to be active with a timeout
      // to prevent hanging forever on mobile devices
      await new Promise<void>((resolve) => {
        if (swRegistration.active) {
          resolve()
          return
        }

        const sw = swRegistration.installing || swRegistration.waiting
        if (sw) {
          const onStateChange = () => {
            if (sw.state === 'activated') {
              sw.removeEventListener('statechange', onStateChange)
              resolve()
            }
          }
          sw.addEventListener('statechange', onStateChange)
        } else {
          resolve()
        }

        // Safety timeout: don't wait more than 10 seconds
        setTimeout(() => resolve(), 10_000)
      })

      console.log('Service Worker active for push notifications')

      // 5. Obtener FCM token
      let token: string | undefined
      try {
        token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        })
      } catch (tokenError) {
        console.error('getToken() failed:', tokenError)
        return null
      }

      if (!token) {
        console.warn('No FCM token received')
        return null
      }

      // 6. Enviar token al backend solo si cambió respecto al token guardado
      if (token === notificationsStore.fcmToken) {
        console.log('FCM token unchanged, skipping backend registration')
      } else {
        await apiFantasyInstance.post('fcm-token', {
          token,
          device_uuid: getDeviceUuid(),
          device_name: 'web',
        })
        notificationsStore.setToken(token)
        console.log('FCM token registered successfully')
      }

      return token
    } catch (error) {
      console.error('Error registering push notifications:', error)
      return null
    } finally {
      isRegistering.value = false
    }
  }

  /**
   * Vincula los tokens del dispositivo al usuario tras el login.
   * Llama al endpoint autenticado /user/fcm-token/claim.
   */
  async function claimTokensForUser(): Promise<void> {
    try {
      await apiFantasyInstance.post('user/fcm-token/claim', {
        device_uuid: getDeviceUuid(),
      })
      console.log('FCM tokens claimed for authenticated user')
    } catch (error) {
      console.error('Error claiming FCM tokens:', error)
    }
  }

  /**
   * Escucha mensajes push cuando la app está en primer plano (foreground).
   */
  async function onForegroundMessage(callback: (payload: any) => void) {
    const messaging = await getFirebaseMessaging()
    if (!messaging) return

    onMessage(messaging, (payload) => {
      console.log('Foreground push message received:', payload)
      callback(payload)
    })
  }

  /**
   * Elimina el token del backend (para logout).
   * NO elimina el device_uuid — el dispositivo puede recibir notificaciones anónimas.
   */
  async function unregisterToken(): Promise<void> {
    if (!notificationsStore.fcmToken) return

    try {
      await apiFantasyInstance.delete('fcm-token', {
        data: {
          token: notificationsStore.fcmToken,
          device_uuid: getDeviceUuid(),
        },
      })
      notificationsStore.clearToken()
    } catch (error) {
      console.error('Error removing FCM token:', error)
    }
  }

  return {
    fcmToken,
    isPermissionGranted,
    requestPermissionAndRegister,
    claimTokensForUser,
    onForegroundMessage,
    unregisterToken,
  }
}