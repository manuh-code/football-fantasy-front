import { ref, onUnmounted } from 'vue'
import { useAblyBroadcast } from './broadcast/useAblyBroadcast'

// ── Types ─────────────────────────────────────────────────────────

export interface DraftTurn {
  pick: number
  round: number
  pick_in_round: number
  user_uuid: string
  user_name: string
}

export interface PlayerPickedPayload {
  picked_by_user_uuid: string
  football_player_id: number
  player_uuid: string | null
}

export interface TurnChangedPayload {
  next_turn: DraftTurn | null
  is_draft_complete: boolean
}

// ── Track active subscriptions per channel to prevent duplicates ──
const activeChannels = new Set<string>()

// ── Composable ────────────────────────────────────────────────────

export function useDraftChannel(fantasyLeagueUuid: string, currentUserUuid: string) {
  // Reactive state
  const currentTurn     = ref<DraftTurn | null>(null)
  const isMyTurn        = ref(false)
  const isDraftComplete = ref(false)
  const { draftFantasyLeagueChannel } = useAblyBroadcast()

  // Reuse existing Ably channel (singleton connection)
  const channelName = `draft-${fantasyLeagueUuid}`
  const channel = draftFantasyLeagueChannel(fantasyLeagueUuid)

  // Prevent duplicate subscriptions (e.g. HMR, re-mounts)
  const isAlreadySubscribed = activeChannels.has(channelName)

  // ── Optional callbacks for the component ──────────────────────
  let onPlayerPickedCb: ((payload: PlayerPickedPayload) => void) | null = null
  let onDraftActivatedCb: ((initialTurn: DraftTurn | null) => void) | null = null

  // ── Subscriptions (only if not already active) ────────────────

  if (!isAlreadySubscribed) {
    activeChannels.add(channelName)

    // 1. Player picked → component removes it from list
    channel.subscribe('player.picked', (msg) => {
      const payload = msg.data as PlayerPickedPayload

      // Skip if the current user triggered this pick (already handled locally)
      if (payload.picked_by_user_uuid === currentUserUuid) return

      onPlayerPickedCb?.(payload)
    })

    // 2. Turn changed → update who can pick
    channel.subscribe('turn.changed', (msg) => {
      const payload = msg.data as TurnChangedPayload
      currentTurn.value     = payload.next_turn
      isDraftComplete.value = payload.is_draft_complete
      isMyTurn.value        = payload.next_turn?.user_uuid === currentUserUuid
    })

    // 3. Draft activated (when admin activates while user is already in the room)
    channel.subscribe('draft.activated', (msg) => {
      const payload = msg.data as { league_uuid: string; initial_turn: DraftTurn | null }
      currentTurn.value = payload.initial_turn
      isMyTurn.value    = payload.initial_turn?.user_uuid === currentUserUuid
      onDraftActivatedCb?.(payload.initial_turn)
    })
  }

  // ── Methods ───────────────────────────────────────────────────

  /** Set the turn on initial load (via REST) */
  function setInitialTurn(turn: DraftTurn | null) {
    currentTurn.value = turn
    isMyTurn.value    = turn?.user_uuid === currentUserUuid
  }

  /** Register callback for when a player is picked */
  function onPlayerPicked(cb: (payload: PlayerPickedPayload) => void) {
    onPlayerPickedCb = cb
  }

  /** Register callback for when the draft is activated */
  function onDraftActivated(cb: (initialTurn: DraftTurn | null) => void) {
    onDraftActivatedCb = cb
  }

  // ── Cleanup on component unmount ──────────────────────────────
  onUnmounted(() => {
    channel.unsubscribe('player.picked')
    channel.unsubscribe('turn.changed')
    channel.unsubscribe('draft.activated')
    activeChannels.delete(channelName)
  })

  return {
    currentTurn,
    isMyTurn,
    isDraftComplete,
    setInitialTurn,
    onPlayerPicked,
    onDraftActivated,
  }
}