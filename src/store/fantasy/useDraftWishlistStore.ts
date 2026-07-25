import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'

/**
 * Pre-draft "wishlist" (lista de deseos) — a client-only shortlist the user
 * builds while the draft is live so they can pick their targets faster.
 *
 * It hits NO API: entries live only in this store (persisted to localStorage so
 * they survive a refresh mid-draft) and are keyed by fantasy-league UUID so two
 * concurrent drafts never bleed into each other. Entries are removed as players
 * get drafted (by anyone) and the whole list is cleared when the draft ends.
 */
export const useDraftWishlistStore = defineStore(
  'draftWishlist',
  () => {
    // { [fantasyLeagueUuid]: FantasyPlayerDraftResponse[] }
    const wishlists = ref<Record<string, FantasyPlayerDraftResponse[]>>({})

    /** Players wishlisted for a league, in the order they were starred. */
    function items(leagueUuid: string): FantasyPlayerDraftResponse[] {
      return wishlists.value[leagueUuid] ?? []
    }

    function count(leagueUuid: string): number {
      return wishlists.value[leagueUuid]?.length ?? 0
    }

    function has(leagueUuid: string, playerUuid: string): boolean {
      return (wishlists.value[leagueUuid] ?? []).some(
        (p) => p.player.uuid === playerUuid,
      )
    }

    function add(leagueUuid: string, player: FantasyPlayerDraftResponse): void {
      const list = wishlists.value[leagueUuid] ?? []
      if (list.some((p) => p.player.uuid === player.player.uuid)) return
      // Reassign the key so the persist plugin + reactivity pick up the change.
      wishlists.value = {
        ...wishlists.value,
        [leagueUuid]: [...list, player],
      }
    }

    function remove(leagueUuid: string, playerUuid: string): void {
      const list = wishlists.value[leagueUuid]
      if (!list?.length) return
      wishlists.value = {
        ...wishlists.value,
        [leagueUuid]: list.filter((p) => p.player.uuid !== playerUuid),
      }
    }

    /** Add if absent, remove if present. Returns the resulting membership. */
    function toggle(
      leagueUuid: string,
      player: FantasyPlayerDraftResponse,
    ): boolean {
      if (has(leagueUuid, player.player.uuid)) {
        remove(leagueUuid, player.player.uuid)
        return false
      }
      add(leagueUuid, player)
      return true
    }

    /** Drop the whole list for a league — call when its draft finishes. */
    function clear(leagueUuid: string): void {
      if (!(leagueUuid in wishlists.value)) return
      const next = { ...wishlists.value }
      delete next[leagueUuid]
      wishlists.value = next
    }

    return {
      wishlists,
      items,
      count,
      has,
      add,
      remove,
      toggle,
      clear,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['wishlists'],
    },
  },
)
