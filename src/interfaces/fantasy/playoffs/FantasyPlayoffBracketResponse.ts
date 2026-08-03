import { FantasyTeamData } from "../team/FantasyUserTeamResponse";
import { FantasyRoundResponse } from "../rounds/FantasyRoundResponse";

/** Cómo se corona al campeón de una liga fantasy. */
export type FantasyChampionMode = "standings" | "playoffs";

export interface FantasyPlayoffUser {
  uuid: string | null;
  name: string | null;
}

/**
 * Un lado del cruce. `aggregate` es el global de la eliminatoria (ida + vuelta),
 * no el marcador de una jornada suelta.
 */
export interface FantasyPlayoffSide {
  team: FantasyTeamData;
  user: FantasyPlayoffUser;
  seed: number | null;
  aggregate: string;
  is_winner: boolean;
}

/** Ida o vuelta de una serie: un matchup normal de la jornada que le toca. */
export interface FantasyPlayoffLeg {
  leg: number | null;
  status: "pending" | "in_progress" | "completed";
  home_score: string;
  away_score: string;
  round: FantasyRoundResponse | null;
}

/**
 * Nodo del cuadro. `home` / `away` llegan en null mientras el cruce esté por
 * definirse, que es cuando la vista pinta un hueco en vez de un participante.
 */
export interface FantasyPlayoffSeries {
  uuid: string;
  round: number;
  slot: number;
  status: "pending" | "in_progress" | "completed";
  home: FantasyPlayoffSide | null;
  away: FantasyPlayoffSide | null;
  winner: FantasyTeamData | null;
  legs: FantasyPlayoffLeg[] | null;
}

export interface FantasyPlayoffRound {
  round: number;
  /** Nombre ya localizado por la API ("Semifinales", "Final"…). */
  name: string;
  series: FantasyPlayoffSeries[];
}

export interface FantasyPlayoffBracketResponse {
  champion_mode: FantasyChampionMode;
  playoff_teams: number | null;
  bracket_rounds: number;
  is_regular_season_over: boolean;
  /** false mientras la temporada regular no haya sembrado el cuadro. */
  has_started: boolean;
  champion: FantasyTeamData | null;
  rounds: FantasyPlayoffRound[];
}
