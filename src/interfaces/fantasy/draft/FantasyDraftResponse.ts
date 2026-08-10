import { FantasyCatalogResponse } from "@/interfaces/catalog/fantasy/FantasyCatalogResponse";
import { FantasyDraftOrderResponse } from "./FantasyDraftOrderResponse";
import { FantasyDraftType } from "@/interfaces/fantasy/leagues/FantasyLeagueDraftPayload";

export interface FantasyDraftResponse {
    uuid: string,
    draft_day: string,
    pick_timer: number,
    draft_type: FantasyDraftType,
    status: FantasyCatalogResponse;
    draft_order: FantasyDraftOrderResponse[] | null;
}
