import type { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'

/**
 * Formas normalizadas que comparten el draft real y el mock draft.
 *
 * Los dos drafts modelan a sus participantes de forma distinta —el real son
 * usuarios (uuid, avatar, presencia); el mock son slots con nombre de bot— y a
 * sus picks también. En vez de duplicar cada componente de la sala una vez por
 * draft, ambos traducen sus datos a estas formas y comparten la misma UI.
 */

/** Un participante de la sala: un usuario real o un bot del mock. */
export interface DraftContender {
  /** uuid del usuario en el draft real; el slot como texto en el mock. */
  key: string
  name: string
  initials: string
  avatar: string | null
  /** Si eres tú, para resaltarte en toda la sala. */
  isMe: boolean
  /** Solo el draft real tiene presencia; en el mock siempre es `true`. */
  isOnline: boolean
}

/** Un fichaje ya realizado, listo para pintar en el board o en la tabla. */
export interface DraftBoardPick {
  pick: number
  round: number
  /** Posición dentro de la ronda (1-based), ya resuelta con el orden serpiente. */
  pickInRound: number
  contenderKey: string
  player: FootballPlayerResponse | null
  /** Código de posición en minúsculas: goalkeeper | defender | midfielder | attacker. */
  positionCode: string | null
  autoPicked: boolean
}

/** Un hueco del board: o tiene pick, o está pendiente/en el reloj. */
export interface DraftBoardSlot {
  pick: number
  round: number
  pickInRound: number
  contender: DraftContender | null
  pickData: DraftBoardPick | null
  isCurrent: boolean
}

/**
 * Paleta por posición, compartida por el board y la tabla de picks para que un
 * mismo jugador se vea igual en toda la aplicación.
 */
const POSITION_CLASSES: Record<string, { pill: string; border: string; badge: string }> = {
  goalkeeper: {
    pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  defender: {
    pill: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-600',
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  midfielder: {
    pill: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-600',
    badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  attacker: {
    pill: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-600',
    badge: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  },
}

const DEFAULT_POSITION = {
  pill: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  border: 'border-gray-200 dark:border-gray-600',
  badge: 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
}

/**
 * Normaliza el código de posición: el draft real trae `developer_name` en
 * mayúsculas (ATTACKER) y el mock trae `code` en minúsculas (attacker).
 */
export function normalizePositionCode(code?: string | null): string | null {
  return code ? code.toLowerCase() : null
}

export function positionPillClass(code?: string | null): string {
  const key = normalizePositionCode(code)
  return (key && POSITION_CLASSES[key]?.pill) ?? DEFAULT_POSITION.pill
}

export function positionBorderClass(code?: string | null): string {
  const key = normalizePositionCode(code)
  return (key && POSITION_CLASSES[key]?.border) ?? DEFAULT_POSITION.border
}

export function positionBadgeClass(code?: string | null): string {
  const key = normalizePositionCode(code)
  return (key && POSITION_CLASSES[key]?.badge) ?? DEFAULT_POSITION.badge
}

/** Iniciales a partir de un nombre completo o de nombre + apellido. */
export function initialsFrom(first?: string | null, last?: string | null): string {
  const initials = `${first?.charAt(0) ?? ''}${last?.charAt(0) ?? ''}`.toUpperCase()
  return initials || '?'
}

export function playerInitials(player?: FootballPlayerResponse | null): string {
  if (!player?.display_name) return '?'
  const parts = player.display_name.split(' ').filter(Boolean)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : player.display_name.substring(0, 2).toUpperCase()
}

export function playerShortName(player?: FootballPlayerResponse | null): string {
  return player?.common_name || player?.display_name || '—'
}
