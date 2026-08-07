/** A player as they appear in a ranking — identity only, no biometrics. */
export interface RankedPlayer {
    uuid: string;
    display_name: string;
    image_path: string | null;
    /** Translated position name; absent when the player has none on record. */
    position?: string | null;
}

export interface FootballStatisticDetail {
    player: RankedPlayer;
    value: string;
}

export interface FootballPlayerStatisticByStageResponse {
    /** Stable select key ("GOALS"), safe to compare and to send back to the API. */
    key: string;
    /** Translated label ("Goles"). */
    type: string;
    /** Translated group label ("Ofensivo"). */
    stat_group: string;
    /** Stable group key ("offensive"). */
    stat_group_key: string;
    /** Players in the full ranking, regardless of how many came back. */
    total: number;
    statistics: FootballStatisticDetail[];
}

/** One selectable statistic, as offered by the stage's available-stats endpoint. */
export interface PlayerStatisticOption {
    key: string;
    name: string;
    stat_group: string;
    stat_group_key: string;
}
