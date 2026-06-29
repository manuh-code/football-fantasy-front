import { FootballTeamResponse } from "./FootballTeamResponse";
import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { TypeResponse } from "../type/TypeResponse";
import { FootballFixtureResponse } from "../fixture/FootballFixtureResponse";
import { SidelinedPlayer } from "../player/SidelinedPlayerResponse";
import { FootballVenueResponse } from "../venue/FootballVenueResponse";

export interface TeamPlayerProfile {
    position: TypeResponse;
    detailed_position: TypeResponse;
    captain: boolean;
    jersey_number: number;
    player: FootballPlayerResponse;
}

export interface BestPlayerStatistic {
    type: TypeResponse;
    player: FootballPlayerResponse;
    value: string;
}

export interface BestPlayersGroup {
    type: string;
    stat_group: string;
    statistics: BestPlayerStatistic[];
}

export interface FootballTeamProfileResponse {
    team: FootballTeamResponse;
    next_fixture: FootballFixtureResponse | null;
    players: TeamPlayerProfile[];
    best_players: BestPlayersGroup[];
    venue: FootballVenueResponse;
    latest: FootballFixtureResponse[];
    sidelined: SidelinedPlayer[];
}
