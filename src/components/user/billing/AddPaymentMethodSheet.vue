<template>
  <BottomSheet
    :is-visible="isVisible"
    :title="savedMethod ? '' : $t('billing.paymentMethods.sheet.title')"
    :subtitle="savedMethod ? '' : $t('billing.paymentMethods.sheet.subtitle')"
    :aria-label="savedMethod ? $t('billing.paymentMethods.sheet.success.title') : ''"
    icon="hi-solid-credit-card"
    icon-variant="emerald"
    size="lg"
    role="dialog"
    autofocus
    :persistent="isSubmitting || !!savedMethod"
    :dismissible="!isSubmitting && !savedMethod"
    @close="emit('close')"
  >
    <!-- The card lands in the wallet: the sheet resolves in place instead of
         vanishing behind a toast, so the answer to "which card did I just add,
         and is it my default?" is on screen where the user is looking. -->
    <div v-if="savedMethod" class="py-6 flex flex-col items-center text-center">
      <div class="relative animate-saved-card">
        <CardBrandMark :brand="savedMethod.brand" :type="savedMethod.type" size="lg" :label="savedLabel" />
        <span
          class="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 flex items-center justify-center"
        >
          <v-icon name="hi-solid-check" class="w-3.5 h-3.5 text-white" />
        </span>
      </div>

      <h2 class="mt-5 text-lg font-bold text-gray-900 dark:text-white">
        {{ $t('billing.paymentMethods.sheet.success.title') }}
      </h2>
      <p class="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">{{ savedLabel }}</p>
      <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {{
          savedMethod.is_default
            ? $t('billing.paymentMethods.sheet.success.default')
            : $t('billing.paymentMethods.sheet.success.ready')
        }}
      </p>
    </div>

    <div v-else class="pb-2">
      <!-- Reassurance sits above the fields, where it can still change how the
           user feels about typing a card number. -->
      <div
        class="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/20 px-3 py-2.5"
      >
        <v-icon name="hi-solid-lock-closed" class="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <p class="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
          {{ $t('billing.paymentMethods.sheet.trust') }}
        </p>
      </div>

      <!-- Fixed-height stage. The Payment Element stays in the layout at all
           times — Stripe sizes it from its container, and mounting into a
           `display: none` parent makes it render at zero width and re-flow a
           beat later. The placeholder covers it instead of replacing it. -->
      <div
        class="relative transition-[min-height] duration-300 ease-out"
        :style="{ minHeight: isStageCovered ? '17.5rem' : '0px' }"
      >
        <div
          ref="paymentElementRef"
          class="transition-opacity duration-200"
          :class="isFormUsable ? 'opacity-100' : 'opacity-0 pointer-events-none'"
          :inert="!isFormUsable"
        />

        <Transition name="pm-stage">
          <div
            v-if="isStageCovered"
            class="absolute inset-0 bg-white dark:bg-gray-900"
            :aria-busy="!hasLoadError"
          >
            <!-- Retry -->
            <div v-if="hasLoadError" class="h-full flex flex-col items-center justify-center text-center gap-3 px-4">
              <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <v-icon name="hi-solid-exclamation-circle" class="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {{ $t('billing.paymentMethods.sheet.loadError') }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ $t('billing.paymentMethods.sheet.loadErrorHint') }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md px-2 py-1"
                @click="setupForm"
              >
                <v-icon name="hi-solid-refresh" class="w-4 h-4" />
                {{ $t('common.actions.retry') }}
              </button>
            </div>

            <!-- Placeholder shaped like the form it hands off to: a tab row, the
                 card number, the expiry/CVC pair, then the country field. -->
            <div v-else class="space-y-4" role="status" :aria-label="$t('billing.paymentMethods.sheet.preparing')">
              <div class="flex gap-2">
                <div v-for="tab in 3" :key="tab" class="h-14 flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
              <div class="space-y-1.5">
                <div class="h-2.5 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              </div>
              <div class="flex gap-3">
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 w-12 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div class="h-11 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Only meaningful when there is something to switch away from: the very
           first method is made default by the API on its own. Rendered from the
           start, disabled until the form is live, so nothing shifts underfoot. -->
      <label
        v-if="hasExistingMethods"
        class="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-3.5 py-3 transition-opacity"
        :class="isFormUsable ? 'cursor-pointer' : 'opacity-50 cursor-default'"
      >
        <input
          v-model="makeDefault"
          type="checkbox"
          :disabled="!isFormUsable"
          class="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800 flex-shrink-0"
        />
        <span class="min-w-0">
          <span class="block text-sm font-medium text-gray-800 dark:text-gray-100">
            {{ $t('billing.paymentMethods.sheet.makeDefault') }}
          </span>
          <span class="block mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {{ $t('billing.paymentMethods.sheet.makeDefaultHint') }}
          </span>
        </span>
      </label>

      <!-- Sits directly above the submit button, not at the end of a scrollable
           column where a declined card can go unread. -->
      <div
        v-if="visibleError"
        ref="errorRef"
        role="alert"
        class="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 px-3.5 py-3"
      >
        <v-icon name="hi-solid-exclamation-circle" class="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ visibleError }}</p>
      </div>
    </div>

    <template #footer>
      <ButtonComponent
        v-if="savedMethod"
        type="button"
        variant="primary"
        size="md"
        :text="$t('billing.paymentMethods.sheet.success.done')"
        :always-full-width="true"
        icon="hi-solid-check"
        @click="finish"
      />
      <ButtonComponent
        v-else
        type="button"
        variant="primary"
        size="md"
        :text="isSubmitting ? $t('billing.paymentMethods.sheet.submitting') : $t('billing.paymentMethods.sheet.submit')"
        :loading="isSubmitting"
        :disabled="!isFormUsable || isSubmitting"
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
import { useRouter } from 'vue-router'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { ButtonComponent } from '@/components/ui'
import CardBrandMark from '@/components/user/billing/CardBrandMark.vue'
import { useStripePaymentElement } from '@/composables/useStripePaymentElement'
import { rememberPendingDefault, consumePendingDefault, paymentMethodLabel } from '@/utils/paymentMethod'
import paymentMethodService from '@/services/user/billing/PaymentMethodService'
import type { PaymentMethodResponse } from '@/interfaces/user/billing/PaymentMethodResponse'

const props = defineProps<{
  isVisible: boolean
  hasExistingMethods: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: [paymentMethod: PaymentMethodResponse]
}>()

// How long the saved card stays on screen before the sheet bows out. Long
// enough to read the brand and last four, short enough not to feel like a wait.
const SUCCESS_DWELL_MS = 1600

// Matches BottomSheet's leave transition, with a little slack.
const LEAVE_TRANSITION_MS = 300

const { t } = useI18n()
const router = useRouter()

// `isLoading` is deliberately not read here: it flips false when `mount()`
// returns, which is before Stripe has painted anything. The stage gates on
// `isReady` instead — that is the whole reason the form used to flash.
const { isReady, errorMessage, loadFailed, mount, confirm, destroy } = useStripePaymentElement()

const paymentElementRef = ref<HTMLElement | null>(null)
const errorRef = ref<HTMLElement | null>(null)
const mountFailed = ref(false)
const makeDefault = ref(false)
const submitError = ref<string | null>(null)
const savedMethod = ref<PaymentMethodResponse | null>(null)
// Spans the whole save — Stripe's confirmation *and* the call that attaches the
// method on our side, which is a second round trip the user is still waiting on.
const isSubmitting = ref(false)
const confirmedIntentId = ref<string | null>(null)

let dwellTimer: ReturnType<typeof setTimeout> | null = null
let teardownTimer: ReturnType<typeof setTimeout> | null = null

const hasLoadError = computed(() => mountFailed.value || loadFailed.value)
// The element is only usable once Stripe has painted it; until then the stage
// keeps the placeholder on top and the submit button locked.
const isFormUsable = computed(() => isReady.value && !hasLoadError.value)
const isStageCovered = computed(() => !isFormUsable.value)
const visibleError = computed(() => (hasLoadError.value ? null : errorMessage.value ?? submitError.value))
const savedLabel = computed(() => (savedMethod.value ? paymentMethodLabel(savedMethod.value) : ''))

// Stripe returns here after an off-site step (3DS); the callback view reads the
// `setup_intent` query param and finishes the registration.
const returnUrl = computed(
  () => `${window.location.origin}${router.resolve({ name: 'payment-methods-callback' }).href}`,
)

async function setupForm() {
  mountFailed.value = false
  submitError.value = null

  // The sheet's content is teleported behind a v-if, so the mount target only
  // exists once the enter transition has inserted it.
  await nextTick()
  if (!paymentElementRef.value) {
    await nextTick()
  }
  if (!paymentElementRef.value) {
    mountFailed.value = true
    return
  }
  mountFailed.value = !(await mount(paymentElementRef.value))
}

async function submit() {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    // Persisted before confirming: a 3DS redirect tears down this component.
    rememberPendingDefault(makeDefault.value)

    // Stripe accepts one confirmation per SetupIntent. If the card already
    // cleared and it was our own API that failed, the retry reuses that id
    // instead of sending the user back through the card details.
    const setupIntentId = confirmedIntentId.value ?? (await confirm(returnUrl.value))

    // No id and no error means Stripe is navigating away for authentication.
    if (!setupIntentId) {
      await revealError()
      return
    }
    confirmedIntentId.value = setupIntentId

    const paymentMethod = await paymentMethodService.store(setupIntentId, makeDefault.value)
    consumePendingDefault()

    // Released before the success panel replaces the mount target, so Stripe is
    // never left holding a node that Vue is about to remove.
    destroy()
    savedMethod.value = paymentMethod
    dwellTimer = setTimeout(finish, SUCCESS_DWELL_MS)
  } catch {
    submitError.value = t('billing.paymentMethods.sheet.genericError')
    await revealError()
  } finally {
    isSubmitting.value = false
  }
}

// A card declined at the bottom of a scrolled sheet is a card the user never
// sees rejected.
async function revealError() {
  await nextTick()
  errorRef.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function finish() {
  clearDwell()
  const paymentMethod = savedMethod.value
  if (paymentMethod) {
    emit('saved', paymentMethod)
  }
}

function clearDwell() {
  if (dwellTimer !== null) {
    clearTimeout(dwellTimer)
    dwellTimer = null
  }
}

function reset() {
  clearDwell()
  clearTeardown()
  savedMethod.value = null
  submitError.value = null
  mountFailed.value = false
  confirmedIntentId.value = null
  isSubmitting.value = false
  destroy()
}

function clearTeardown() {
  if (teardownTimer !== null) {
    clearTimeout(teardownTimer)
    teardownTimer = null
  }
}

watch(
  () => props.isVisible,
  async (visible) => {
    if (visible) {
      clearDwell()
      clearTeardown()
      savedMethod.value = null
      confirmedIntentId.value = null
      makeDefault.value = false
      await setupForm()
      return
    }

    // Held until the sheet has finished sliding out. Tearing the state down now
    // would snap the success panel back to an empty form on the way off screen.
    clearDwell()
    clearTeardown()
    teardownTimer = setTimeout(() => {
      teardownTimer = null
      if (!props.isVisible) {
        reset()
      }
    }, LEAVE_TRANSITION_MS)
  },
  { immediate: true },
)

onBeforeUnmount(reset)
</script>

<style scoped>
/* The placeholder dissolves into the live form rather than being swapped out
   from under it. */
.pm-stage-leave-active {
  transition: opacity 0.25s ease;
}
.pm-stage-enter-active {
  transition: opacity 0.15s ease;
}
.pm-stage-enter-from,
.pm-stage-leave-to {
  opacity: 0;
}

.animate-saved-card {
  animation: saved-card 0.45s cubic-bezier(0.22, 1.2, 0.4, 1) both;
}

@keyframes saved-card {
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
