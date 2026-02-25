import { UserDataInterface } from "@/interfaces/user/userInterface";

export interface FantasyDraftOrderResponse {
    pick: number;
    round: number;
    pick_in_round: number;
    user : UserDataInterface;
}