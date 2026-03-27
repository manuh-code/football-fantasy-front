import { UserDataInterface } from "@/interfaces/user/userInterface";

export interface FantasyDraftTurnSkipped {
    pick: number;
    user: UserDataInterface;
}