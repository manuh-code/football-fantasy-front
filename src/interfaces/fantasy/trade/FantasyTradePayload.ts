export interface FantasyTradePayload {
    fantasy_league_uuid: string;
    receiver_user_uuid: string;
    offered_player_uuids: string[];
    requested_player_uuids: string[];
    message?: string;
}
