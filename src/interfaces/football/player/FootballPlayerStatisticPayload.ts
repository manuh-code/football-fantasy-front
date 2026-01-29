export interface FootballPlayerStatisticPayload {
    page: number;
    per_page: number;
    filters: {
        statisticUuids: string[] | null;
        teamsUuids: string[] | null;
        name: string | null;
    };
    sort_direction: string | null;
    sort_by: string | null;
}