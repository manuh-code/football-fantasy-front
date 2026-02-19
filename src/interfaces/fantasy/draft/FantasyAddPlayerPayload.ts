export interface FantasyAddPlayerPayload {
    fantasy_league_uuid: string;
    player_uuid: string;
    position_uuid: string;
    is_flex: boolean;
    is_starter: boolean;
}