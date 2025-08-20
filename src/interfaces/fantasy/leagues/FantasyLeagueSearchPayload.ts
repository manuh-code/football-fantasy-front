export interface FantasyLeagueSearchPayload {
    filters: {
        search?: string | null;
        isPrivate?: boolean;
        skipJoinedUser?: boolean;
    };
}