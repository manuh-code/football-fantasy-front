
import { FantasyCatalogResponse } from "@/interfaces/catalog/fantasy/FantasyCatalogResponse";

export interface FantasyDraftResponse {
    uuid: string,
    draft_day: string,
    pick_time: number,
    status: FantasyCatalogResponse;
}