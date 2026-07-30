<template>
  <div class="w-full">
    <!-- Card: header + list -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
          <v-icon name="hi-solid-credit-card" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ $t('billing.paymentMethods.title') }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ $t('billing.paymentMethods.subtitle') }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="index in 2" :key="index" class="px-5 py-4 flex items-center gap-4">
          <div class="w-11 h-[1.875rem] rounded-[4.5px] bg-gray-100 dark:bg-gray-700 animate-pulse flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 w-32 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
            <div class="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Load error -->
      <div v-else-if="loadFailed" class="px-5 py-8 flex flex-col items-center text-center gap-3">
        <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6 text-red-500" />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('billing.paymentMethods.loadError') }}</p>
        <button
          type="button"
          class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          @click="fetchPaymentMethods"
        >
          {{ $t('common.actions.retry') }}
        </button>
      </div>

      <!-- List -->
      <div v-else-if="paymentMethods.length" class="divide-y divide-gray-100 dark:divide-gray-700">
        <div
          v-for="paymentMethod in paymentMethods"
          :key="paymentMethod.id"
          class="px-5 py-4 flex items-center gap-4 transition-colors"
          :class="[
            paymentMethod.is_default ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : '',
            paymentMethod.id === highlightedId ? 'animate-row-arrival' : '',
          ]"
        >
          <CardBrandMark
            :brand="paymentMethod.brand"
            :type="paymentMethod.type"
            :label="label(paymentMethod)"
            size="md"
          />

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ brandLabel(paymentMethod) }}
                <span v-if="paymentMethod.last_four" class="text-gray-500 dark:text-gray-400">
                  •••• {{ paymentMethod.last_four }}
                </span>
              </p>
              <span
                v-if="paymentMethod.is_default"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              >
                <v-icon name="hi-solid-badge-check" class="w-3 h-3" />
                {{ $t('billing.paymentMethods.defaultBadge') }}
              </span>
            </div>

            <div class="mt-0.5 flex items-center gap-2 flex-wrap text-xs">
              <span v-if="expiry(paymentMethod)" :class="expiryClass(paymentMethod)">
                {{ expiryText(paymentMethod) }}
              </span>
              <span v-if="walletLabel(paymentMethod)" class="text-gray-500 dark:text-gray-400">
                {{ $t('billing.paymentMethods.walletLabel', { wallet: walletLabel(paymentMethod) }) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              v-if="!paymentMethod.is_default"
              type="button"
              :disabled="pendingId === paymentMethod.id"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
              :aria-label="$t('billing.paymentMethods.makeDefault')"
              :title="$t('billing.paymentMethods.makeDefault')"
              @click="handleSetDefault(paymentMethod)"
            >
              <v-icon
                :name="pendingId === paymentMethod.id ? 'pr-spinner' : 'hi-solid-badge-check'"
                :animation="pendingId === paymentMethod.id ? 'spin' : undefined"
                class="w-4.5 h-4.5"
              />
            </button>
            <button
              type="button"
              :disabled="pendingId === paymentMethod.id"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              :aria-label="$t('common.actions.delete')"
              :title="$t('common.actions.delete')"
              @click="askDelete(paymentMethod)"
            >
              <v-icon name="hi-solid-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="px-5 py-8 flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center mb-3">
          <v-icon name="hi-solid-credit-card" class="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </div>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('billing.paymentMethods.empty.title') }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[18rem]">{{ $t('billing.paymentMethods.empty.subtitle') }}</p>
      </div>

      <!-- Add -->
      <div class="px-5 py-4 border-t border-gray-100 dark:border-gray-700">
        <ButtonComponent
          variant="primary"
          size="md"
          :text="$t('billing.paymentMethods.add')"
          :always-full-width="true"
          icon="hi-solid-plus"
          :disabled="isLoading"
          @click="isSheetOpen = true"
        />
      </div>
    </div>

    <!-- Security note -->
    <div class="flex items-start gap-2 px-1 text-xs text-gray-500 dark:text-gray-400">
      <v-icon name="hi-solid-lock-closed" class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
      <p>{{ $t('billing.paymentMethods.secureNote') }}</p>
    </div>

    <!-- Add payment method -->
    <AddPaymentMethodSheet
      :is-visible="isSheetOpen"
      :has-existing-methods="paymentMethods.length > 0"
      @close="isSheetOpen = false"
      @saved="handleSaved"
    />

    <!-- Delete confirmation -->
    <BottomSheet
      :is-visible="!!methodToDelete"
      :title="$t('billing.paymentMethods.deleteConfirm.title')"
      :subtitle="methodToDelete ? $t('billing.paymentMethods.deleteConfirm.subtitle', { label: label(methodToDelete) }) : ''"
      icon="hi-solid-trash"
      icon-variant="red"
      size="sm"
      :persistent="isDeleting"
      :dismissible="!isDeleting"
      @close="methodToDelete = null"
    >
      <template #footer>
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="isDeleting"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 active:bg-gray-200 dark:active:bg-gray-700 transition-colors disabled:opacity-60"
            @click="methodToDelete = null"
          >
            {{ $t('common.actions.cancel') }}
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            class="flex-1 h-11 rounded-xl text-sm font-semibold bg-red-500 text-white active:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            @click="confirmDelete"
          >
            <v-icon v-if="isDeleting" name="pr-spinner" animation="spin" class="w-4 h-4" />
            {{ isDeleting ? $t('billing.paymentMethods.deleteConfirm.loading') : $t('common.actions.delete') }}
          </button>
        </div>
      </template>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import AddPaymentMethodSheet from '@/components/user/billing/AddPaymentMethodSheet.vue'
import CardBrandMark from '@/components/user/billing/CardBrandMark.vue'
import { useToast } from '@/composables/useToast'
import paymentMethodService from '@/services/user/billing/PaymentMethodService'
import type { PaymentMethodResponse } from '@/interfaces/user/billing/PaymentMethodResponse'
import {
  paymentMethodBrandLabel,
  paymentMethodExpiry,
  paymentMethodExpiryState,
  paymentMethodLabel,
  paymentMethodWalletLabel,
} from '@/utils/paymentMethod'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const paymentMethods = ref<PaymentMethodResponse[]>([])
const isLoading = ref(true)
const loadFailed = ref(false)
const isSheetOpen = ref(false)
const pendingId = ref<string | null>(null)
const methodToDelete = ref<PaymentMethodResponse | null>(null)
const isDeleting = ref(false)
// The card that was just added, so the list can point at it once the sheet is
// out of the way.
const highlightedId = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const brandLabel = paymentMethodBrandLabel
const walletLabel = paymentMethodWalletLabel
const expiry = paymentMethodExpiry
const label = paymentMethodLabel

function expiryText(paymentMethod: PaymentMethodResponse): string {
  const state = paymentMethodExpiryState(paymentMethod)
  if (state === 'expired') {
    return t('billing.paymentMethods.expired')
  }
  const formatted = t('billing.paymentMethods.expires', { date: paymentMethodExpiry(paymentMethod) ?? '' })
  return state === 'expiringSoon' ? `${formatted} · ${t('billing.paymentMethods.expiringSoon')}` : formatted
}

function expiryClass(paymentMethod: PaymentMethodResponse): string {
  const state = paymentMethodExpiryState(paymentMethod)
  if (state === 'expired') {
    return 'text-red-600 dark:text-red-400 font-medium'
  }
  if (state === 'expiringSoon') {
    return 'text-amber-600 dark:text-amber-400 font-medium'
  }
  return 'text-gray-500 dark:text-gray-400'
}

async function fetchPaymentMethods() {
  isLoading.value = true
  loadFailed.value = false
  try {
    paymentMethods.value = await paymentMethodService.index()
  } catch {
    // The axios interceptor already toasted the reason.
    loadFailed.value = true
  } finally {
    isLoading.value = false
  }
}

async function handleSetDefault(paymentMethod: PaymentMethodResponse) {
  pendingId.value = paymentMethod.id
  try {
    await paymentMethodService.setDefault(paymentMethod.id)
    await fetchPaymentMethods()
    toast.success(
      t('billing.paymentMethods.defaultUpdated.title'),
      t('billing.paymentMethods.defaultUpdated.message', { label: label(paymentMethod) }),
    )
  } catch {
    // Interceptor handled the messaging; the list keeps its previous state.
  } finally {
    pendingId.value = null
  }
}

function askDelete(paymentMethod: PaymentMethodResponse) {
  methodToDelete.value = paymentMethod
}

async function confirmDelete() {
  const paymentMethod = methodToDelete.value
  if (!paymentMethod || isDeleting.value) {
    return
  }

  isDeleting.value = true
  try {
    await paymentMethodService.destroy(paymentMethod.id)
    methodToDelete.value = null
    // Deleting the default promotes another method server-side, so the whole
    // list is refetched instead of splicing the row out locally.
    await fetchPaymentMethods()
    toast.success(
      t('billing.paymentMethods.deleted.title'),
      t('billing.paymentMethods.deleted.message', { label: label(paymentMethod) }),
    )
  } catch {
    // Interceptor handled the messaging.
  } finally {
    isDeleting.value = false
  }
}

// The sheet already showed the saved card, so this hands the user back to the
// list with that row called out instead of stacking a toast on the same news.
async function handleSaved(paymentMethod: PaymentMethodResponse) {
  isSheetOpen.value = false
  await fetchPaymentMethods()

  highlightedId.value = paymentMethod.id
  if (highlightTimer !== null) {
    clearTimeout(highlightTimer)
  }
  highlightTimer = setTimeout(() => {
    highlightedId.value = null
    highlightTimer = null
  }, 2600)
}

onMounted(async () => {
  await fetchPaymentMethods()

  // The 3DS callback bounces back here with ?saved=1 once it registered the
  // method, so the confirmation toast is shown on the list and not mid-redirect.
  if (route.query.saved === '1') {
    toast.success(t('billing.paymentMethods.saved.title'), t('billing.paymentMethods.saved.message'))
    await router.replace({ name: 'payment-methods' })
  }
})

onUnmounted(() => {
  if (highlightTimer !== null) {
    clearTimeout(highlightTimer)
  }
})
</script>

<style scoped>
/* The row the user just created, held long enough to find it in the list. */
.animate-row-arrival {
  animation: row-arrival 2.6s ease-out both;
}

@keyframes row-arrival {
  0%,
  55% {
    background-color: rgb(16 185 129 / 0.16);
  }
  100% {
    background-color: rgb(16 185 129 / 0);
  }
}
</style>
