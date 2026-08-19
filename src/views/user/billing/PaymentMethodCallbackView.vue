<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <div class="animate-page-enter flex flex-col items-center text-center gap-4">
      <div class="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
        <v-icon name="pr-spinner" animation="spin" class="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p class="text-base font-semibold text-gray-900 dark:text-white">
          {{ $t('billing.paymentMethods.callback.verifying') }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('billing.paymentMethods.callback.wait') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import paymentMethodService from '@/services/user/billing/PaymentMethodService'
import { consumePendingDefault } from '@/utils/paymentMethod'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

document.title = 'Payment Methods - Pro Fantasy'

/**
 * Landing spot for Stripe's `return_url`. When a card requires 3DS, Stripe takes
 * over the tab and comes back here with `?setup_intent=seti_...`. Without this
 * step the card would be stored in Stripe but never registered against the user
 * — the classic silent failure of this flow.
 */
onMounted(async () => {
  const setupIntent = typeof route.query.setup_intent === 'string' ? route.query.setup_intent : null
  const redirectStatus = typeof route.query.redirect_status === 'string' ? route.query.redirect_status : null
  const makeDefault = consumePendingDefault()

  if (!setupIntent || redirectStatus === 'failed') {
    if (setupIntent || redirectStatus) {
      toast.error(
        t('billing.paymentMethods.callback.failed.title'),
        t('billing.paymentMethods.callback.failed.message'),
      )
    }
    await router.replace({ name: 'payment-methods' })
    return
  }

  try {
    await paymentMethodService.store(setupIntent, makeDefault)
    // The list shows the success toast so it is not lost across the navigation.
    await router.replace({ name: 'payment-methods', query: { saved: '1' } })
  } catch {
    // The interceptor already reported the API error (e.g. a 422 for an intent
    // the bank never authorized).
    await router.replace({ name: 'payment-methods' })
  }
})
</script>
