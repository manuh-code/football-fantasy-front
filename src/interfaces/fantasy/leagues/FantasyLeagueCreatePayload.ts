import { FantasyLeagueDraftPayload } from "./FantasyLeagueDraftPayload";
import { FantasyChampionMode } from "../playoffs/FantasyPlayoffBracketResponse";

export interface FantasyLeagueCreatePayload {
    name: string;
    league_uuid: string;

    status_uuid?: string | null;
    participants_count?: number | null;

    /** Cómo se decide el campeón. Por defecto, el líder de la tabla. */
    champion_mode?: FantasyChampionMode | null;
    /** Cuántos clasifican al cuadro. Sólo se envía con champion_mode "playoffs". */
    playoff_teams?: number | null;
    description?: string | null;
    is_private?: boolean | null;
    image_path?: string | null;
    started_at?: string | null;
    draft?: FantasyLeagueDraftPayload | null;
}
