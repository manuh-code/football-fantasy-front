import { FootballLeagueResponse } from "../football/league/FootballLeagueResponse";
import { FootballTeamResponse } from "../football/team/FootballTeamResponse";

export interface UserDataInterface {
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    avatar: string;
    favoriteFootballTeam: FootballTeamResponse | null;
    football_league: FootballLeagueResponse | null;
}