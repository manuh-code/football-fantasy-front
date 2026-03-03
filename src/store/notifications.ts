import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore(
  'notifications',
  () => {
    // FCM token registrado y confirmado por el backend
    const fcmToken = ref<string | null>(null)

    // Indica que el token ya fue enviado al backend exitosamente
    const isTokenRegistered = ref(false)

    function setToken(token: string) {
      fcmToken.value = token
      isTokenRegistered.value = true
    }

    function clearToken() {
      fcmToken.value = null
      isTokenRegistered.value = false
    }

    return {
      fcmToken,
      isTokenRegistered,
      setToken,
      clearToken,
    }
  },
  {
    persist: true, // persiste en localStorage via pinia-plugin-persistedstate
  }
)
