import type { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'
import type { DraftRankingEntry } from '@/interfaces/fantasy/draft/DraftResults'

/**
 * La calificación de la plantilla ACTUAL, disponible durante toda la temporada.
 *
 * Comparte fórmula y encabezado con la boleta del draft (`DraftResults`), pero
 * se calcula sobre el lineup vigente en vez de los picks, así que sigue al
 * equipo cuando se mueve con traspasos y altas.
 */

/** Código de la línea, tal cual lo devuelve el backend (clave de i18n). */
export type RosterPositionCode = 'goalkeeper' | 'defender' | 'midfielder' | 'attacker'

/** Un jugador de la plantilla con sus puntos de referencia de temporada. */
export interface RosterGradePlayer {
  position_code: RosterPositionCode | string | null
  is_starter: boolean
  is_flex: boolean
  total_points: number
  player: FootballPlayerResponse | null
}

/** Fuerza de una línea del once frente a la media de los rivales. */
export interface RosterGradeLine {
  code: RosterPositionCode | string
  /** Titulares del usuario en esa línea; el backend omite las líneas vacías. */
  players: number
  points: number
  rivals_average: number
  difference: number
  grade: string
}

export interface RosterGrade {
  fantasy_league_uuid: string
  round: { uuid: string; name: string | null }
  /**
   * `false` cuando la liga entera está en cero (la temporada de referencia no
   * se ha puntuado). La nota existe pero no significa nada: hay que decirlo.
   */
  scored: boolean
  user_position: number
  user_points: number
  rivals_average: number
  difference: number
  /** A+ | A | B+ | B | C+ | C | D — relativa a la media de la liga. */
  grade: string
  ranking: DraftRankingEntry[]
  bench_points: number
  by_position: RosterGradeLine[]
  best_player: RosterGradePlayer | null
  roster: RosterGradePlayer[]
}
