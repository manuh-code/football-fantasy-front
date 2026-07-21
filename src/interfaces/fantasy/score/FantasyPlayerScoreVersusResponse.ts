import type { FantasyLeaguesResponse } from "@/interfaces/fantasy/leagues/FantasyLeaguesResponse";
import type { FantasyRoundResponse } from "@/interfaces/fantasy/rounds/FantasyRoundResponse";
import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import type { TypeResponse } from "@/interfaces/football/type/TypeResponse";

/** Which side leads a duel (a total or a single stat). `null` means a tie. */
export type FantasyVersusLeader = "one" | "two" | null;

/** Minimal fixture reference — `starting_at` arrives already localized/formatted. */
export interface FantasyPlayerScoreVersusFixture {
    uuid: string;
    name: string;
    starting_at: string;
}

/** Headline totals for the duel. `difference` is the absolute gap between totals. */
export interface FantasyPlayerScoreVersusSummary {
    one_total: number;
    two_total: number;
    difference: number;
    leader: FantasyVersusLeader;
}

/** One side of the duel: the player, their round total, and the fixtures behind it. */
export interface FantasyPlayerScoreVersusSide {
    player: FootballPlayerResponse;
    total_points: number;
    fixtures: FantasyPlayerScoreVersusFixture[];
}

/** A single stat's raw value and the fantasy points it yielded, for one side. */
export interface FantasyPlayerScoreVersusStatSide {
    value: number;
    points: number;
}

/**
 * One aligned stat row across both players — a union by type, so the side that
 * doesn't have the stat comes back at 0. `points_difference` is
 * `one.points - two.points`; rows arrive ordered by relevance (highest points).
 */
export interface FantasyPlayerScoreVersusStat {
    type: TypeResponse;
    one: FantasyPlayerScoreVersusStatSide;
    two: FantasyPlayerScoreVersusStatSide;
    points_difference: number;
    leader: FantasyVersusLeader;
}

export interface FantasyPlayerScoreVersusResponse {
    fantasy_league: FantasyLeaguesResponse;
    round: FantasyRoundResponse;
    summary: FantasyPlayerScoreVersusSummary;
    player_one: FantasyPlayerScoreVersusSide;
    player_two: FantasyPlayerScoreVersusSide;
    stats: FantasyPlayerScoreVersusStat[];
}
