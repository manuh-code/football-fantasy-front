import { UserDataInterface } from "@/interfaces/user/userInterface";
import { FantasyDraftResponse } from "../draft/FantasyDraftResponse";
import { FantasyLeagueScoringRules } from "./FantasyLeagueScoringRules";
import { FantasyLeagueFormationResponse } from "./FantasyLeagueFormationResponse";

export interface FantasyLeaguesResponse {
    uuid: string;
    name: string;
    current_football_season_uuid: string;
    participants_count: number;
    members_count: number | null;
    description: string;
    is_private: boolean;
    isMember: boolean | null;
    password: string | null;
    image_path: string;
    started_at: string; // ISO 8601 date string
    isAdmin: boolean | null;
    participants: UserDataInterface[] | null;
    scoring_rules: FantasyLeagueScoringRules[] | null;
    draft: FantasyDraftResponse | null;
    formation: FantasyLeagueFormationResponse | null;
}