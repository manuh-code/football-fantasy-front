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

      <!-- El formulario de pago lo monta Checkout: dentro salen ya las tarjetas
           guardadas del cliente y los demás métodos activos en el panel, así que
           no hace falta mandar a nadie a otra pantalla a dar de alta una tarjeta
           antes de poder suscribirse. -->
      <div class="mt-3">
        <div v-if="isMounting" class="space-y-2" aria-busy="true">
          <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>

        <div v-show="!isMounting" id="subscription-payment-element" />

        <button
          v-if="mountError"
          type="button"
          class="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1.5 py-1"
          @click="openCheckout"
        >
          <v-icon name="hi-solid-refresh" class="w-4 h-4" />
          {{ $t('common.actions.retry') }}
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
        :disabled="isSubmitting || !isReady"
        :always-full-width="true"
        icon="hi-solid-lock-closed"
        @click="submit"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import subscriptionService from '@/services/user/billing/SubscriptionService'
import { useStripeCheckout } from '@/composables/useStripeCheckout'
import { formatMoney } from '@/utils/currency'
import type { SubscriptionPlanResponse } from '@/interfaces/user/billing/SubscriptionPlanResponse'
import type { SubscriptionStateResponse } from '@/interfaces/user/billing/SubscriptionStateResponse'

const props = defineProps<{
  isVisible: boolean
  plan: SubscriptionPlanResponse | null
}>()

const emit = defineEmits<{
  close: []
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

const { isReady, isMounting, mountError, mount, confirm, destroy } = useStripeCheckout()

// Id de la sesión abierta, para contarle al servidor que el cobro terminó.
const sessionId = ref<string | null>(null)

/**
 * Abre la sesión de pago y monta el formulario.
 *
 * El secreto se le pasa a Stripe como promesa a propósito: así el SDK empieza a
 * cargar su iframe mientras el backend todavía está creando la sesión, en vez de
 * encadenar las dos esperas.
 */
async function openCheckout(): Promise<void> {
  if (!props.plan) {
    return
  }

  errorMessage.value = null

  const opening = subscriptionService.checkout(props.plan.id)
  const secret = opening.then((session) => {
    sessionId.value = session.session_id

    return session.client_secret
  })

  // Sin esto, un fallo al abrir la sesión quedaría como un rechazo sin gestionar.
  secret.catch(() => {})

  const key = await opening.then((session) => session.publishable_key).catch(() => null)

  if (key === null) {
    errorMessage.value = t('billing.subscription.confirm.genericError')
    await revealError()

    return
  }

  await mount(secret, '#subscription-payment-element', key)
}

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
  if (isSubmitting.value || !isReady.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    // Checkout se encarga del cobro y del 3DS. Un rechazo del banco vuelve como
    // mensaje, no como excepción: el usuario puede probar otra tarjeta sin salir.
    const failure = await confirm()

    if (failure) {
      errorMessage.value = failure
      await revealError()

      return
    }

    // La suscripción la crea Stripe; esto sólo adelanta la escritura local para
    // que la app no se quede bloqueada los segundos que tarda el webhook.
    const state = sessionId.value
      ? await subscriptionService.syncCheckout(sessionId.value)
      : await subscriptionService.show()

    if (!state.is_premium) {
      // Pago aceptado pero aún procesando (métodos asíncronos). No es un fallo:
      // el webhook lo activará, así que se dice y no se pide reintentar.
      errorMessage.value = t('billing.subscription.confirm.processing')
      await revealError()

      return
    }

    resultState.value = state
    succeeded.value = true
  } catch {
    // El interceptor de axios ya enseñó el mensaje del API.
    errorMessage.value = t('billing.subscription.confirm.genericError')
    await revealError()
  } finally {
    isSubmitting.value = false
  }
}

async function revealError() {
  await nextTick()
  errorRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

watch(
  () => props.isVisible,
  async (visible) => {
    if (!visible) {
      // Cada apertura estrena sesión de pago, así que el formulario anterior no
      // puede quedarse montado apuntando a un secreto ya consumido.
      destroy()
      sessionId.value = null

      return
    }

    succeeded.value = false
    errorMessage.value = null
    isSubmitting.value = false
    resultState.value = null

    // El elemento se monta sobre un contenedor que tiene que existir y medir:
    // Stripe calcula el ancho del iframe al montarlo.
    await nextTick()
    await openCheckout()
  },
)

onBeforeUnmount(destroy)
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
