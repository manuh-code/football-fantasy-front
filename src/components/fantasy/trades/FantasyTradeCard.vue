<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FantasyTradeResponse } from '@/interfaces/fantasy/trade/FantasyTradeResponse'

interface Props {
  trade: FantasyTradeResponse
  currentUserUuid: string | null
  /** True while an accept/reject/cancel request for this trade is in flight. */
  isActing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  accept: [tradeUuid: string]
  reject: [tradeUuid: string]
  cancel: [tradeUuid: string]
}>()

const { t } = useI18n()

const isProposer = computed(() => props.trade.proposer.uuid === props.currentUserUuid)
const isReceiver = computed(() => props.trade.receiver.uuid === props.currentUserUuid)
const isPending = computed(() => props.trade.status === 'PENDING')

type ConfirmAction = 'accept' | 'reject' | 'cancel'
const confirming = ref<ConfirmAction | null>(null)

// Reset the inline confirm bar once the in-flight request settles — on
// success the trade's status flips away from PENDING and this block
// disappears anyway; on failure this lets the user try again.
watch(
  () => props.isActing,
  (acting, wasActing) => {
    if (!acting && wasActing) confirming.value = null
  },
)

const statusInfo = computed(() => {
  const map: Record<FantasyTradeResponse['status'], { label: string; classes: string; icon: string }> = {
    PENDING: {
      label: t('fantasy.trades.statusPending'),
      classes: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      icon: 'hi-solid-clock',
    },
    ACCEPTED: {
      label: t('fantasy.trades.statusAccepted'),
      classes: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      icon: 'hi-solid-check-circle',
    },
    REJECTED: {
      label: t('fantasy.trades.statusRejected'),
      classes: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      icon: 'hi-solid-x-circle',
    },
    CANCELLED: {
      label: t('fantasy.trades.statusCancelled'),
      classes: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      icon: 'hi-solid-ban',
    },
  }
  return map[props.trade.status]
})

const confirmText = computed(() => {
  if (confirming.value === 'accept') return t('fantasy.trades.confirmAccept')
  if (confirming.value === 'reject') return t('fantasy.trades.confirmReject')
  if (confirming.value === 'cancel') return t('fantasy.trades.confirmCancel')
  return ''
})

const confirmButtonClass = computed(() =>
  confirming.value === 'accept'
    ? 'bg-emerald-500 hover:bg-emerald-600'
    : 'bg-red-500 hover:bg-red-600',
)

function confirmAction() {
  if (!confirming.value) return
  if (confirming.value === 'accept') emit('accept', props.trade.uuid)
  else if (confirming.value === 'reject') emit('reject', props.trade.uuid)
  else emit('cancel', props.trade.uuid)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
    <!-- Who + status -->
    <div class="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
      <div class="flex items-center gap-1.5 text-footnote min-w-0">
        <span class="font-semibold text-gray-900 dark:text-white truncate">{{ trade.proposer.fullname }}</span>
        <v-icon name="hi-solid-arrow-right" class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
        <span class="font-semibold text-gray-900 dark:text-white truncate">{{ trade.receiver.fullname }}</span>
      </div>
      <span
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide shrink-0"
        :class="statusInfo.classes"
      >
        <v-icon :name="statusInfo.icon" class="w-3 h-3" />
        {{ statusInfo.label }}
      </span>
    </div>

    <!-- Offered vs requested players -->
    <div class="px-4 pb-3 grid grid-cols-2 gap-3">
      <div class="min-w-0">
        <p class="text-2xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
          {{ $t('fantasy.trades.offers') }}
        </p>
        <ul class="space-y-1">
          <li
            v-for="p in trade.offered_players"
            :key="p.uuid"
            class="text-footnote text-gray-700 dark:text-gray-300 truncate"
          >
            {{ p.display_name }}
          </li>
        </ul>
      </div>
      <div class="min-w-0">
        <p class="text-2xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
          {{ $t('fantasy.trades.requests') }}
        </p>
        <ul class="space-y-1">
          <li
            v-for="p in trade.requested_players"
            :key="p.uuid"
            class="text-footnote text-gray-700 dark:text-gray-300 truncate"
          >
            {{ p.display_name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Message -->
    <div v-if="trade.message" class="mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/40">
      <p class="text-xs text-gray-500 dark:text-gray-400 italic leading-snug">"{{ trade.message }}"</p>
    </div>

    <!-- Actions -->
    <div
      v-if="isPending && (isReceiver || isProposer)"
      class="border-t border-gray-50 dark:border-gray-700/40 px-4 py-3"
    >
      <!-- Inline confirm bar -->
      <div v-if="confirming" class="flex items-center justify-between gap-2">
        <p class="text-xs text-gray-500 dark:text-gray-400 flex-1">{{ confirmText }}</p>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            :disabled="isActing"
            class="px-3 py-1.5 rounded-lg text-2xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
            @click="confirming = null"
          >
            {{ $t('fantasy.trades.confirmNo') }}
          </button>
          <button
            type="button"
            :disabled="isActing"
            class="min-w-[3.5rem] flex items-center justify-center px-3 py-1.5 rounded-lg text-2xs font-semibold text-white transition-colors disabled:opacity-60"
            :class="confirmButtonClass"
            @click="confirmAction"
          >
            <v-icon v-if="isActing" name="pr-spinner" class="w-3.5 h-3.5" animation="spin" />
            <template v-else>{{ $t('fantasy.trades.confirmYes') }}</template>
          </button>
        </div>
      </div>

      <!-- Normal action buttons -->
      <div v-else class="flex items-center gap-2">
        <template v-if="isReceiver">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-footnote font-semibold transition-colors active:scale-[0.98]"
            @click="confirming = 'accept'"
          >
            {{ $t('fantasy.trades.accept') }}
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-footnote font-semibold transition-colors active:scale-[0.98]"
            @click="confirming = 'reject'"
          >
            {{ $t('fantasy.trades.reject') }}
          </button>
        </template>
        <button
          v-else-if="isProposer"
          type="button"
          class="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-footnote font-semibold transition-colors active:scale-[0.98]"
          @click="confirming = 'cancel'"
        >
          {{ $t('fantasy.trades.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>
