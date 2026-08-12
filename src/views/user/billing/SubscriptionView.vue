<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 md:py-8 pb-24 md:pb-8">
    <div class="container mx-auto px-4 max-w-lg">
      <div class="animate-page-enter">
        <!-- Which of the two screens this is depends on server state, so nothing
             is shown until it is known — flashing the pricing page at someone
             who already pays would be the worst possible first frame. -->
        <div v-if="!subscriptionStore.isStateLoaded" class="space-y-4">
          <div class="h-8 w-40 mx-auto rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div class="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>

        <ManageSubscriptionComponent v-else-if="subscriptionStore.isPremium" />

        <SubscriptionPlansComponent v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubscriptionPlansComponent from '@/components/user/billing/SubscriptionPlansComponent.vue'
import ManageSubscriptionComponent from '@/components/user/billing/ManageSubscriptionComponent.vue'
import { useSubscriptionStore } from '@/store/billing/useSubscriptionStore'
import { preloadStripe } from '@/composables/useStripePaymentElement'
import subscriptionService from '@/services/user/billing/SubscriptionService'

document.title = 'Premium - Football Fantasy'

const subscriptionStore = useSubscriptionStore()
const route = useRoute()
const router = useRouter()

// Subscribing opens the payment sheet one tap from here, so Stripe.js is
// fetched now rather than while the user waits on a skeleton.
preloadStripe()

/**
 * Vuelta de un pago que obligó a salir de la app.
 *
 * Los pagos con tarjeta se resuelven dentro de la hoja (`redirect: if_required`)
 * y no pasan por aquí. Los que sí salen —transferencia, OXXO— vuelven a esta
 * ruta con el id de la sesión, y sin esto el usuario aterrizaría en la página de
 * precios como si no hubiera pagado nada.
 */
async function settleReturnedCheckout(): Promise<boolean> {
  const sessionId = route.query.checkout_session_id

  if (typeof sessionId !== 'string' || !sessionId) {
    return false
  }

  // Fuera de la URL antes de nada: recargar la página no debe volver a
  // dispararlo, y el id no tiene por qué quedarse en el historial.
  await router.replace({ query: {} })

  try {
    // `applyState` refresca también lo desbloqueado.
    subscriptionStore.applyState(await subscriptionService.syncCheckout(sessionId))

    return true
  } catch {
    // El interceptor ya avisó. Se sigue con la carga normal, que dirá la verdad
    // sobre el estado aunque el webhook aún no haya llegado.
    return false
  }
}

onMounted(async () => {
  const settled = await settleReturnedCheckout()

  // The manage screen reads plan amounts out of the catalog, so both are needed
  // whichever branch renders.
  await Promise.all([
    settled ? Promise.resolve() : subscriptionStore.fetchState().catch(() => {}),
    subscriptionStore.fetchPlans().catch(() => {}),
  ])
})
</script>
