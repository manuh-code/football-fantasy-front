export interface FootballPlayerTopScorePayload {
    page: number;
    per_page: number;
    filters: {
        typeUuids: string[];
    };
    sort_direction: 'asc' | 'desc';
    sort_by: string;
}