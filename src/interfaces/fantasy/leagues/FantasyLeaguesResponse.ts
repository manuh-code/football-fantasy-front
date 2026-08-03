import { UserDataInterface } from "@/interfaces/user/userInterface";
import { FantasyDraftResponse } from "../draft/FantasyDraftResponse";
import { FantasyLeagueScoringRules } from "./FantasyLeagueScoringRules";
import { FantasyLeagueFormationResponse } from "./FantasyLeagueFormationResponse";
import { FantasyChampionMode } from "../playoffs/FantasyPlayoffBracketResponse";
import { FantasyTeamData } from "../team/FantasyUserTeamResponse";

export interface FantasyLeaguesResponse {
    uuid: string;
    name: string;
    current_football_season_uuid: string;
    participants_count: number;
    champion_mode: FantasyChampionMode;
    /** Cuántos clasifican al cuadro; null cuando el campeón sale de la tabla. */
    playoff_teams: number | null;
    /** Se rellena al cerrar la última jornada (o la final). */
    champion: FantasyTeamData | null;
    members_count: number | null;
    description: string;
    is_private: boolean;
    isMember: boolean | null;
    show_create_team: boolean | null;
    password: string | null;
    image_path: string;
    started_at: string; // ISO 8601 date string
    isAdmin: boolean | null;
    participants: UserDataInterface[] | null;
    scoring_rules: FantasyLeagueScoringRules[] | null;
    draft: FantasyDraftResponse | null;
    formation: FantasyLeagueFormationResponse | null;
}