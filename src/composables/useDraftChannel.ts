import { ref, onUnmounted } from 'vue'
import { useAblyBroadcast } from './broadcast/useAblyBroadcast'
import { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'

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
  player_uuid: string | null
  is_starter: boolean | null
  is_flex: boolean | null
  player: FootballPlayerResponse | null
}

export interface TurnChangedPayload {
  next_turn: DraftTurn | null
  is_draft_complete: boolean
}

export interface TurnSkippedPayload {
  skipped_user_uuid: string
  skipped_user_name: string
  pick: number
}

// ── Track active subscriptions per channel to prevent duplicates ──
const activeChannels = new Set<string>()

// ── Composable ────────────────────────────────────────────────────

export function useDraftChannel(fantasyLeagueUuid: string, currentUserUuid: string) {
  // Reactive state
  const currentTurn = ref<DraftTurn | null>(null)
  const isMyTurn = ref(false)
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
  let onTurnSkippedCb: ((payload: TurnSkippedPayload) => void) | null = null
  let onAutoSkipCb: ((turnUserName: string) => void) | null = null


  // ── Subscriptions (only if not already active) ────────────────

  if (!isAlreadySubscribed) {
    activeChannels.add(channelName)

    channel.presence.enter({ user_uuid: currentUserUuid })

    // 1. Player picked → component removes it from list
    channel.subscribe('player.picked', (msg: { data: unknown }) => {
      const payload = msg.data as PlayerPickedPayload

      // Skip if the current user triggered this pick (already handled locally)
      if (payload.picked_by_user_uuid === currentUserUuid) return

      onPlayerPickedCb?.(payload)
    })

    // 2. Turn changed → update who can pick
    channel.subscribe('turn.changed', (msg: { data: unknown }) => {
      const payload = msg.data as TurnChangedPayload
      currentTurn.value = payload.next_turn
      isDraftComplete.value = payload.is_draft_complete
      isMyTurn.value = payload.next_turn?.user_uuid === currentUserUuid

      // Auto-skip: if the new turn user is not present in the channel, notify
      if (
        payload.next_turn &&
        !payload.is_draft_complete &&
        payload.next_turn.user_uuid !== currentUserUuid &&
        onAutoSkipCb
      ) {
        channel.presence.get((err, members) => {
          if (err || !members) {
            console.error('[Draft] Error checking presence for auto-skip:', err)
            return
          }
          const turnUserUuid = payload.next_turn!.user_uuid
          const isPresent = members.some((m) => (m.data as { user_uuid?: string })?.user_uuid === turnUserUuid)
          if (!isPresent) {
            onAutoSkipCb?.(payload.next_turn!.user_name)
          }
        })
      }
    })

    // 3. Draft activated (when admin activates while user is already in the room)
    channel.subscribe('draft.activated', (msg: { data: unknown }) => {
      const payload = msg.data as { league_uuid: string; initial_turn: DraftTurn | null }
      currentTurn.value = payload.initial_turn
      isMyTurn.value = payload.initial_turn?.user_uuid === currentUserUuid
      onDraftActivatedCb?.(payload.initial_turn)
    })

    // 4. Turn skipped → notify that a turn was skipped
    channel.subscribe('turn.skipped', (msg: { data: unknown }) => {
      const payload = msg.data as TurnSkippedPayload
      onTurnSkippedCb?.(payload)
    })
  }

  // ── Methods ───────────────────────────────────────────────────

  /** Register callback for when a turn is skipped */
  function onTurnSkipped(cb: (payload: TurnSkippedPayload) => void) {
    onTurnSkippedCb = cb
  }

  /** Set the turn on initial load (via REST) */
  function setInitialTurn(turn: DraftTurn | null) {
    currentTurn.value = turn
    isMyTurn.value = turn?.user_uuid === currentUserUuid
  }

  /** Register callback for when a player is picked */
  function onPlayerPicked(cb: (payload: PlayerPickedPayload) => void) {
    onPlayerPickedCb = cb
  }

  /** Register callback for when the draft is activated */
  function onDraftActivated(cb: (initialTurn: DraftTurn | null) => void) {
    onDraftActivatedCb = cb
  }

  /** Register callback for auto-skipping a disconnected user's turn */
  function onAutoSkip(cb: (turnUserName: string) => void) {
    onAutoSkipCb = cb
  }

  // ── Cleanup on component unmount ──────────────────────────────
  onUnmounted(() => {
    channel.presence.leave()
    channel.unsubscribe('player.picked')
    channel.unsubscribe('turn.changed')
    channel.unsubscribe('draft.activated')
    channel.unsubscribe('turn.skipped')
    activeChannels.delete(channelName)
  })

  return {
    currentTurn,
    isMyTurn,
    isDraftComplete,
    setInitialTurn,
    onPlayerPicked,
    onDraftActivated,
    onTurnSkipped,
    onAutoSkip,
  }
}