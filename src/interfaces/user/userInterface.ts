import { FootballLeagueResponse } from "../football/league/FootballLeagueResponse";
import { FootballTeamResponse } from "../football/team/FootballTeamResponse";

export interface UserDataInterface {
    uuid: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    favoriteFootballTeam: FootballTeamResponse | null;
    football_league: FootballLeagueResponse | null;
}