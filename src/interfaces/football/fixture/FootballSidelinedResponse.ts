import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "../player/FootballPlayerResponse";

export interface FootballSidelinedResponse {
    id: number;
    fixture_id: number;
    sideline_id: number | null;
    participant_id: number;
    player_id: number;
    type_id: number;
    sideline: string | null;
    player: FootballPlayerResponse;
    type: TypeResponse;
}
