import { FootballPlayerResponse } from '@/interfaces/football/player/FootballPlayerResponse'
import { FootballTeamResponse } from '@/interfaces/football/team/FootballTeamResponse'
import { TypeResponse } from '@/interfaces/football/type/TypeResponse'

/** Cupos por posición de la formación con la que se juega el mock. */
export interface MockDraftFormation {
  goalkeeper: number
  defender: number
  midfielder: number
  attacker: number
  flex: number
  bench: number
}

/** Un fichaje del mock draft, ya hidratado por el backend. */
export interface MockDraftPick {
  pick: number
  round: number
  team_slot: number
  team_name: string | null
  is_user: boolean
  auto_picked: boolean
  /** Dónde entra el jugador: 'starter' | 'flex' | 'bench'. */
  slot: string
  is_starter: boolean
  is_flex: boolean
  total_points: number
  picked_at: string
  player: FootballPlayerResponse | null
  team: FootballTeamResponse | null
  position: TypeResponse | null
}

/** Un equipo de la sala: o eres tú, o es un bot. */
export interface MockDraftTeam {
  slot: number
  name: string
  initials: string
  is_user: boolean
  counts: MockDraftFormation
  total_points: number
  roster: MockDraftPick[]
}

/** Instantánea completa del mock draft — todo lo que la sala necesita pintar. */
export interface MockDraftResponse {
  uuid: string
  status: 'ACTIVE' | 'COMPLETED'
  difficulty: string
  teams_count: number
  rounds: number
  total_picks: number
  snake_order: boolean
  pick_timer: number
  user_slot: number
  formation: MockDraftFormation
  football_league_uuid: string | null
  /** Temporada del mock — permite filtrar el pool por equipo. */
  football_season_uuid: string | null
  fantasy_league_uuid: string | null
  fantasy_league_name: string | null
  created_at: string | null
  finished_at: string | null

  current_pick: number | null
  current_round: number | null
  current_slot: number | null
  is_user_turn: boolean
  /** Timestamp unix con decimales — misma referencia que el draft real. */
  turn_started_at: number | null
  /** `null` cuando el mock se creó sin límite de tiempo. */
  duration_seconds: number | null
  time_remaining: number | null

  teams: MockDraftTeam[]
  picks: MockDraftPick[]
}

/**
 * Respuesta de un pick: los fichajes que acaban de ocurrir (el tuyo más la
 * ráfaga de bots que le siguió) y la instantánea resultante. Llegan juntos para
 * que la sala pueda animar la secuencia sin pedir nada más.
 */
export interface MockDraftPickResponse {
  new_picks: MockDraftPick[]
  draft: MockDraftResponse
}

/** Fila del listado de mocks recientes. */
export interface MockDraftSummary {
  uuid: string
  status: 'ACTIVE' | 'COMPLETED'
  difficulty: string
  teams_count: number
  rounds: number
  user_slot: number
  pick_timer: number
  fantasy_league_uuid: string | null
  fantasy_league_name: string | null
  created_at: string | null
  finished_at: string | null
  picks_made: number
  total_picks: number
}

/** Opciones válidas del formulario de configuración, servidas por el backend. */
export interface MockDraftOptions {
  teams: { min: number; max: number; default: number }
  pick_timer: { default: number; options: number[] }
  difficulties: string[]
  default_difficulty: string
  formation: MockDraftFormation
}

/** Configuración con la que se crea un mock draft. */
export interface MockDraftCreatePayload {
  /** Preset: copia scoring, formación y participantes de una liga tuya. */
  fantasy_league_uuid?: string | null
  football_league_uuid?: string | null
  teams_count?: number
  /** Tu posición en el orden (0-based). Omitir = al azar. */
  user_slot?: number | null
  pick_timer?: number
  snake_order?: boolean
  difficulty?: string
}
