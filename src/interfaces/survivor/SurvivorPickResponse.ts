import { FootballTeamResponse } from "../football/team/FootballTeamResponse";

export interface SurvivorPickResponse {
 
  result: string;
  is_pending: boolean;
  is_win: boolean;
  is_loss: boolean;
  is_draw: boolean;
  team: FootballTeamResponse | null;
}
