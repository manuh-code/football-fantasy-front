import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import subscriptionService from '@/services/user/billing/SubscriptionService'
import { usePremiumStore } from '@/store/billing/usePremiumStore'
import { rememberPublishableKey } from '@/composables/useStripePaymentElement'
import type { SubscriptionPlanResponse } from '@/interfaces/user/billing/SubscriptionPlanResponse'
import type {
  SubscriptionResponse,
  SubscriptionStateResponse,
} from '@/interfaces/user/billing/SubscriptionStateResponse'

/**
 * Premium subscription state, held app-wide so any screen can ask "is this user
 * premium?" without another round trip.
 *
 * Deliberately NOT persisted: entitlement is the server's call, and a stale
 * `true` in localStorage would hand out Premium the API is not backing.
 */
export const useSubscriptionStore = defineStore('subscription', () => {
  const plans = ref<SubscriptionPlanResponse[]>([])
  const subscription = ref<SubscriptionResponse | null>(null)
  const isPremium = ref(false)

  const isLoadingPlans = ref(false)
  const isLoadingState = ref(false)
  // Set once the state has been read, so a screen can tell "not premium" apart
  // from "not asked yet".
  const isStateLoaded = ref(false)

  const monthlyPlan = computed(() => plans.value.find((plan) => plan.interval === 'month') ?? null)
  const annualPlan = computed(() => plans.value.find((plan) => plan.interval === 'year') ?? null)

  const currentPlan = computed(() => {
    if (!subscription.value) {
      return null
    }
    return plans.value.find((plan) => plan.id === subscription.value?.price) ?? null
  })

  /** Cancelled but still inside the paid period — Premium is live, renewal is not. */
  const isOnGracePeriod = computed(() => subscription.value?.on_grace_period === true)

  /** Stripe could not collect: the app should ask for a different card. */
  const isPastDue = computed(() => subscription.value?.is_past_due === true)

  function applyState(state: SubscriptionStateResponse): void {
    isPremium.value = state.is_premium
    subscription.value = state.subscription
    isStateLoaded.value = true
    // Suscribirse, cambiar de plan, cancelar o reanudar cambian lo que el
    // usuario tiene desbloqueado. Se refresca aquí, que es el único punto por
    // el que pasan los cuatro, en vez de recordarlo en cada pantalla.
    void usePremiumStore().fetch(true)
    // Keeps 3DS on the account that actually issued the payment intent, even
    // when this session never went through the add-card flow.
    rememberPublishableKey(state.publishable_key)
  }

  async function fetchPlans(force = false): Promise<void> {
    if (plans.value.length && !force) {
      return
    }

    isLoadingPlans.value = true
    try {
      plans.value = await subscriptionService.plans()
    } finally {
      isLoadingPlans.value = false
    }
  }

  async function fetchState(): Promise<void> {
    isLoadingState.value = true
    try {
      applyState(await subscriptionService.show())
    } finally {
      isLoadingState.value = false
    }
  }

  function reset(): void {
    plans.value = []
    subscription.value = null
    isPremium.value = false
    isStateLoaded.value = false
  }

  return {
    plans,
    subscription,
    isPremium,
    isLoadingPlans,
    isLoadingState,
    isStateLoaded,
    monthlyPlan,
    annualPlan,
    currentPlan,
    isOnGracePeriod,
    isPastDue,
    applyState,
    fetchPlans,
    fetchState,
    reset,
  }
})
