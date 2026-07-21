import type { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import type { TypeResponse } from "@/interfaces/football/type/TypeResponse";

/** Minimal fixture reference — `starting_at` arrives already localized/formatted. */
export interface PlayerFantasyScoreFixtureRef {
    uuid: string;
    name: string;
    starting_at: string;
}

/**
 * One stat line of the breakdown: the equation `value × points_per_unit = points`.
 * Stats without a scoring rule for the player's position are listed with
 * `has_rule: false`, `points_per_unit: null` and `points: 0` for transparency.
 */
export interface PlayerFantasyScoreStat {
    type: TypeResponse;
    value: number;
    points_per_unit: number | null;
    points: number;
    has_rule: boolean;
}

export interface PlayerFantasyScoreFixture {
    fixture: PlayerFantasyScoreFixtureRef | null;
    total_points: number;
    stats: PlayerFantasyScoreStat[];
}

export interface PlayerFantasyScoreLeagueRef {
    uuid: string;
    name: string;
}

export interface PlayerFantasyScoreDetailResponse {
    fantasy_league: PlayerFantasyScoreLeagueRef;
    round: FantasyRoundResponse;
    player: FootballPlayerResponse;
    /** Auto-consistent sum of the breakdown below. */
    total_points: number;
    /** Official value (== the lineup's fantasy_points). */
    stored_total_points: number;
    fixtures: PlayerFantasyScoreFixture[];
}
