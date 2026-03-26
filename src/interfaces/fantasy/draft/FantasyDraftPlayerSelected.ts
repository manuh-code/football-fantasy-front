import { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";
import { UserDataInterface } from "@/interfaces/user/userInterface";
import { FantasyDraftPlayerSlot } from "@/interfaces/fantasy/draft/FantasyDraftPlayerSlot";

export interface FantasyDraftPlayerSelected {
    pick: number;
    round: number;
    user: UserDataInterface;
    player: FootballPlayerResponse;
    slot: FantasyDraftPlayerSlot;
    pickedAt: string;
}   