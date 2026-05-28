export interface LineupPlayerUpdatePayload {
    fantasy_round_uuid: string;
    lineup: LineupPlayer[];
}

export interface LineupPlayer {
    football_player_uuid: string;
    is_starter: boolean;
    is_flex: boolean;
}