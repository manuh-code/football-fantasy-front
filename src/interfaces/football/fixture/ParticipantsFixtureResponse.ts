import { FootballTeamResponse } from '../team/FootballTeamResponse';

export interface ParticipantsFixtureResponse {
    participants: Participant[];
}

export interface Participant {
    team: FootballTeamResponse;
    meta: ParticipantMeta;
}

export interface ParticipantMeta {
    location: 'home' | 'away';
    winner: boolean;
    position: number;
}