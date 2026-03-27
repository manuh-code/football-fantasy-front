

import { onUnmounted } from 'vue'
import type { Types } from 'ably'
import { useAblyBroadcast } from './broadcast/useAblyBroadcast'

// ── Types for draft events ─────────────────────────────────────

/** Represents the current draft turn state from the backend */
export interface DraftTurn {
    user_uuid:       string
    user_name:       string
    pick:            number
    round:           number
    pick_in_round:   number
    pick_timer:      number    // Duration in seconds for this turn
    turn_started_at: number    // Unix timestamp (float) when turn began
}

/** Payload for the turn.changed event */
export interface TurnChangedPayload {
    next_turn:         DraftTurn | null
    is_draft_complete: boolean
}

/** Payload for the player.picked event */
export interface PlayerPickedPayload {
    player_uuid:         string
    picked_by_user_uuid: string
    pick:                number
    round:               number
}

/** Payload for the draft.activated event */
export interface DraftActivatedPayload {
    fantasy_league_uuid: string
}

// ── Legacy event payloads (kept for backward compatibility) ─────

export interface TurnStartedPayload {
    pick:             number
    round:            number
    user_id:          number
    turn_started_at:  number
    duration_seconds: number
}

export interface PlayerSelectedPayload {
    pick:        number
    round:       number
    user_id:     number
    player_id:   number
    player_name: string
    picked_at:   string
}

export interface TurnSkippedPayload {
    pick:    number
    user_id: number
}

// ── Channel composable ─────────────────────────────────────────

type DraftEvent =
    | 'draft.activated'
    | 'turn.changed'
    | 'player.picked'
    | 'turn.started'
    | 'player.selected'
    | 'turn.skipped'
    | 'draft.finished'
    | 'draft.started'

export function useDraftChannel(draftUuid: string) {
    const { ably } = useAblyBroadcast()

    const channel = ably.channels.get(`draft-${draftUuid}`)

    function on(event: 'draft.activated',  cb: (data: DraftActivatedPayload) => void): void
    function on(event: 'turn.changed',     cb: (data: TurnChangedPayload)    => void): void
    function on(event: 'player.picked',    cb: (data: PlayerPickedPayload)   => void): void
    function on(event: 'turn.started',     cb: (data: TurnStartedPayload)    => void): void
    function on(event: 'player.selected',  cb: (data: PlayerSelectedPayload) => void): void
    function on(event: 'turn.skipped',     cb: (data: TurnSkippedPayload)    => void): void
    function on(event: 'draft.finished',   cb: (data: any)                   => void): void
    function on(event: 'draft.started',    cb: (data: any)                   => void): void
    function on(event: string, cb: (data: any) => void): void {
        channel.subscribe(event, (msg: Types.Message) => cb(msg.data))
    }

    function off(event?: string) {
        event ? channel.unsubscribe(event) : channel.unsubscribe()
    }

    onUnmounted(() => {
        channel.unsubscribe()
    })

    return { channel, on, off }
}