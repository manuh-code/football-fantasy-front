<template>
  <div class="w-full">
    <div
      class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <span
          class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0"
        >
          <v-icon name="hi-solid-sparkles" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </span>
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          {{ $t('billing.subscription.managedInStore.title') }}
        </h2>
      </div>

      <div class="px-5 py-4 space-y-3">
        <p class="text-sm text-gray-700 dark:text-gray-300">{{ whereText }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('billing.subscription.managedInStore.note') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Premium comprado en una tienda, visto desde la web.
 *
 * Existe porque el estado "tiene Premium pero aquí no hay nada que gestionar"
 * no tenía pantalla: `ManageSubscriptionComponent` arranca con
 * `v-if="subscription"` y esa fila es de Stripe, así que con una suscripción
 * de la App Store no pintaba nada — y antes de eso, la vista directamente le
 * ofrecía pagar otra vez a alguien que ya paga.
 *
 * **No ofrece ninguna acción, y es deliberado.** Cancelar o cambiar de plan una
 * suscripción de App Store o Google Play sólo se puede desde su propia tienda;
 * un botón aquí únicamente podría fallar. Lo que sí hace falta es decir dónde
 * está, porque el usuario no tiene por qué recordar en qué dispositivo se
 * suscribió.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSubscriptionStore } from '@/store/billing/useSubscriptionStore'

const { t } = useI18n()
const subscriptionStore = useSubscriptionStore()

/**
 * La tienda decide el texto, y el valor viene de `manage_in` del servidor —
 * no de `source`. Son distintos a propósito: `source` dice quién concede el
 * derecho, `manage_in` dice a dónde mandar al usuario, y sólo el segundo sirve
 * para dar instrucciones que no acaben en una pantalla que no existe.
 */
const whereText = computed(() => {
  const key =
    subscriptionStore.manageIn === 'app_store'
      ? 'billing.subscription.managedInStore.appStore'
      : 'billing.subscription.managedInStore.googlePlay'

  return t(key)
})
</script>
