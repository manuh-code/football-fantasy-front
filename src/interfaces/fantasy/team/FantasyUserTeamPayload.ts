export interface FantasyUserTeamPayload {
    fantasy_league_uuid: string;
    team_name: string;
    initials: string;
    image?: File | null;
}