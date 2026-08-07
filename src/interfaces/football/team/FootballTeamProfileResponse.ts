import { FootballTeamResponse } from "./FootballTeamResponse";
import { FootballPlayerResponse } from "../player/FootballPlayerResponse";
import { RankedPlayer } from "../player/FootballPlayerStatisticByStageResponse";
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
    player: RankedPlayer;
    value: string;
}

export interface BestPlayersGroup {
    key: string;
    /** Translated label; the ranked entries no longer repeat it. */
    type: string;
    stat_group: string;
    stat_group_key: string;
    total: number;
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
