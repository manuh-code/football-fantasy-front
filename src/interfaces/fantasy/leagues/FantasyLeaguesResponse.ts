import { UserDataInterface } from "@/interfaces/user/userInterface";

export interface FantasyLeaguesResponse {
    uuid: string;
    name: string;
    participants_count: number;
    members_count: number;
    description: string;
    is_private: boolean;
    isMember: boolean;
    password: string | null;
    image_path: string;
    started_at: string; // ISO 8601 date string
    isAdmin: boolean;
    participants: UserDataInterface[];
}