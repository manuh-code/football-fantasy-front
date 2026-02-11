export interface FootballPlayerFantasyPointsFilters {
    team_uuids: string[] | null;
    position_uuids: string[] | null;
    stage_uuids: string[];
}

export interface FootballPlayerFantasyPointsPayload {
    page: number;
    per_page: number;
    filters: FootballPlayerFantasyPointsFilters;
    sort_direction: 'asc' | 'desc';
    sort_by: string;
}