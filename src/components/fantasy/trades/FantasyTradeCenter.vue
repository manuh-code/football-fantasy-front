<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/store'
import { useFantasyLeagueDetailStore } from '@/store/fantasy/useFantasyLeagueDetailStore'
import { useAblyBroadcast } from '@/composables/broadcast/useAblyBroadcast'
import FantasyTradeCard from '@/components/fantasy/trades/FantasyTradeCard.vue'
import FantasyTradeProposeDrawer from '@/components/fantasy/trades/FantasyTradeProposeDrawer.vue'
import type { FantasyTradeResponse } from '@/interfaces/fantasy/trade/FantasyTradeResponse'

interface Props {
  fantasyLeagueUuid: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()
const leagueDetailStore = useFantasyLeagueDetailStore()
const { fantasyLeagueChannel } = useAblyBroadcast()

const currentUserUuid = computed(() => userStore.getUserData?.uuid ?? null)

// Trades can only be swapped once every manager has a roster.
const canProposeTrades = computed(() => leagueDetailStore.draftStatus === 'COMPLETED')

const otherParticipants = computed(() =>
  (leagueDetailStore.currentLeague?.participants ?? []).filter(
    (p) => p.uuid && p.uuid !== currentUserUuid.value,
  ),
)

// ── List ──
const trades = ref<FantasyTradeResponse[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

type Scope = 'all' | 'received' | 'sent'
const scope = ref<Scope>('all')

const filteredTrades = computed(() => {
  if (scope.value === 'received') {
    return trades.value.filter((tr) => tr.receiver.uuid === currentUserUuid.value)
  }
  if (scope.value === 'sent') {
    return trades.value.filter((tr) => tr.proposer.uuid === currentUserUuid.value)
  }
  return trades.value
})

// Pending trades first, most actionable content at the top of the list.
const sortedTrades = computed(() =>
  [...filteredTrades.value].sort((a, b) => {
    const aPending = a.status === 'PENDING' ? 0 : 1
    const bPending = b.status === 'PENDING' ? 0 : 1
    return aPending - bPending
  }),
)

// Trades awaiting my response — surfaced as a badge on the "received" filter.
const pendingReceivedCount = computed(
  () =>
    trades.value.filter(
      (tr) => tr.status === 'PENDING' && tr.receiver.uuid === currentUserUuid.value,
    ).length,
)

async function loadTrades() {
  if (!props.fantasyLeagueUuid) return
  isLoading.value = true
  error.value = null
  try {
    trades.value = await fantasyLeagueService.getTradesByLeague(props.fantasyLeagueUuid)
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('fantasy.trades.loadError')
    console.error('Error loading trades:', e)
  } finally {
    isLoading.value = false
  }
}

// ── Actions (accept / reject / cancel) ──
const actingUuids = ref<Set<string>>(new Set())
const isActing = (uuid: string) => actingUuids.value.has(uuid)

function replaceTrade(updated: FantasyTradeResponse) {
  trades.value = trades.value.map((tr) => (tr.uuid === updated.uuid ? updated : tr))
}

// Insert (or reconcile, if already present) a trade coming from an Ably event.
function upsertTrade(trade: FantasyTradeResponse) {
  const exists = trades.value.some((tr) => tr.uuid === trade.uuid)
  trades.value = exists
    ? trades.value.map((tr) => (tr.uuid === trade.uuid ? trade : tr))
    : [trade, ...trades.value]
}

async function handleAccept(tradeUuid: string) {
  actingUuids.value.add(tradeUuid)
  try {
    const updated = await fantasyLeagueService.acceptTrade(tradeUuid)
    replaceTrade(updated)
    toast.success(t('fantasy.trades.acceptedToastTitle'), t('fantasy.trades.acceptedToastBody'))
  } catch (e) {
    toast.error(t('fantasy.trades.actionErrorTitle'), e instanceof Error ? e.message : t('fantasy.trades.actionErrorBody'))
  } finally {
    actingUuids.value.delete(tradeUuid)
  }
}

async function handleReject(tradeUuid: string) {
  actingUuids.value.add(tradeUuid)
  try {
    const updated = await fantasyLeagueService.rejectTrade(tradeUuid)
    replaceTrade(updated)
    toast.success(t('fantasy.trades.rejectedToastTitle'), t('fantasy.trades.rejectedToastBody'))
  } catch (e) {
    toast.error(t('fantasy.trades.actionErrorTitle'), e instanceof Error ? e.message : t('fantasy.trades.actionErrorBody'))
  } finally {
    actingUuids.value.delete(tradeUuid)
  }
}

async function handleCancel(tradeUuid: string) {
  actingUuids.value.add(tradeUuid)
  try {
    const updated = await fantasyLeagueService.cancelTrade(tradeUuid)
    replaceTrade(updated)
    toast.success(t('fantasy.trades.cancelledToastTitle'), t('fantasy.trades.cancelledToastBody'))
  } catch (e) {
    toast.error(t('fantasy.trades.actionErrorTitle'), e instanceof Error ? e.message : t('fantasy.trades.actionErrorBody'))
  } finally {
    actingUuids.value.delete(tradeUuid)
  }
}

// ── Propose drawer ──
const isProposeOpen = ref(false)

function handleProposed(trade: FantasyTradeResponse) {
  // Upsert (not a naive prepend): the backend also broadcasts `trade.proposed`
  // over Ably, and that event can land before this HTTP response resolves.
  // Deduping by uuid keeps either arrival order from doubling the card.
  upsertTrade(trade)
  isProposeOpen.value = false
}

// ── Realtime (Ably) ──
// Same league-wide channel as `league.joined` — every member is subscribed,
// so events are filtered client-side to the trades that involve me, and the
// toast is skipped for the role that just triggered the action locally
// (they already got direct feedback from their own request).
let tradeChannel: ReturnType<typeof fantasyLeagueChannel> | null = null

function involvesMe(trade: FantasyTradeResponse): boolean {
  return trade.proposer.uuid === currentUserUuid.value || trade.receiver.uuid === currentUserUuid.value
}

function subscribeToTradeChannel() {
  unsubscribeFromTradeChannel()
  if (!props.fantasyLeagueUuid) return
  tradeChannel = fantasyLeagueChannel(props.fantasyLeagueUuid)

  tradeChannel.subscribe('trade.proposed', (message) => {
    const trade = message.data as FantasyTradeResponse
    if (!involvesMe(trade)) return
    upsertTrade(trade)
    if (trade.receiver.uuid === currentUserUuid.value) {
      toast.info(t('fantasy.trades.notifyProposedTitle'), t('fantasy.trades.notifyProposedBody', { name: trade.proposer.fullname }))
    }
  })

  tradeChannel.subscribe('trade.accepted', (message) => {
    const trade = message.data as FantasyTradeResponse
    if (!involvesMe(trade)) return
    upsertTrade(trade)
    if (trade.proposer.uuid === currentUserUuid.value) {
      toast.success(t('fantasy.trades.notifyAcceptedTitle'), t('fantasy.trades.notifyAcceptedBody', { name: trade.receiver.fullname }))
    }
  })

  tradeChannel.subscribe('trade.rejected', (message) => {
    const trade = message.data as FantasyTradeResponse
    if (!involvesMe(trade)) return
    upsertTrade(trade)
    if (trade.proposer.uuid === currentUserUuid.value) {
      toast.info(t('fantasy.trades.notifyRejectedTitle'), t('fantasy.trades.notifyRejectedBody', { name: trade.receiver.fullname }))
    }
  })

  tradeChannel.subscribe('trade.cancelled', (message) => {
    const trade = message.data as FantasyTradeResponse
    if (!involvesMe(trade)) return
    upsertTrade(trade)
    if (trade.receiver.uuid === currentUserUuid.value) {
      toast.info(t('fantasy.trades.notifyCancelledTitle'), t('fantasy.trades.notifyCancelledBody', { name: trade.proposer.fullname }))
    }
  })
}

function unsubscribeFromTradeChannel() {
  if (tradeChannel) {
    tradeChannel.unsubscribe()
    tradeChannel.detach()
    tradeChannel = null
  }
}

watch(() => props.fantasyLeagueUuid, () => {
  loadTrades()
  subscribeToTradeChannel()
})

onMounted(() => {
  // The receiver picker excludes the current user by uuid, so a missing
  // `userData` (e.g. persisted token but user not yet refetched) would leave
  // `currentUserUuid` null and show the logged-in user as a trade target.
  // Ensure it's loaded before the picker matters.
  if (!userStore.getUserData) {
    userStore.setUserDataFromApi().catch(() => {})
  }
  loadTrades()
  subscribeToTradeChannel()
})

onUnmounted(unsubscribeFromTradeChannel)
</script>

<template>
  <div class="space-y-4">
    <!-- Header: scope filter + propose button -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="opt in (['all', 'received', 'sent'] as Scope[])"
          :key="opt"
          type="button"
          class="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95"
          :class="scope === opt
            ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'"
          @click="scope = opt"
        >
          {{ $t(`fantasy.trades.filter${opt.charAt(0).toUpperCase()}${opt.slice(1)}`) }}
          <span
            v-if="opt === 'received' && pendingReceivedCount > 0"
            class="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold tabular-nums leading-none"
            :class="scope === opt ? 'bg-white/25 text-white' : 'bg-purple-500 text-white'"
          >
            {{ pendingReceivedCount }}
          </span>
        </button>
      </div>
      <button
        v-if="canProposeTrades"
        type="button"
        class="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold transition-colors active:scale-95 shadow-sm shadow-purple-500/25"
        @click="isProposeOpen = true"
      >
        <v-icon name="hi-solid-plus" class="w-3.5 h-3.5" />
        {{ $t('fantasy.trades.proposeButton') }}
      </button>
    </div>

    <!-- Draft not completed yet -->
    <div
      v-if="!canProposeTrades"
      class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-900/30"
    >
      <v-icon name="hi-solid-information-circle" class="w-4 h-4 text-amber-500 shrink-0" />
      <p class="text-footnote text-amber-700 dark:text-amber-300">{{ $t('fantasy.trades.draftNotCompleted') }}</p>
    </div>

    <!-- Loading skeleton — mirrors FantasyTradeCard's layout so the list
         doesn't visibly reflow once real data lands. -->
    <div v-if="isLoading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden animate-pulse"
      >
        <!-- Who + status -->
        <div class="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
          <div class="flex items-center gap-1.5">
            <div class="h-3.5 rounded-full bg-gray-200 dark:bg-gray-700" :style="{ width: `${60 + (n * 11) % 25}px` }" />
            <div class="w-3.5 h-3.5 rounded-full bg-gray-100 dark:bg-gray-700/60 shrink-0" />
            <div class="h-3.5 rounded-full bg-gray-200 dark:bg-gray-700" :style="{ width: `${60 + (n * 7) % 25}px` }" />
          </div>
          <div class="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700/60 shrink-0" />
        </div>

        <!-- Offered vs requested -->
        <div class="px-4 pb-3 grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <div class="h-2 w-12 rounded-full bg-gray-100 dark:bg-gray-700/60" />
            <div class="h-3 w-4/5 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-3 w-3/5 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div class="space-y-1.5">
            <div class="h-2 w-14 rounded-full bg-gray-100 dark:bg-gray-700/60" />
            <div class="h-3 w-3/5 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div class="h-3 w-4/5 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        <!-- Actions (skipped on the last card — mirrors a resolved trade) -->
        <div v-if="n !== 3" class="border-t border-gray-50 dark:border-gray-700/40 px-4 py-3 flex items-center gap-2">
          <div class="flex-1 h-8 rounded-xl bg-gray-100 dark:bg-gray-700/60" />
          <div class="flex-1 h-8 rounded-xl bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 text-center"
    >
      <v-icon name="hi-solid-exclamation" class="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p class="text-footnote text-red-500 dark:text-red-400 mb-4">{{ error }}</p>
      <button
        class="px-4 py-1.5 bg-red-500 text-white rounded-full text-footnote font-medium active:bg-red-600 transition-colors"
        @click="loadTrades"
      >
        {{ $t('common.actions.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else-if="sortedTrades.length === 0"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 py-12 text-center px-6"
    >
      <div class="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
        <v-icon name="hi-solid-switch-horizontal" class="w-7 h-7 text-purple-400" />
      </div>
      <h3 class="text-callout font-semibold text-gray-900 dark:text-white mb-1">{{ $t('fantasy.trades.noTrades') }}</h3>
      <p class="text-footnote text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
        {{ scope === 'all' ? $t('fantasy.trades.noTradesBody') : $t('fantasy.trades.noTradesFilteredBody') }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <FantasyTradeCard
        v-for="trade in sortedTrades"
        :key="trade.uuid"
        :trade="trade"
        :current-user-uuid="currentUserUuid"
        :is-acting="isActing(trade.uuid)"
        @accept="handleAccept"
        @reject="handleReject"
        @cancel="handleCancel"
      />
    </div>

    <!-- Propose drawer -->
    <FantasyTradeProposeDrawer
      :is-open="isProposeOpen"
      :fantasy-league-uuid="fantasyLeagueUuid"
      :current-user-uuid="currentUserUuid"
      :participants="otherParticipants"
      @close="isProposeOpen = false"
      @proposed="handleProposed"
    />
  </div>
</template>
