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
 * One stat line of the persisted breakdown: the equation
 * `value × points_per_unit = points`. Every entry here already had a scoring
 * rule applied when the score was calculated, so there's no "no rule" case.
 */
export interface PlayerFantasyScoreStat {
    type: TypeResponse;
    value: number;
    points_per_unit: number;
    points: number;
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
    /** The round's total — identical to the lineup/matchup's fantasy_points. */
    total_points: number;
    fixtures: PlayerFantasyScoreFixture[];
}
