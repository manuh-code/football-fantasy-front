<template>
  <div class="w-full">
    <!-- Loading -->
    <div v-if="isLoading" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
      <div class="mt-8 flex flex-col items-center gap-3">
        <div class="h-14 w-40 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        <div class="h-3 w-28 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
      <div class="mt-8 space-y-3">
        <div v-for="index in 4" :key="index" class="h-4 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </div>

    <!-- Load error -->
    <div
      v-else-if="loadFailed"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-10 flex flex-col items-center text-center gap-3"
    >
      <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6 text-red-500" />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('billing.subscription.loadError') }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-2 py-1"
        @click="load"
      >
        <v-icon name="hi-solid-refresh" class="w-4 h-4" />
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <template v-else>
      <!-- Headline -->
      <header class="text-center px-2 mb-6">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider"
        >
          <v-icon name="hi-solid-sparkles" class="w-3 h-3" />
          {{ $t('billing.subscription.badge') }}
        </span>
        <h1 class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          {{ $t('billing.subscription.headline') }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-[22rem] mx-auto leading-relaxed">
          {{ $t('billing.subscription.subheadline') }}
        </p>
      </header>

      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-5">
          <!-- Segmented selector. Two competing pricing cards make the reader do
               the comparison; one control with one price makes the app do it. -->
          <div
            class="relative grid grid-cols-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-900/60"
            role="radiogroup"
            :aria-label="$t('billing.subscription.selectorLabel')"
          >
            <div
              class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-transform duration-300 ease-out"
              :style="{ transform: isAnnual ? 'translateX(100%)' : 'translateX(0)' }"
              aria-hidden="true"
            />
            <button
              v-for="option in options"
              :key="option.plan.id"
              type="button"
              role="radio"
              :aria-checked="option.plan.id === selectedPlanId"
              class="relative z-10 flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              :class="
                option.plan.id === selectedPlanId
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              "
              @click="selectedPlanId = option.plan.id"
            >
              {{ option.label }}
              <span
                v-if="option.plan.savings_percent"
                class="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold tabular-nums"
              >
                −{{ option.plan.savings_percent }}%
              </span>
            </button>
          </div>

          <!-- The price. Counts between plans so the saving is something you
               watch happen rather than something you work out. -->
          <div class="mt-7 text-center">
            <div class="flex items-start justify-center gap-1">
              <span class="mt-2.5 text-2xl font-semibold text-gray-400 dark:text-gray-500">
                {{ symbol }}
              </span>
              <span
                class="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none"
              >{{ displayAmount }}</span>
            </div>
            <p class="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ selectedPlan?.currency }} {{ $t('billing.subscription.perMonth') }}
            </p>
            <p class="mt-3 text-sm text-gray-700 dark:text-gray-300">{{ billingNote }}</p>
          </div>
        </div>

        <!-- What you get -->
        <div class="px-5 pb-5 pt-1">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            {{ $t('billing.subscription.includes') }}
          </p>
          <ul class="space-y-2.5">
            <li v-for="feature in features" :key="feature" class="flex items-start gap-2.5">
              <v-icon
                name="hi-solid-check"
                class="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300 leading-snug">{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- The button names the charge, not the per-month comparison above it. -->
        <div class="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-700">
          <ButtonComponent
            variant="primary"
            size="lg"
            :text="ctaLabel"
            :always-full-width="true"
            :disabled="!selectedPlan"
            icon="hi-solid-sparkles"
            @click="startCheckout"
          />
          <p class="mt-2.5 text-center text-xs text-gray-500 dark:text-gray-400">
            {{ $t('billing.subscription.cancelAnytime') }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex items-start gap-2 px-1 text-xs text-gray-500 dark:text-gray-400">
        <v-icon name="hi-solid-lock-closed" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>{{ $t('billing.paymentMethods.secureNote') }}</p>
      </div>
    </template>

    <ConfirmSubscriptionSheet
      :is-visible="isConfirmOpen"
      :plan="selectedPlan"
      @close="isConfirmOpen = false"
      @completed="handleCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonComponent } from '@/components/ui'
import ConfirmSubscriptionSheet from '@/components/user/billing/ConfirmSubscriptionSheet.vue'
import { useSubscriptionStore } from '@/store/billing/useSubscriptionStore'
import { currencySymbol, formatMoney } from '@/utils/currency'
import type { SubscriptionStateResponse } from '@/interfaces/user/billing/SubscriptionStateResponse'

const emit = defineEmits<{
  subscribed: [state: SubscriptionStateResponse]
}>()

const { t, locale, tm, rt } = useI18n()
const subscriptionStore = useSubscriptionStore()

const selectedPlanId = ref<string | null>(null)
const isLoading = ref(true)
const loadFailed = ref(false)
const isConfirmOpen = ref(false)

const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'es-MX'))

const selectedPlan = computed(
  () => subscriptionStore.plans.find((plan) => plan.id === selectedPlanId.value) ?? null,
)

const isAnnual = computed(() => selectedPlan.value?.interval === 'year')

const options = computed(() =>
  subscriptionStore.plans
    .filter((plan) => plan.interval === 'month' || plan.interval === 'year')
    .map((plan) => ({
      plan,
      label:
        plan.interval === 'year'
          ? t('billing.subscription.plans.annual.name')
          : t('billing.subscription.plans.monthly.name'),
    })),
)

const symbol = computed(() =>
  selectedPlan.value ? currencySymbol(selectedPlan.value.currency, intlLocale.value) : '',
)

// The headline figure is always a per-month number so the two plans are
// directly comparable; the annual total is spelled out underneath.
const targetAmount = computed(
  () => selectedPlan.value?.amount_per_month ?? selectedPlan.value?.amount ?? 0,
)

const billingNote = computed(() => {
  const plan = selectedPlan.value
  if (!plan) {
    return ''
  }

  const total = formatMoney(plan.amount, plan.currency, intlLocale.value)

  return plan.interval === 'year'
    ? t('billing.subscription.billedAnnually', { amount: total })
    : t('billing.subscription.billedMonthly')
})

const ctaLabel = computed(() => {
  const plan = selectedPlan.value
  if (!plan) {
    return t('billing.subscription.cta.default')
  }

  return t('billing.subscription.cta.subscribe', {
    amount: formatMoney(plan.amount, plan.currency, intlLocale.value),
  })
})

// `tm` hands back raw messages for the active locale; `rt` resolves each leaf
// to a plain string, which is how the rest of the app reads i18n arrays.
const features = computed(() => {
  const list = tm('billing.subscription.features') as unknown[]

  return Array.isArray(list) ? list.map((entry) => rt(entry as never)) : []
})

/* ------------------------------------------------------------------ *
 * Animated price
 * ------------------------------------------------------------------ */

const displayValue = ref(0)
let frame: number | null = null

const prefersReducedMotion =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

const displayAmount = computed(() => {
  const plan = selectedPlan.value
  if (!plan) {
    return '0'
  }

  // The decimal count is pinned to the destination for the whole run, so the
  // digits never reflow mid-animation.
  const decimals = Math.round(targetAmount.value * 100) % 100 === 0 ? 0 : 2

  return new Intl.NumberFormat(intlLocale.value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue.value)
})

function animateTo(target: number): void {
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }

  if (prefersReducedMotion) {
    displayValue.value = target
    return
  }

  const from = displayValue.value
  const delta = target - from
  const duration = 420
  const startedAt = performance.now()

  const step = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    // easeOutCubic: quick to read, settles without overshoot.
    displayValue.value = from + delta * (1 - Math.pow(1 - progress, 3))

    if (progress < 1) {
      frame = requestAnimationFrame(step)
      return
    }

    displayValue.value = target
    frame = null
  }

  frame = requestAnimationFrame(step)
}

watch(targetAmount, (amount) => animateTo(amount))

/* ------------------------------------------------------------------ *
 * Flow
 * ------------------------------------------------------------------ */

async function load() {
  isLoading.value = true
  loadFailed.value = false

  try {
    // Sólo los planes: el método de pago lo pide la propia sesión de Checkout,
    // así que esta pantalla ya no necesita saber qué tarjetas hay guardadas.
    await subscriptionStore.fetchPlans(true)

    // Annual leads: it is the better deal, and defaulting to it frames the
    // monthly price as the trade-off rather than the other way round.
    const annual = subscriptionStore.plans.find((plan) => plan.interval === 'year')
    selectedPlanId.value = annual?.id ?? subscriptionStore.plans[0]?.id ?? null
    displayValue.value = targetAmount.value
  } catch {
    loadFailed.value = true
  } finally {
    isLoading.value = false
  }
}

async function startCheckout() {
  if (!selectedPlan.value) {
    return
  }

  // Ya no hace falta tener tarjeta guardada antes de llegar aquí: la sesión de
  // Checkout pide el método de pago dentro de la propia hoja, y las tarjetas ya
  // guardadas del cliente le aparecen ahí como opción.
  isConfirmOpen.value = true
}

/**
 * Runs when the user closes the success panel, not when the API answers:
 * applying the state any earlier flips the parent over to the manage screen and
 * tears the confirmation sheet down mid-celebration.
 */
function handleCompleted(state: SubscriptionStateResponse) {
  isConfirmOpen.value = false
  subscriptionStore.applyState(state)
  emit('subscribed', state)
}

onMounted(load)

onBeforeUnmount(() => {
  if (frame !== null) {
    cancelAnimationFrame(frame)
  }
})
</script>
