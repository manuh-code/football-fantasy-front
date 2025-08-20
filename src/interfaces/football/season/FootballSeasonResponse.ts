export interface FootballSeasonResponse {
    uuid: string;
    name: string;
    finished: boolean;
    pending: boolean;
    is_current: boolean;
    starting_at: string; // ISO 8601 date string
    ending_at: string; // ISO 8601 date string
    standings_recalculated_at: string; // ISO 8601 date string
    games_in_current_week: boolean;
}