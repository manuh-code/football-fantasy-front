import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import type { TypeResponse } from "@/interfaces/football/type/TypeResponse";
import type {
    PlayerFantasyScoreFixtureRef,
    PlayerFantasyScoreLeagueRef,
    PlayerFantasyScoreStat,
} from "@/interfaces/fantasy/score/PlayerFantasyScoreDetailResponse";

/**
 * La temporada de un jugador con las reglas de una liga
 * (`GET fantasy/leagues/statistics/{league}/player/{player}`).
 *
 * "Temporada" es exactamente lo que suma su fila en Jugadores: el torneo en
 * curso de la liga —o el anterior si el actual aún no tiene puntos
 * (`scope.is_fallback`)—, así que `summary.total_points`, `total_fixtures` y
 * `average_points` son los mismos números que ya enseña la lista.
 */
export interface PlayerSeasonScoreResponse {
    fantasy_league: PlayerFantasyScoreLeagueRef;
    player: FootballPlayerResponse;
    /** Equipo actual en la plantilla de la temporada — el que pinta la fila. */
    team: PlayerSeasonTeamRef | null;
    /** De qué torneo salen los números. Null si la liga no tiene temporada. */
    scope: PlayerSeasonScope | null;
    summary: PlayerSeasonSummary;
    /** Jornadas que ya arrancaron, en orden de calendario (la primera, primero). */
    rounds: PlayerSeasonRound[];
    /** Toda la temporada sumada por estadística, de más a menos puntos. */
    stats: PlayerSeasonStat[];
    /**
     * El detalle es de Premium (`PREMIUM_FEATURES.fantasyPlayerSeason`): en
     * true, `rounds` y `stats` llegan vacíos por el candado y no porque no
     * haya nada. `summary` viaja completo siempre, así que "sin puntos" se
     * sigue decidiendo con `summary.rounds_played`.
     */
    requires_premium: boolean;
}

export interface PlayerSeasonTeamRef {
    uuid: string;
    name: string;
    short_code: string | null;
    image_path: string | null;
}

export interface PlayerSeasonScope {
    season: { uuid: string; name: string };
    stage: { uuid: string; name: string };
    /** El torneo en curso aún no tiene puntos y se enseña el anterior, como la lista. */
    is_fallback: boolean;
}

export interface PlayerSeasonRoundRef {
    uuid: string;
    /** El número de jornada tal cual lo manda SportMonks ("7"). */
    name: string;
    is_current: boolean;
    finished: boolean;
}

export interface PlayerSeasonSummary {
    total_points: number;
    /** Partidos con puntos — el "PJ" de la lista. */
    total_fixtures: number;
    average_points: number;
    rounds_played: number;
    rounds_count: number;
    best_round: { round: PlayerSeasonRoundRef | null; total_points: number } | null;
    /**
     * Puntos que no explica ninguna estadística: filas calculadas antes de que
     * existiera el desglose. Con él, el desglose sigue sumando el total.
     */
    unattributed_points: number;
}

/**
 * - `played`: tiene puntos en la jornada.
 * - `absent`: jornada cerrada sin una sola fila suya — no jugó.
 * - `pending`: sin puntos en una jornada que aún no se cierra (en curso o con
 *   partidos aplazados): todavía no es un "no jugó".
 */
export type PlayerSeasonRoundStatus = "played" | "absent" | "pending";

export interface PlayerSeasonRound {
    /** Null para un partido que SportMonks dejó sin jornada (algunas eliminatorias). */
    round: PlayerSeasonRoundRef | null;
    status: PlayerSeasonRoundStatus;
    total_points: number;
    fixtures: PlayerSeasonFixture[];
}

export interface PlayerSeasonFixture {
    fixture: PlayerFantasyScoreFixtureRef | null;
    opponent: PlayerSeasonTeamRef | null;
    /** Dónde jugó el equipo del jugador. */
    location: "home" | "away" | null;
    /** Solo en partidos terminados, visto desde el equipo del jugador. */
    result: PlayerSeasonFixtureResult | null;
    total_points: number;
    stats: PlayerFantasyScoreStat[];
}

export interface PlayerSeasonFixtureResult {
    goals_for: number;
    goals_against: number;
    outcome: "win" | "draw" | "loss";
}

export interface PlayerSeasonStat {
    type: TypeResponse;
    value: number;
    /** Null si no fue el mismo en todos los partidos (cambió de posición). */
    points_per_unit: number | null;
    points: number;
    /** En cuántos partidos puntuó esta estadística. */
    fixtures: number;
}
