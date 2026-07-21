<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BottomSheet } from '@/components/ui'
import FantasyTradePlayerChecklist from '@/components/fantasy/trades/FantasyTradePlayerChecklist.vue'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import { useToast } from '@/composables/useToast'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import type { FantasyTradeResponse } from '@/interfaces/fantasy/trade/FantasyTradeResponse'
import type { UserDataInterface } from '@/interfaces/user/userInterface'

interface Props {
  isOpen: boolean
  fantasyLeagueUuid: string
  currentUserUuid: string | null
  /** Other members of the league, already excludes the current user. */
  participants: UserDataInterface[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: []; proposed: [trade: FantasyTradeResponse] }>()

const { t } = useI18n()
const toast = useToast()

// A roster fetched via the draft-search endpoint, filtered to a single
// owner — small enough (a fantasy squad) to fetch in one page.
const ROSTER_PAGE_SIZE = 100

const receiverUuid = ref<string | null>(null)
const offeredUuids = ref<string[]>([])
const requestedUuids = ref<string[]>([])
const message = ref('')
const submitting = ref(false)

const myRoster = ref<FantasyPlayerDraftResponse[]>([])
const myRosterLoading = ref(false)
const theirRoster = ref<FantasyPlayerDraftResponse[]>([])
const theirRosterLoading = ref(false)

async function loadRoster(userUuid: string): Promise<FantasyPlayerDraftResponse[]> {
  return fantasyLeagueService.getPlayersToDraft(props.fantasyLeagueUuid, {
    page: 1,
    per_page: ROSTER_PAGE_SIZE,
    filters: { user_uuid: userUuid, availability: 'taken' },
  })
}

async function loadMyRoster() {
  if (!props.currentUserUuid) return
  myRosterLoading.value = true
  try {
    myRoster.value = await loadRoster(props.currentUserUuid)
  } catch (e) {
    console.error('Error loading own roster for trade:', e)
    myRoster.value = []
  } finally {
    myRosterLoading.value = false
  }
}

async function loadTheirRoster(userUuid: string) {
  theirRosterLoading.value = true
  try {
    theirRoster.value = await loadRoster(userUuid)
  } catch (e) {
    console.error('Error loading receiver roster for trade:', e)
    theirRoster.value = []
  } finally {
    theirRosterLoading.value = false
  }
}

function selectReceiver(uuid: string) {
  if (receiverUuid.value === uuid) return
  receiverUuid.value = uuid
  requestedUuids.value = []
  loadTheirRoster(uuid)
}

function resetForm() {
  receiverUuid.value = null
  offeredUuids.value = []
  requestedUuids.value = []
  message.value = ''
  theirRoster.value = []
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetForm()
      loadMyRoster()
    }
  },
)

const canSubmit = computed(
  () =>
    !!receiverUuid.value &&
    offeredUuids.value.length > 0 &&
    requestedUuids.value.length > 0 &&
    !submitting.value,
)

const selectedReceiver = computed(
  () => props.participants.find((p) => p.uuid === receiverUuid.value) ?? null,
)

// Selected uuids resolved back to player objects — powers the removable chips
// and the live footer recap, so the swap can be read back before it's sent.
const offeredPlayers = computed(() =>
  myRoster.value.filter((p) => offeredUuids.value.includes(p.player.uuid)),
)
const requestedPlayers = computed(() =>
  theirRoster.value.filter((p) => requestedUuids.value.includes(p.player.uuid)),
)

function removeOffered(playerUuid: string) {
  offeredUuids.value = offeredUuids.value.filter((uuid) => uuid !== playerUuid)
}
function removeRequested(playerUuid: string) {
  requestedUuids.value = requestedUuids.value.filter((uuid) => uuid !== playerUuid)
}

function participantName(member: UserDataInterface): string {
  const full = [member.firstname, member.lastname].filter(Boolean).join(' ').trim()
  return full || member.email || t('fantasy.trades.unknownManager')
}

function participantInitials(member: UserDataInterface): string {
  const first = member.firstname?.[0] || ''
  const last = member.lastname?.[0] || ''
  const initials = (first + last).toUpperCase()
  return initials || member.email?.[0]?.toUpperCase() || '?'
}

async function submit() {
  if (!canSubmit.value || !receiverUuid.value) return
  submitting.value = true
  try {
    const trade = await fantasyLeagueService.proposeTrade({
      fantasy_league_uuid: props.fantasyLeagueUuid,
      receiver_user_uuid: receiverUuid.value,
      offered_player_uuids: offeredUuids.value,
      requested_player_uuids: requestedUuids.value,
      message: message.value.trim() || undefined,
    })
    toast.success(
      t('fantasy.trades.proposeSuccessTitle'),
      t('fantasy.trades.proposeSuccessBody', { name: selectedReceiver.value ? participantName(selectedReceiver.value) : '' }),
    )
    emit('proposed', trade)
  } catch (e) {
    toast.error(
      t('fantasy.trades.proposeErrorTitle'),
      e instanceof Error ? e.message : t('fantasy.trades.proposeErrorBody'),
    )
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BottomSheet
    :is-visible="isOpen"
    :title="$t('fantasy.trades.proposeTitle')"
    icon="hi-solid-switch-horizontal"
    icon-variant="blue"
    size="xl"
    @close="emit('close')"
  >
    <div class="space-y-5">
      <!-- Step 1: receiver -->
      <div>
        <p class="text-2xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          {{ $t('fantasy.trades.receiverStep') }}
        </p>
        <p v-if="participants.length === 0" class="text-footnote text-gray-400 dark:text-gray-500 py-2">
          {{ $t('fantasy.trades.noParticipants') }}
        </p>
        <div v-else class="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          <button
            v-for="p in participants"
            :key="p.uuid ?? ''"
            type="button"
            class="flex flex-col items-center gap-1 shrink-0 w-16"
            @click="selectReceiver(p.uuid ?? '')"
          >
            <span class="relative">
              <img
                v-if="p.avatar"
                :src="p.avatar"
                :alt="participantName(p)"
                class="w-12 h-12 rounded-full object-cover ring-2 transition-colors"
                :class="receiverUuid === p.uuid ? 'ring-blue-500' : 'ring-transparent'"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 transition-colors"
                :class="receiverUuid === p.uuid ? 'ring-blue-500' : 'ring-transparent'"
              >
                <span class="text-xs font-semibold text-white">{{ participantInitials(p) }}</span>
              </div>
              <span
                v-if="receiverUuid === p.uuid"
                class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-900"
              >
                <v-icon name="hi-solid-check" class="w-2.5 h-2.5 text-white" />
              </span>
            </span>
            <span class="text-2xs text-gray-600 dark:text-gray-300 truncate w-full text-center">
              {{ participantName(p) }}
            </span>
          </button>
        </div>
      </div>

      <template v-if="receiverUuid">
        <!-- You give (own roster) -->
        <div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <v-icon name="hi-solid-arrow-up" class="w-3 h-3 text-rose-500 dark:text-rose-400" />
            </span>
            <p class="text-2xs font-bold uppercase tracking-wide text-rose-500 dark:text-rose-400 flex-1">
              {{ $t('fantasy.trades.youGive') }}
            </p>
            <span v-if="offeredPlayers.length" class="text-2xs font-bold text-rose-500 dark:text-rose-400 tabular-nums">
              {{ offeredPlayers.length }}
            </span>
          </div>
          <!-- Selected chips: an at-a-glance recap that doubles as one-tap removal -->
          <div v-if="offeredPlayers.length" class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="p in offeredPlayers"
              :key="p.player.uuid"
              type="button"
              :aria-label="`${$t('fantasy.trades.removePlayer')} ${p.player.display_name}`"
              class="group inline-flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200/70 dark:border-rose-800/40 active:scale-95 transition-transform"
              @click="removeOffered(p.player.uuid)"
            >
              <img :src="p.player.image_path || '/img/default-avatar.svg'" :alt="p.player.display_name" class="w-4 h-4 rounded-full object-cover shrink-0" />
              <span class="text-2xs font-medium text-rose-700 dark:text-rose-300 max-w-[7rem] truncate">{{ p.player.display_name }}</span>
              <v-icon name="hi-solid-x" class="w-2.5 h-2.5 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-200" />
            </button>
          </div>
          <FantasyTradePlayerChecklist
            v-model="offeredUuids"
            :players="myRoster"
            :loading="myRosterLoading"
            :empty-text="$t('fantasy.trades.myRosterEmpty')"
            accent="rose"
          />
        </div>

        <!-- Swap divider — reinforces that this is a two-sided exchange -->
        <div class="flex items-center gap-2" aria-hidden="true">
          <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span class="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <v-icon name="hi-solid-switch-horizontal" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </span>
          <div class="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        <!-- You get (their roster) -->
        <div>
          <div class="flex items-center gap-1.5 mb-2">
            <span class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <v-icon name="hi-solid-arrow-down" class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </span>
            <p class="text-2xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 flex-1 truncate">
              {{ selectedReceiver ? $t('fantasy.trades.getFromManager', { name: participantName(selectedReceiver) }) : $t('fantasy.trades.youGet') }}
            </p>
            <span v-if="requestedPlayers.length" class="text-2xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {{ requestedPlayers.length }}
            </span>
          </div>
          <div v-if="requestedPlayers.length" class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="p in requestedPlayers"
              :key="p.player.uuid"
              type="button"
              :aria-label="`${$t('fantasy.trades.removePlayer')} ${p.player.display_name}`"
              class="group inline-flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/70 dark:border-emerald-800/40 active:scale-95 transition-transform"
              @click="removeRequested(p.player.uuid)"
            >
              <img :src="p.player.image_path || '/img/default-avatar.svg'" :alt="p.player.display_name" class="w-4 h-4 rounded-full object-cover shrink-0" />
              <span class="text-2xs font-medium text-emerald-700 dark:text-emerald-300 max-w-[7rem] truncate">{{ p.player.display_name }}</span>
              <v-icon name="hi-solid-x" class="w-2.5 h-2.5 text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-200" />
            </button>
          </div>
          <FantasyTradePlayerChecklist
            v-model="requestedUuids"
            :players="theirRoster"
            :loading="theirRosterLoading"
            :empty-text="$t('fantasy.trades.theirRosterEmpty')"
            accent="emerald"
          />
        </div>

        <!-- Step 4: optional message -->
        <div>
          <label class="text-2xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 block">
            {{ $t('fantasy.trades.messageLabel') }}
          </label>
          <textarea
            v-model="message"
            rows="2"
            maxlength="255"
            :placeholder="$t('fantasy.trades.messagePlaceholder')"
            class="w-full px-3 py-2 text-footnote text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500"
          />
        </div>
      </template>
      <p v-else class="text-footnote text-gray-400 dark:text-gray-500 text-center py-4">
        {{ $t('fantasy.trades.selectReceiverFirst') }}
      </p>
    </div>

    <template #footer>
      <!-- Live recap of the swap being built -->
      <div v-if="receiverUuid" class="flex items-center justify-center gap-2.5 mb-2.5 text-2xs font-bold">
        <span class="inline-flex items-center gap-1 tabular-nums text-rose-500 dark:text-rose-400">
          <v-icon name="hi-solid-arrow-up" class="w-3 h-3" />
          {{ $t('fantasy.trades.youGive') }} {{ offeredUuids.length }}
        </span>
        <v-icon name="hi-solid-switch-horizontal" class="w-3 h-3 text-gray-300 dark:text-gray-600" />
        <span class="inline-flex items-center gap-1 tabular-nums text-emerald-600 dark:text-emerald-400">
          <v-icon name="hi-solid-arrow-down" class="w-3 h-3" />
          {{ $t('fantasy.trades.youGet') }} {{ requestedUuids.length }}
        </span>
      </div>
      <button
        type="button"
        :disabled="!canSubmit"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-semibold text-footnote transition-colors active:scale-[0.98] disabled:active:scale-100"
        @click="submit"
      >
        <v-icon v-if="submitting" name="pr-spinner" class="w-4 h-4" animation="spin" />
        {{ submitting ? $t('fantasy.trades.submitting') : $t('fantasy.trades.submit') }}
      </button>
    </template>
  </BottomSheet>
</template>
