
import { FantasyCatalogResponse } from "@/interfaces/catalog/fantasy/FantasyCatalogResponse";
import { FantasyDraftOrderResponse } from "./FantasyDraftOrderResponse";

export interface FantasyDraftResponse {
    uuid: string,
    draft_day: string,
    pick_timer: number,
    status: FantasyCatalogResponse;
    draft_order: FantasyDraftOrderResponse[] | null;
}