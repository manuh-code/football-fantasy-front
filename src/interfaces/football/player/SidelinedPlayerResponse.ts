import { TypeResponse } from "../type/TypeResponse";
import { FootballPlayerResponse } from "./FootballPlayerResponse";

export interface SidelinedPlayer {
    category: string;
    start_date: string;
    end_date: string | null;
    games_missed: number;
    completed: boolean;
    type: TypeResponse;
    player: FootballPlayerResponse;
}