import { UserDataInterface } from "@/interfaces/user/userInterface";
import { FantasyDraftResponse } from "../draft/FantasyDraftResponse";

export interface FantasyLeaguesResponse {
    uuid: string;
    name: string;
    participants_count: number;
    members_count: number | null;
    description: string;
    is_private: boolean;
    isMember: boolean | null;
    password: string | null;
    image_path: string;
    started_at: string; // ISO 8601 date string
    isAdmin: boolean | null;
    participants: UserDataInterface[] | null;
    draft: FantasyDraftResponse | null;
}