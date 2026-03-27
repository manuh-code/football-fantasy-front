import { FantasyLeaguesResponse } from "../leagues/FantasyLeaguesResponse";

export interface FantasyDraftActivated {
    league_uuid: string;
    draft: string;
    started_at: string;
    fantasy_league: FantasyLeaguesResponse;
}