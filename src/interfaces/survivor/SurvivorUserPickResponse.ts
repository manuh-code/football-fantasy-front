import { FootballTeamResponse } from "../football/team/FootballTeamResponse";

export interface SurvivorUserPick {
  id: bigint;
  result: string;
  is_pending: boolean;
  is_win: boolean;
  is_loss: boolean;
  is_draw: boolean;
  team: FootballTeamResponse;
}

// One entry per round of the survivor: the round metadata plus the team the
// user picked in it (`getMyPicksBySurvivorUuid`).
export interface SurvivorUserPickResponse {
  uuid: string;
  name: string;
  starting_at: string;
  finished: boolean;
  is_current: boolean;
  pick: SurvivorUserPick | null;
}
