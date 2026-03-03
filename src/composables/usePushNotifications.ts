import { ref, computed } from 'vue'
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
      return notificationsStore.fcmToken
    }

    try {
      // 1. Solicitar permiso al usuario
      const permission = await Notification.requestPermission()


      if (permission !== 'granted') {
        console.warn('Push notification permission denied')
        isPermissionGranted.value = false
        return null
      }

      isPermissionGranted.value = true

      // 2. Obtener instancia de Firebase Messaging
      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        console.error('Firebase Messaging is not available')
        return null
      }

      // 3. Registrar el Service Worker explícitamente
      const swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/firebase-cloud-messaging-push-scope' }
      )
      console.log('Service Worker registration successful with scope:', swRegistration.scope)

      // Wait for the specific registration to be active (not navigator.serviceWorker.ready,
      // which waits for the SW controlling the current page — a different scope)
      await new Promise<void>((resolve) => {
        if (swRegistration.active) {
          resolve()
          return
        }
        const sw = swRegistration.installing || swRegistration.waiting
        if (sw) {
          sw.addEventListener('statechange', () => {
            if (sw.state === 'activated') resolve()
          })
        } else {
          resolve()
        }
      })

      console.log('Service Worker registered for push notifications')

      // 4. Obtener FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      })

      if (!token) {
        console.warn('No FCM token received')
        return null
      }

      // 5. Enviar token al backend solo si cambió respecto al token guardado
      if (token !== notificationsStore.fcmToken) {
        await apiFantasyInstance.post('fcm-token', {
          token,
          device_uuid: getDeviceUuid(),
          device_name: 'web',
        })
        notificationsStore.setToken(token)
        console.log('FCM token registered successfully')
      } else {
        console.log('FCM token unchanged, skipping backend registration')
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