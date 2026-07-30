<template>
  <div v-if="subscription" class="w-full">
    <!-- Status card -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-start gap-3">
          <div class="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <v-icon name="hi-solid-sparkles" class="w-5 h-5 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base font-bold text-gray-900 dark:text-white">
                {{ $t('billing.subscription.manage.title') }}
              </h2>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                :class="statusChipClass"
              >
                {{ statusLabel }}
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ planLabel }}</p>
          </div>
        </div>
      </div>

      <!-- Payment failed: the one state that needs an action, so it leads. -->
      <div v-if="isPastDue" class="px-5 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
        <div class="flex items-start gap-2.5">
          <v-icon name="hi-solid-exclamation-circle" class="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
          <div class="min-w-0">
            <p class="text-sm font-medium text-red-800 dark:text-red-300">
              {{ $t('billing.subscription.manage.pastDue.title') }}
            </p>
            <p class="mt-0.5 text-xs text-red-700 dark:text-red-400">
              {{ $t('billing.subscription.manage.pastDue.detail') }}
            </p>
            <button
              type="button"
              class="mt-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1 py-0.5"
              @click="goToPaymentMethods"
            >
              {{ $t('billing.subscription.manage.pastDue.action') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cancelled but still paid up. -->
      <div
        v-else-if="isOnGracePeriod"
        class="px-5 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30"
      >
        <div class="flex items-start gap-2.5">
          <v-icon name="hi-solid-clock" class="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-amber-900 dark:text-amber-300">
              {{ $t('billing.subscription.manage.canceled.title', { date: endsAt }) }}
            </p>
            <p class="mt-0.5 text-xs text-amber-800 dark:text-amber-400">
              {{ $t('billing.subscription.manage.canceled.detail') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          :disabled="isBusy"
          class="mt-3 w-full h-10 rounded-xl text-sm font-semibold bg-amber-500 text-white active:bg-amber-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          @click="resume"
        >
          <v-icon v-if="pendingAction === 'resume'" name="pr-spinner" animation="spin" class="w-4 h-4" />
          {{ $t('billing.subscription.manage.canceled.resume') }}
        </button>
      </div>

      <!-- Facts -->
      <dl class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-if="renewsAt" class="px-5 py-3.5 flex items-center justify-between gap-4">
          <dt class="text-sm text-gray-500 dark:text-gray-400">{{ $t('billing.subscription.manage.renewsOn') }}</dt>
          <dd class="text-sm font-medium text-gray-900 dark:text-white text-right">{{ renewsAt }}</dd>
        </div>
        <div class="px-5 py-3.5 flex items-center justify-between gap-4">
          <dt class="text-sm text-gray-500 dark:text-gray-400">{{ $t('billing.subscription.manage.amount') }}</dt>
          <dd class="text-sm font-medium text-gray-900 dark:text-white text-right tabular-nums">
            {{ currentAmount }}
          </dd>
        </div>
      </dl>
    </div>

    <!-- Switch plan -->
    <div
      v-if="alternatePlan && !isOnGracePeriod"
      class="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
    >
      <div class="flex items-start gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ switchTitle }}</p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ switchDetail }}</p>
        </div>
        <span
          v-if="alternatePlan.savings_percent"
          class="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold tabular-nums flex-shrink-0"
        >
          −{{ alternatePlan.savings_percent }}%
        </span>
      </div>
      <button
        type="button"
        :disabled="isBusy"
        class="mt-3.5 w-full h-11 rounded-xl text-sm font-semibold border border-emerald-500 text-emerald-600 dark:text-emerald-400 active:bg-emerald-50 dark:active:bg-emerald-900/20 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        @click="isSwapOpen = true"
      >
        <v-icon v-if="pendingAction === 'swap'" name="pr-spinner" animation="spin" class="w-4 h-4" />
        {{ switchAction }}
      </button>
    </div>

    <!-- Cancel -->
    <div v-if="!isOnGracePeriod" class="mt-4 text-center">
      <button
        type="button"
        :disabled="isBusy"
        class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1"
        @click="isCancelOpen = true"
      >
        {{ $t('billing.subscription.manage.cancel.action') }}
      </button>
    </div>

    <!-- Swap confirmation -->
    <BottomSheet
      :is-visible="isSwapOpen"
      :title="switchTitle"
      :subtitle="switchConfirmSubtitle"
      icon="hi-solid-refresh"
      icon-variant="emerald"
      size="sm"
      :persistent="pendingAction === 'swap'"
      :dismissible="pendingAction !== 'swap'"
      @close="isSwapOpen = false"
    >
      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="pendingAction === 'swap'"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:bg-gray-200 dark:active:bg-gray-700 transition-colors disabled:opacity-60"
            @click="isSwapOpen = false"
          >
            {{ $t('common.actions.cancel') }}
          </button>
          <button
            type="button"
            :disabled="pendingAction === 'swap'"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-emerald-600 text-white active:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            @click="swap"
          >
            <v-icon v-if="pendingAction === 'swap'" name="pr-spinner" animation="spin" class="w-4 h-4" />
            {{ $t('common.actions.confirm') }}
          </button>
        </div>
      </template>
    </BottomSheet>

    <!-- Cancel confirmation -->
    <BottomSheet
      :is-visible="isCancelOpen"
      :title="$t('billing.subscription.manage.cancel.title')"
      :subtitle="$t('billing.subscription.manage.cancel.subtitle', { date: renewsAt ?? '' })"
      icon="hi-solid-exclamation"
      icon-variant="amber"
      size="sm"
      :persistent="pendingAction === 'cancel'"
      :dismissible="pendingAction !== 'cancel'"
      @close="isCancelOpen = false"
    >
      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="pendingAction === 'cancel'"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-emerald-600 text-white active:bg-emerald-700 transition-colors disabled:opacity-60"
            @click="isCancelOpen = false"
          >
            {{ $t('billing.subscription.manage.cancel.keep') }}
          </button>
          <button
            type="button"
            :disabled="pendingAction === 'cancel'"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:bg-gray-200 dark:active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            @click="cancel"
          >
            <v-icon v-if="pendingAction === 'cancel'" name="pr-spinner" animation="spin" class="w-4 h-4" />
            {{ $t('billing.subscription.manage.cancel.confirm') }}
          </button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useSubscriptionStore } from '@/store/billing/useSubscriptionStore'
import { useToast } from '@/composables/useToast'
import subscriptionService from '@/services/user/billing/SubscriptionService'
import { formatMoney } from '@/utils/currency'

const { t, locale } = useI18n()
const router = useRouter()
const toast = useToast()
const subscriptionStore = useSubscriptionStore()

type PendingAction = 'swap' | 'cancel' | 'resume' | null

const pendingAction = ref<PendingAction>(null)
const isSwapOpen = ref(false)
const isCancelOpen = ref(false)

const isBusy = computed(() => pendingAction.value !== null)
const subscription = computed(() => subscriptionStore.subscription)
const isPastDue = computed(() => subscriptionStore.isPastDue)
const isOnGracePeriod = computed(() => subscriptionStore.isOnGracePeriod)
const currentPlan = computed(() => subscriptionStore.currentPlan)

const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'es-MX'))

// The plan the user is not on — the only one it makes sense to offer.
const alternatePlan = computed(
  () => subscriptionStore.plans.find((plan) => plan.id !== subscription.value?.price) ?? null,
)

const isAnnual = computed(() => currentPlan.value?.interval === 'year')

const planLabel = computed(() =>
  isAnnual.value
    ? t('billing.subscription.plans.annual.name')
    : t('billing.subscription.plans.monthly.name'),
)

const statusLabel = computed(() => {
  if (isPastDue.value) {
    return t('billing.subscription.manage.status.pastDue')
  }
  if (isOnGracePeriod.value) {
    return t('billing.subscription.manage.status.canceled')
  }
  return t('billing.subscription.manage.status.active')
})

const statusChipClass = computed(() => {
  if (isPastDue.value) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }
  if (isOnGracePeriod.value) {
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  }
  return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
})

const renewsAt = computed(() => formatDate(subscription.value?.renews_at))
const endsAt = computed(() => formatDate(subscription.value?.ends_at) ?? '')

const currentAmount = computed(() => {
  const plan = currentPlan.value
  if (!plan) {
    return '—'
  }

  const amount = formatMoney(plan.amount, plan.currency, intlLocale.value)

  return plan.interval === 'year'
    ? t('billing.subscription.manage.perYear', { amount })
    : t('billing.subscription.manage.perMonth', { amount })
})

const switchTitle = computed(() =>
  alternatePlan.value?.interval === 'year'
    ? t('billing.subscription.manage.switch.toAnnual')
    : t('billing.subscription.manage.switch.toMonthly'),
)

const switchDetail = computed(() => {
  const plan = alternatePlan.value
  if (!plan) {
    return ''
  }

  const amount = formatMoney(plan.amount, plan.currency, intlLocale.value)

  return plan.interval === 'year'
    ? t('billing.subscription.manage.switch.toAnnualDetail', {
        amount,
        percent: plan.savings_percent ?? 0,
      })
    : t('billing.subscription.manage.switch.toMonthlyDetail', { amount })
})

const switchAction = computed(() => {
  const plan = alternatePlan.value
  if (!plan) {
    return ''
  }

  return t('billing.subscription.manage.switch.action', {
    amount: formatMoney(plan.amount, plan.currency, intlLocale.value),
  })
})

const switchConfirmSubtitle = computed(() => t('billing.subscription.manage.switch.proration'))

/**
 * The API sends "YYYY-MM-DD HH:mm:ss" in the user's timezone. A renewal date is
 * read, not parsed, so it is spelled out — "30 de agosto de 2026", not
 * "2026-08-30". Built without the time part so no timezone shift can move it a
 * day either way.
 */
function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const [datePart] = value.split(' ')
  const [year, month, day] = (datePart ?? '').split('-').map(Number)

  if (!year || !month || !day) {
    return datePart ?? value
  }

  return new Intl.DateTimeFormat(intlLocale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

async function swap() {
  const plan = alternatePlan.value
  if (!plan || pendingAction.value) {
    return
  }

  pendingAction.value = 'swap'
  try {
    subscriptionStore.applyState(await subscriptionService.swap(plan.id))
    isSwapOpen.value = false
    toast.success(
      t('billing.subscription.manage.switch.done.title'),
      t('billing.subscription.manage.switch.done.message'),
    )
  } catch {
    // Interceptor already reported it; the sheet stays open for a retry.
  } finally {
    pendingAction.value = null
  }
}

async function cancel() {
  if (pendingAction.value) {
    return
  }

  pendingAction.value = 'cancel'
  try {
    subscriptionStore.applyState(await subscriptionService.cancel())
    isCancelOpen.value = false
    toast.success(
      t('billing.subscription.manage.cancel.done.title'),
      t('billing.subscription.manage.cancel.done.message'),
    )
  } catch {
    // Interceptor already reported it.
  } finally {
    pendingAction.value = null
  }
}

async function resume() {
  if (pendingAction.value) {
    return
  }

  pendingAction.value = 'resume'
  try {
    subscriptionStore.applyState(await subscriptionService.resume())
    toast.success(
      t('billing.subscription.manage.canceled.done.title'),
      t('billing.subscription.manage.canceled.done.message'),
    )
  } catch {
    // Interceptor already reported it.
  } finally {
    pendingAction.value = null
  }
}

function goToPaymentMethods() {
  void router.push({ name: 'payment-methods' })
}
</script>
