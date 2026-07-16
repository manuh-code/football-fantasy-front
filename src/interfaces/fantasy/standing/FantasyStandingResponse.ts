import { FantasyTeamData } from '../team/FantasyUserTeamResponse';

export interface FantasyUser {
    uuid: string;
    name: string;
}

export interface FantasyStandingResponse {
    position: number;
    team: FantasyTeamData;
    user: FantasyUser;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points_for: number;
    points_against: number;
}
