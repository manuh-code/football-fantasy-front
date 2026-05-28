import { UserDataInterface } from "../userInterface"
import { FantasyFootballPlayer } from "./FantasyFootballPlayersResponse";

export interface FantasyFootballPlayerVersusResponse {
    home_lineup: {
        user: UserDataInterface;
        players: FantasyFootballPlayer[]
    }
    away_lineup: {
        user: UserDataInterface;
        players: FantasyFootballPlayer[]
    }
}