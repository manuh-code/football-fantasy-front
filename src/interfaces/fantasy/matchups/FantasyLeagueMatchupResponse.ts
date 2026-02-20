import { FantasyTeamData } from '../team/FantasyUserTeamResponse';

export interface MatchupTeamData {
    team: FantasyTeamData;
    score: string;
}

export interface FantasyLeagueMatchupResponse {
    uuid: string;
    status: 'pending' | 'completed' | 'cancelled';
    home: MatchupTeamData;
    away: MatchupTeamData;
    winner: string | null;
    is_draw: boolean;
}