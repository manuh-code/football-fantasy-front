export interface FantasyPositionFormation {
    starter: number;
    uuid: string;
}

export interface FantasyLeagueFormationResponse {
    goalkeeper: FantasyPositionFormation;
    defender: FantasyPositionFormation;
    midfielder: FantasyPositionFormation;
    attacker: FantasyPositionFormation;
    flex: number;
    bench: number;
}