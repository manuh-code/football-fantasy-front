import type { FootballPlayerResponse } from "@/interfaces/football/player/FootballPlayerResponse";

export type FantasyTradeStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

/**
 * Matches UserResource's fields that are always present (not behind
 * whenLoaded) — the trade's eager-load chain only loads proposer/receiver
 * themselves, not their nested football_league/favoriteFootballTeam/etc.
 */
export interface FantasyTradeUserResponse {
    uuid: string;
    firstname: string | null;
    lastname: string | null;
    fullname: string;
    phone: string | null;
    email: string | null;
    avatar: string | null;
}

export interface FantasyTradeResponse {
    uuid: string;
    status: FantasyTradeStatus;
    message: string | null;
    responded_at: string | null;
    created_at: string | null;
    proposer: FantasyTradeUserResponse;
    receiver: FantasyTradeUserResponse;
    /** Full FootballPlayerResource — position/country are typically absent (not eager-loaded for trades), avatar/name always are. */
    offered_players: FootballPlayerResponse[];
    requested_players: FootballPlayerResponse[];
}
