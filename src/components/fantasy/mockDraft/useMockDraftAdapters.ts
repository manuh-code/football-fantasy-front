import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { initialsFrom, normalizePositionCode } from '@/components/fantasy/draft/shared/draftShared'
import type { DraftBoardPick, DraftContender } from '@/components/fantasy/draft/shared/draftShared'
import type { SearchFormation } from '@/components/user/fantasy/searchFormation'
import type { MockDraftResponse } from '@/interfaces/fantasy/mockDraft/MockDraftResponse'
import type { TypeResponse } from '@/interfaces/football/type/TypeResponse'

/**
 * Traduce el estado del mock draft a las formas neutras que consumen los
 * componentes compartidos de la sala (board, tabla de picks, buscador).
 *
 * Vive aparte de la vista porque es pura traducción de datos: la sala se queda
 * con la orquestación y aquí no hay nada que revisar salvo el mapeo.
 */
export function useMockDraftAdapters(
  draft: ComputedRef<MockDraftResponse | null>,
  visiblePicks: ComputedRef<MockDraftResponse['picks']>,
  positions: ComputedRef<TypeResponse[]>,
) {
  /** Equipos del mock como participantes de la sala. Los bots siempre "en línea". */
  const contenders = computed<DraftContender[]>(() =>
    (draft.value?.teams ?? []).map((team) => ({
      key: String(team.slot),
      name: team.name,
      initials: team.initials,
      avatar: null,
      isMe: team.is_user,
      isOnline: true,
    })),
  )

  /** Picks del mock en la forma que entienden el board y la tabla. */
  const boardPicks = computed<DraftBoardPick[]>(() =>
    visiblePicks.value.map((pick) => ({
      pick: pick.pick,
      round: pick.round,
      // El board deriva la posición dentro de la ronda del propio número de
      // pick, así que basta con reconstruirla igual que lo hace el servidor.
      pickInRound: draft.value?.teams_count
        ? ((pick.pick - 1) % draft.value.teams_count) + 1
        : pick.pick,
      contenderKey: String(pick.team_slot),
      player: pick.player,
      positionCode: normalizePositionCode(pick.position?.code),
      autoPicked: pick.auto_picked,
    })),
  )

  /**
   * Formación para los filtros por posición del buscador: cruza los cupos del
   * mock con los uuids del catálogo de tipos, que es lo que la API espera para
   * filtrar.
   */
  const searchFormation = computed<SearchFormation | null>(() => {
    const formation = draft.value?.formation
    if (!formation || positions.value.length === 0) return null

    const uuidFor = (code: string) => positions.value.find((type) => type.code === code)?.uuid

    const slot = (code: keyof SearchFormation) => {
      const uuid = uuidFor(code)
      return uuid ? { uuid, starter: formation[code] ?? 0 } : undefined
    }

    return {
      goalkeeper: slot('goalkeeper'),
      defender: slot('defender'),
      midfielder: slot('midfielder'),
      attacker: slot('attacker'),
    }
  })

  return { contenders, boardPicks, searchFormation, initialsFrom }
}
