import { ref, computed, watch, onUnmounted } from 'vue'
import { useDraftTimer } from './useDraftTimer'
import { useAblyBroadcast } from './broadcast/useAblyBroadcast'
import { useUserStore, useFantasyLeagueDetailStore } from '@/store'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyLeaguesResponse } from '@/interfaces/fantasy/leagues/FantasyLeaguesResponse'
import type { DraftTurn, TurnChangedPayload, PlayerPickedPayload } from './useDraftChannel'

export function useDraft(fantasyLeagueUuid: string, draftActive: boolean) {
    const { draftFantasyLeagueChannel } = useAblyBroadcast()
    const channel = draftFantasyLeagueChannel(fantasyLeagueUuid)
    const userData = useUserStore().userData
    const leagueDetailStore = useFantasyLeagueDetailStore()

    // ── State ───────────────────────────────────────────────────
    const league = ref<FantasyLeaguesResponse | null>(null)
    const currentTurn = ref<DraftTurn | null>(null)
    const onlineUserUuids = ref<string[]>([])

    // ── Timer ───────────────────────────────────────────────────
    const {
        timeRemaining,
        timerExpired,
        timerProgress,
        formattedTime,
        timerUrgency,
        syncWithTurn,
        stop: stopTimer,
    } = useDraftTimer()

    // ── Derived state ───────────────────────────────────────────
    const isDraftComplete = computed(
        () => league.value?.draft?.status?.value === 'completed',
    )
    const isMyTurn = computed(
        () => currentTurn.value?.user_uuid === userData?.uuid,
    )

    // ── API calls ───────────────────────────────────────────────

    async function loadLeague(): Promise<FantasyLeaguesResponse> {
        league.value = await fantasyLeagueService.showFantasyLeague(fantasyLeagueUuid)
        leagueDetailStore.setCurrentLeague(league.value)
        return league.value
    }

    async function loadCurrentTurn(): Promise<DraftTurn | null> {
        if (isDraftComplete.value) return null
        currentTurn.value = await fantasyLeagueService.getCurrentDraftTurn(fantasyLeagueUuid)
        syncWithTurn(currentTurn.value)
        return currentTurn.value
    }

    async function skipTurn(): Promise<void> {
        try {
            await fantasyLeagueService.skipDraftTurn(fantasyLeagueUuid)
        } catch (e) {
            console.error('[Draft] Fallback skip failed:', e)
        }
    }

    // ── Fallback auto-skip when timer expires on client ─────────
    let skipFallbackTimeout: ReturnType<typeof setTimeout> | null = null

    watch(timerExpired, (expired) => {
        if (skipFallbackTimeout) {
            clearTimeout(skipFallbackTimeout)
            skipFallbackTimeout = null
        }
        if (expired && isMyTurn.value) {
            skipFallbackTimeout = setTimeout(() => skipTurn(), 3000)
        }
    })

    // ── Presence management ─────────────────────────────────────

    function syncOnlineMembers() {
        channel.presence.get((err, members) => {
            if (err) {
                console.error('Error getting presence:', err)
                return
            }
            if (members) {
                onlineUserUuids.value = members
                    .map((m) => m.data?.uuid as string)
                    .filter(Boolean)
            }
        })
    }

    function enterPresence() {
        channel.presence.enter({
            uuid: userData?.uuid,
            name: userData?.firstname,
            avatar: userData?.avatar,
        })
    }

    function setupPresenceListeners() {
        channel.presence.subscribe('enter', (member) => {
            const uuid = member.data?.uuid as string
            if (uuid && !onlineUserUuids.value.includes(uuid)) {
                onlineUserUuids.value = [...onlineUserUuids.value, uuid]
            }
        })

        channel.presence.subscribe('leave', (member) => {
            const uuid = member.data?.uuid as string
            if (uuid) {
                onlineUserUuids.value = onlineUserUuids.value.filter((id) => id !== uuid)
            }
        })

        channel.presence.subscribe('present', () => {
            syncOnlineMembers()
        })
    }

    // ── Channel event handlers ──────────────────────────────────

    function setupChannelListeners(callbacks?: {
        onPlayerPicked?: (payload: PlayerPickedPayload) => void
    }) {
        channel.subscribe('draft.activated', async () => {
            await loadLeague()
            if (!isDraftComplete.value) {
                await loadCurrentTurn()
            }
        })

        channel.subscribe('turn.changed', async (message) => {
            const payload = message.data as TurnChangedPayload

            if (payload.is_draft_complete && !payload.next_turn) {
                // Double-check with backend before marking draft as complete
                try {
                    const verifyTurn = await fantasyLeagueService.getCurrentDraftTurn(fantasyLeagueUuid)
                    if (verifyTurn && (verifyTurn as DraftTurn).user_uuid) {
                        // Backend still has an active turn — not actually complete
                        currentTurn.value = verifyTurn as DraftTurn
                        syncWithTurn(verifyTurn as DraftTurn)
                        return
                    }
                } catch (error: unknown) {
                    console.error('[Draft] Verification of draft completion failed:', error)
                }

                // Truly completed — update league status locally
                league.value = league.value
                    ? {
                        ...league.value,
                        draft: league.value.draft
                            ? { ...league.value.draft, status: { ...league.value.draft.status, value: 'completed' } }
                            : league.value.draft,
                    }
                    : null
                stopTimer()
            } else {
                currentTurn.value = payload.next_turn
                syncWithTurn(payload.next_turn)
            }
        })

        channel.subscribe('player.picked', (message) => {
            const payload = message.data as PlayerPickedPayload
            callbacks?.onPlayerPicked?.(payload)
        })
    }

    // ── Lifecycle ───────────────────────────────────────────────

    function cleanup() {
        if (skipFallbackTimeout) {
            clearTimeout(skipFallbackTimeout)
            skipFallbackTimeout = null
        }
        stopTimer()
        channel.presence.leave()
        channel.detach()
    }

    async function init(callbacks?: {
        onPlayerPicked?: (payload: PlayerPickedPayload) => void
    }) {
        await loadLeague()

        if (draftActive && !isDraftComplete.value) {
            await loadCurrentTurn()
        }

        setupPresenceListeners()
        enterPresence()
        setupChannelListeners(callbacks)
        syncOnlineMembers()
    }

    /** Called when draftActive changes from false → true externally */
    async function onDraftActivated() {
        await loadLeague()
        if (!isDraftComplete.value) {
            await loadCurrentTurn()
        }
    }

    onUnmounted(cleanup)

    return {
        // State
        league,
        currentTurn,
        onlineUserUuids,

        // Derived
        isDraftComplete,
        isMyTurn,

        // Timer
        timeRemaining,
        timerExpired,
        timerProgress,
        formattedTime,
        timerUrgency,

        // Methods
        init,
        cleanup,
        loadLeague,
        loadCurrentTurn,
        onDraftActivated,
    }
}