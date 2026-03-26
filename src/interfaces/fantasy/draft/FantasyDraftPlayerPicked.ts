import { UserDataInterface } from "@/interfaces/user/userInterface";
import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";

export interface FantasyDraftPlayerPicked {
      pick: number;
    round: number;
    player: FootballPlayerResponse;
    user: UserDataInterface;
 
}