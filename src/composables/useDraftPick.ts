import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import { fantasyLeagueService } from '@/services/fantasy/leagues/FantasyLeagueService'
import type { FantasyPlayerDraftResponse } from '@/interfaces/fantasy/draft/FantasyPlayerDraftResponse'
import type { FantasyAddPlayerPayload } from '@/interfaces/fantasy/draft/FantasyAddPlayerPayload'

/**
 * Encapsulates the "pick this player during the draft" action so it can be
 * triggered from several places (the search list and the wishlist) with
 * identical behaviour: one in-flight guard per player, a success toast and a
 * centralized error toast.
 *
 * The board / drawer / list cleanup after a successful pick is intentionally
 * NOT done here — it arrives through the Ably `player.selected` echo that the
 * draft room already listens to, so every pick (mine or a rival's) updates the
 * UI through a single path.
 */
export function useDraftPick(
  getLeagueUuid: () => string | undefined,
  /**
   * Cómo se ejecuta el pick. Por defecto llama al endpoint del draft real; el
   * mock draft pasa el suyo, que además desencadena la ráfaga de bots.
   */
  pickHandler?: (player: FantasyPlayerDraftResponse) => Promise<void>,
) {
  const toast = useToast()
  const { t } = useI18n()

  const pickingUuids = ref<Set<string>>(new Set())

  const isPicking = (playerUuid: string): boolean =>
    pickingUuids.value.has(playerUuid)

  async function pickPlayer(
    player: FantasyPlayerDraftResponse,
  ): Promise<boolean> {
    const leagueUuid = getLeagueUuid()
    if (!leagueUuid || isPicking(player.player.uuid)) return false

    pickingUuids.value.add(player.player.uuid)
    try {
      const payload: FantasyAddPlayerPayload = {
        fantasy_league_uuid: leagueUuid,
        player_uuid: player.player.uuid,
        player_uuid_change: null,
        position_uuid: player.position.uuid,
        is_flex: null,
        is_starter: null,
      }

      if (pickHandler) {
        await pickHandler(player)
      } else {
        await fantasyLeagueService.pickerPlayer(payload)
      }

      toast.success(
        t('fantasy.search.pickedTitle'),
        t('fantasy.search.pickedBody', { name: player.player.display_name }),
        { duration: 3000 },
      )
      return true
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('fantasy.search.errorAddingPlayer')
      toast.error(t('errors.generic.title'), errorMessage)
      console.error('Error picking player:', errorMessage)
      return false
    } finally {
      pickingUuids.value.delete(player.player.uuid)
    }
  }

  return { pickPlayer, isPicking }
}
