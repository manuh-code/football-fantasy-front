import { defineStore } from 'pinia'
import { ref } from 'vue'

// Controla la visita guiada (onboarding) por diapositivas. Cada flag marca si el
// usuario ya vio la guía de esa pantalla, de modo que solo se muestre una vez.
export const useOnboardingStore = defineStore(
  'onboarding',
  () => {
    // El usuario ya vio (o saltó) la guía del Home.
    const homeSeen = ref(false)

    // El usuario ya vio (o saltó) la guía de la quiniela.
    const poolSeen = ref(false)

    function markHomeSeen() {
      homeSeen.value = true
    }

    function markPoolSeen() {
      poolSeen.value = true
    }

    // Reinicia las guías para volver a mostrarlas (desde Ajustes → "Ver de nuevo").
    function replay() {
      homeSeen.value = false
      poolSeen.value = false
    }

    return {
      homeSeen,
      poolSeen,
      markHomeSeen,
      markPoolSeen,
      replay,
    }
  },
  {
    persist: true, // persiste en localStorage via pinia-plugin-persistedstate
  }
)
