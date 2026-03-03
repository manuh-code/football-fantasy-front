import { ref } from 'vue'
import { getToken, onMessage } from 'firebase/messaging'
import { getFirebaseMessaging } from '@/firebase/config'
import { useApiFantasy } from '@/composables/useApiFantasy'

const fcmToken = ref<string | null>(null)
const isPermissionGranted = ref(false)
const isRegistering = ref(false)

export function usePushNotifications() {
  const { apiFantasyInstance } = useApiFantasy()

  /**
   * Solicita permiso de notificaciones y registra el token en el backend.
   */
  async function requestPermissionAndRegister(): Promise<string | null> {
    if (isRegistering.value) return fcmToken.value
    isRegistering.value = true

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
      const messaging = await getFirebaseMessaging()
      if (!messaging) return null

      // 3. Registrar el Service Worker explícitamente
      const swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/firebase-cloud-messaging-push-scope' }
      )
      await navigator.serviceWorker.ready

      // 4. Obtener FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      })

      if (!token) {
        console.warn('No FCM token received')
        return null
      }

      fcmToken.value = token

      // 5. Enviar token al backend
      await apiFantasyInstance.post('fcm-token', {
        token,
        device_name: 'web',
      })

      console.log('FCM token registered successfully')
      return token
    } catch (error) {
      console.error('Error registering push notifications:', error)
      return null
    } finally {
      isRegistering.value = false
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
   */
  async function unregisterToken(): Promise<void> {
    if (!fcmToken.value) return

    try {
      await apiFantasyInstance.delete('fcm-token', {
        data: { token: fcmToken.value },
      })
      fcmToken.value = null
    } catch (error) {
      console.error('Error removing FCM token:', error)
    }
  }

  return {
    fcmToken,
    isPermissionGranted,
    requestPermissionAndRegister,
    onForegroundMessage,
    unregisterToken,
  }
}