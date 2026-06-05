import { FootballPlayerResponse } from "./FootballPlayerResponse";
import { FootballSeasonResponse } from "../season/FootballSeasonResponse";
import { TypeResponse } from "../type/TypeResponse";

/** A single stat metric. The API always returns scalar values. */
export type StatScalar = number | string | boolean | null ;

/**
 * Stat values are a dynamic key→value map: the API returns very varied metrics
 * depending on the stat type (total, average, scored, won, saved, …), so the
 * keys are not fixed. `total` is kept as a hint (it can be a formatted string),
 * and any other key may appear via the index signature.
 */
export interface StatValue {
    total?: number | string;
    [key: string]: StatScalar | undefined;
}

export interface Stat {
    type: TypeResponse;
    value: StatValue;
}

export interface StatDetail {
    stat_group: string;
    stats: Stat[];
}

export interface PlayerStatistics {
    jersey_number: number;
    season: FootballSeasonResponse;
    position: TypeResponse;
    details: StatDetail[];
}

export interface PlayerVersusData {
    player: FootballPlayerResponse;
    statistics: PlayerStatistics[];
}

export interface FootballPlayerVersusResponse {
    first_player: PlayerVersusData;
    second_player: PlayerVersusData;
}
