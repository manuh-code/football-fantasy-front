import { FootballTeamResponse } from "../team/FootballTeamResponse";
import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { TypeResponse } from "../type/TypeResponse";

export interface FootballLineupResponse {
    formation_field: string | null;
    formation_position: number | null;
    player_name: string | null;
    jersey_number: number | null;
    team: FootballTeamResponse | null;
    player: FootballPlayerResponse | null;
    position: TypeResponse | null;
    type: TypeResponse | null;
    detailed_position: TypeResponse | null;
}
