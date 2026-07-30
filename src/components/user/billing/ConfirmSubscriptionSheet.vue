<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="succeeded ? '' : $t('billing.subscription.confirm.title')"
    :subtitle="succeeded ? '' : $t('billing.subscription.confirm.subtitle')"
    :aria-label="succeeded ? $t('billing.subscription.confirm.success.title') : ''"
    icon="hi-solid-sparkles"
    icon-variant="emerald"
    size="md"
    role="dialog"
    autofocus
    :persistent="isSubmitting || succeeded"
    :dismissible="!isSubmitting && !succeeded"
    @close="emit('close')"
  >
    <div v-if="succeeded" class="py-6 flex flex-col items-center text-center">
      <div class="relative animate-premium-in">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center">
          <v-icon name="hi-solid-sparkles" class="w-8 h-8 text-white" />
        </div>
      </div>
      <h2 class="mt-5 text-lg font-bold text-gray-900 dark:text-white">
        {{ $t('billing.subscription.confirm.success.title') }}
      </h2>
      <p class="mt-1.5 text-sm text-gray-600 dark:text-gray-300 max-w-[20rem]">
        {{ $t('billing.subscription.confirm.success.detail') }}
      </p>
    </div>

    <div v-else class="pb-1">
      <!-- What is being charged, right now, in one line. No per-month maths
           here: this is the number that lands on the statement. -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <div class="flex items-baseline justify-between gap-4 px-4 py-3">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ planLabel }}</span>
          <span class="text-base font-bold text-gray-900 dark:text-white tabular-nums">
            {{ formattedTotal }}
          </span>
        </div>
        <div class="px-4 py-3">
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ renewalNote }}</p>
        </div>
      </div>

      <!-- Which card. Changing it here beats sending the user to another screen
           and losing the flow. -->
      <div class="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
        <CardBrandMark
          v-if="paymentMethod"
          :brand="paymentMethod.brand"
          :type="paymentMethod.type"
          :label="paymentMethodLabel(paymentMethod)"
          size="sm"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ paymentMethod ? paymentMethodLabel(paymentMethod) : $t('billing.subscription.confirm.noCard') }}
          </p>
          <p v-if="paymentMethod" class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('billing.subscription.confirm.chargedTo') }}
          </p>
        </div>
        <button
          v-if="canChangeCard"
          type="button"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1 flex-shrink-0"
          @click="emit('changeCard')"
        >
          {{ $t('billing.subscription.confirm.useAnotherCard') }}
        </button>
      </div>

      <div
        v-if="errorMessage"
        ref="errorRef"
        role="alert"
        class="mt-3 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 px-3.5 py-3"
      >
        <v-icon name="hi-solid-exclamation-circle" class="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
      </div>

      <p class="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {{ $t('billing.subscription.confirm.terms') }}
      </p>
    </div>

    <template #footer>
      <ButtonComponent
        v-if="succeeded"
        type="button"
        variant="primary"
        size="md"
        :text="$t('billing.subscription.confirm.success.done')"
        :always-full-width="true"
        icon="hi-solid-check"
        @click="finish"
      />
      <ButtonComponent
        v-else
        type="button"
        variant="primary"
        size="md"
        :text="isSubmitting ? $t('billing.subscription.confirm.submitting') : submitLabel"
        :loading="isSubmitting"
        :disabled="isSubmitting || !paymentMethod"
        :always-full-width="true"
        icon="hi-solid-lock-closed"
        @click="submit"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import CardBrandMark from '@/components/user/billing/CardBrandMark.vue'
import subscriptionService from '@/services/user/billing/SubscriptionService'
import { loadConfiguredStripe } from '@/composables/useStripePaymentElement'
import { paymentMethodLabel } from '@/utils/paymentMethod'
import { formatMoney } from '@/utils/currency'
import type { PaymentMethodResponse } from '@/interfaces/user/billing/PaymentMethodResponse'
import type { SubscriptionPlanResponse } from '@/interfaces/user/billing/SubscriptionPlanResponse'
import type { SubscriptionStateResponse } from '@/interfaces/user/billing/SubscriptionStateResponse'

const props = defineProps<{
  isVisible: boolean
  plan: SubscriptionPlanResponse | null
  paymentMethod: PaymentMethodResponse | null
  canChangeCard: boolean
}>()

const emit = defineEmits<{
  close: []
  changeCard: []
  // Fired once the user leaves the success panel, carrying the state the API
  // answered so the caller never has to re-fetch. Deliberately not fired the
  // moment the API returns: the caller swaps this sheet out on `is_premium`.
  completed: [state: SubscriptionStateResponse]
}>()

const { t, locale } = useI18n()

const isSubmitting = ref(false)
const succeeded = ref(false)
const errorMessage = ref<string | null>(null)
const errorRef = ref<HTMLElement | null>(null)
const resultState = ref<SubscriptionStateResponse | null>(null)

function finish() {
  if (resultState.value) {
    emit('completed', resultState.value)
  }
}

const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'es-MX'))

const isAnnual = computed(() => props.plan?.interval === 'year')

const formattedTotal = computed(() =>
  props.plan ? formatMoney(props.plan.amount, props.plan.currency, intlLocale.value) : '',
)

const planLabel = computed(() =>
  isAnnual.value
    ? t('billing.subscription.plans.annual.name')
    : t('billing.subscription.plans.monthly.name'),
)

const renewalNote = computed(() =>
  isAnnual.value
    ? t('billing.subscription.confirm.renewsAnnually', { amount: formattedTotal.value })
    : t('billing.subscription.confirm.renewsMonthly', { amount: formattedTotal.value }),
)

// The button carries the amount so the charge is never a surprise one tap later.
const submitLabel = computed(() =>
  t('billing.subscription.confirm.submit', { amount: formattedTotal.value }),
)

async function submit() {
  if (isSubmitting.value || !props.plan) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    let state = await subscriptionService.store(props.plan.id, props.paymentMethod?.id)

    // The bank wants 3DS. The subscription row already exists at this point, so
    // the challenge is finished in place rather than starting over.
    if (state.requires_action && state.payment_intent_client_secret) {
      const confirmed = await confirmAuthentication(state.payment_intent_client_secret)
      if (!confirmed) {
        return
      }
      state = await subscriptionService.show()
    }

    if (!state.is_premium) {
      errorMessage.value = t('billing.subscription.confirm.notActivated')
      await revealError()
      return
    }

    resultState.value = state
    succeeded.value = true
  } catch {
    // The axios interceptor already surfaced the API's own message.
    errorMessage.value = t('billing.subscription.confirm.genericError')
    await revealError()
  } finally {
    isSubmitting.value = false
  }
}

/** Runs the 3DS challenge. False when it failed or was dismissed. */
async function confirmAuthentication(clientSecret: string): Promise<boolean> {
  const stripe = await loadConfiguredStripe()

  if (!stripe) {
    errorMessage.value = t('billing.subscription.confirm.genericError')
    await revealError()
    return false
  }

  const { error } = await stripe.confirmCardPayment(clientSecret)

  if (error) {
    errorMessage.value = error.message ?? t('billing.subscription.confirm.genericError')
    await revealError()
    return false
  }

  return true
}

async function revealError() {
  await nextTick()
  errorRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      succeeded.value = false
      errorMessage.value = null
      isSubmitting.value = false
      resultState.value = null
    }
  },
)
</script>

<style scoped>
.animate-premium-in {
  animation: premium-in 0.45s cubic-bezier(0.22, 1.2, 0.4, 1) both;
}

@keyframes premium-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
