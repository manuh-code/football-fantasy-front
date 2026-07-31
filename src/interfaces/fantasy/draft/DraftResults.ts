import type { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'

/**
 * La boleta de un draft. El mock draft y el draft real devuelven exactamente
 * esta forma (el backend la construye con DraftGradeService en ambos casos),
 * así que un único componente pinta las dos.
 */

export interface DraftRankingEntry {
  position: number
  /** uuid del usuario en el draft real; el slot como texto en el mock. */
  key: string
  name: string
  initials: string
  avatar: string | null
  is_user: boolean
  total_points: number
}

/** Un pick con los puntos de temporada del jugador que se fichó. */
export interface DraftResultsPick {
  pick: number
  round: number
  total_points: number
  player: FootballPlayerResponse | null
}

export interface DraftResults {
  user_position: number
  user_points: number
  rivals_average: number
  difference: number
  /** A+ | A | B+ | B | C+ | C | D — relativa a la media de la sala. */
  grade: string
  ranking: DraftRankingEntry[]
  roster: DraftResultsPick[]
  best_pick: DraftResultsPick | null
}
